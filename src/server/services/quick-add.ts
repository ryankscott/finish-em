import type { Day } from "date-fns";
import { addDays, addWeeks, isValid, nextDay, parseISO, set } from "date-fns";
import type { Db } from "@/server/db/types";
import { getInboxProjectId, listProjects } from "@/server/repos/projects";
import { createTask } from "@/server/repos/tasks";
import { validateRRuleSubset } from "@/server/services/recurrence";

import type { Priority, Task } from "@/server/types";

// Maps the leading letters of a weekday name to its date-fns day index (Sun=0)
// and its RRULE BYDAY token.
const WEEKDAYS: Record<string, { index: Day; byDay: string }> = {
	sun: { index: 0, byDay: "SU" },
	mon: { index: 1, byDay: "MO" },
	tue: { index: 2, byDay: "TU" },
	wed: { index: 3, byDay: "WE" },
	thu: { index: 4, byDay: "TH" },
	fri: { index: 5, byDay: "FR" },
	sat: { index: 6, byDay: "SA" },
};

function matchWeekday(word: string): { index: Day; byDay: string } | null {
	const key = word.slice(0, 3).toLowerCase();
	return WEEKDAYS[key] ?? null;
}

// A shared fragment describing every relative/absolute date phrase the parser
// understands, with an optional "at <time>" suffix. Reused by the due and
// scheduled matchers so bare phrases like "tomorrow" are recognised without a
// "due"/"scheduled" keyword.
const WEEKDAY_NAMES =
	"(?:mon|tue|wed|thu|fri|sat|sun)(?:day|s|nesday|rsday|urday)?";
export const DATE_PHRASE_SOURCE = `(?:today|tomorrow|next week|(?:next|this)\\s+${WEEKDAY_NAMES}|in\\s+\\d+\\s+(?:days?|weeks?)|\\d+\\s+(?:days?|weeks?)\\s+from\\s+now|\\d{4}-\\d{2}-\\d{2})(?:\\s+at\\s+\\d{1,2}(?::\\d{2})?\\s*(?:am|pm)?)?`;

export type QuickAddParseResult = {
	raw: string;
	title: string;
	projectName: string | null;
	priority: Priority | null;
	dueAt: string | null;
	scheduledAt: string | null;
	dueTimezone: string | null;
	recurrencePreset: "daily" | "weekly" | "monthly" | "every_weekday" | null;
	recurrenceRRule: string | null;
	warnings: string[];
	source: "deterministic";
	confidence: number;
};

function parseDatePhrase(value: string): string | null {
	const text = value.trim().toLowerCase();
	const now = new Date();

	const atMatch = text.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
	let hour: number | null = null;
	let minute = 0;

	if (atMatch) {
		hour = Number(atMatch[1]);
		minute = atMatch[2] ? Number(atMatch[2]) : 0;
		const meridian = atMatch[3];

		if (meridian === "pm" && hour < 12) {
			hour += 12;
		}
		if (meridian === "am" && hour === 12) {
			hour = 0;
		}
	}

	const normalized = text.replace(/\s+at\s+.+$/, "").trim();

	const assignTime = (date: Date) => {
		if (hour === null) {
			return set(date, {
				hours: 9,
				minutes: 0,
				seconds: 0,
				milliseconds: 0,
			}).toISOString();
		}
		return set(date, {
			hours: hour,
			minutes: minute,
			seconds: 0,
			milliseconds: 0,
		}).toISOString();
	};

	if (normalized === "today") {
		return assignTime(now);
	}

	if (normalized === "tomorrow") {
		return assignTime(addDays(now, 1));
	}

	if (normalized === "next week") {
		return assignTime(addWeeks(now, 1));
	}

	// "next monday" / "this friday" → the nearest upcoming occurrence of that
	// weekday. Both forms resolve the same way to stay predictable.
	const weekdayMatch = normalized.match(/^(?:next|this)\s+([a-z]+)$/);
	if (weekdayMatch) {
		const weekday = matchWeekday(weekdayMatch[1]);
		if (weekday) {
			return assignTime(nextDay(now, weekday.index));
		}
	}

	// "in 3 days" / "in 2 weeks"
	const inMatch = normalized.match(/^in\s+(\d+)\s+(day|days|week|weeks)$/);
	if (inMatch) {
		const amount = Number(inMatch[1]);
		const unit = inMatch[2];
		return assignTime(
			unit.startsWith("week") ? addWeeks(now, amount) : addDays(now, amount),
		);
	}

	// "3 days from now" / "2 weeks from now"
	const fromNowMatch = normalized.match(
		/^(\d+)\s+(day|days|week|weeks)\s+from\s+now$/,
	);
	if (fromNowMatch) {
		const amount = Number(fromNowMatch[1]);
		const unit = fromNowMatch[2];
		return assignTime(
			unit.startsWith("week") ? addWeeks(now, amount) : addDays(now, amount),
		);
	}

	const explicitDate = normalized.match(/(\d{4}-\d{2}-\d{2})$/);
	if (explicitDate) {
		const date = parseISO(explicitDate[1]);
		if (isValid(date)) {
			if (hour !== null) {
				return set(date, {
					hours: hour,
					minutes: minute,
					seconds: 0,
					milliseconds: 0,
				}).toISOString();
			}
			return set(date, {
				hours: 9,
				minutes: 0,
				seconds: 0,
				milliseconds: 0,
			}).toISOString();
		}
	}

	return null;
}

function stripToken(text: string, token: string) {
	return text
		.replace(token, "")
		.replace(/\s{2,}/g, " ")
		.trim();
}

function deterministicParse(rawInput: string): QuickAddParseResult {
	const warnings: string[] = [];
	let working = rawInput.trim();

	const priorityMatch = working.match(/\bp([1-4])\b/i);
	const priority = priorityMatch
		? (Number(priorityMatch[1]) as Priority)
		: null;
	if (priorityMatch) {
		working = stripToken(working, priorityMatch[0]);
	}

	const projectMatch = working.match(/#([\w-]+)/);
	const projectName = projectMatch ? projectMatch[1] : null;
	if (projectMatch) {
		working = stripToken(working, projectMatch[0]);
	}

	let recurrencePreset: QuickAddParseResult["recurrencePreset"] = null;
	let recurrenceRRule: string | null = null;

	// Inline recurrence, checked most-specific first. "every weekday" is a named
	// preset; "every <weekday>" and "every N days/weeks/months" build an RRULE.
	const everyWeekdayMatch = working.match(
		/\bevery\s+([a-z]+day|mon|tue|wed|thu|fri|sat|sun)\b/i,
	);
	const everyNMatch = working.match(
		/\bevery\s+(\d+)\s+(day|days|week|weeks|month|months)\b/i,
	);

	if (/\bevery weekday\b/i.test(working)) {
		recurrencePreset = "every_weekday";
		working = working.replace(/\bevery weekday\b/i, "").trim();
	} else if (everyWeekdayMatch && matchWeekday(everyWeekdayMatch[1])) {
		const weekday = matchWeekday(everyWeekdayMatch[1]);
		if (weekday) {
			recurrenceRRule = `FREQ=WEEKLY;INTERVAL=1;BYDAY=${weekday.byDay}`;
			working = working.replace(everyWeekdayMatch[0], "").trim();
		}
	} else if (everyNMatch) {
		const interval = Number(everyNMatch[1]);
		const unit = everyNMatch[2].toLowerCase();
		const freq = unit.startsWith("week")
			? "WEEKLY"
			: unit.startsWith("month")
				? "MONTHLY"
				: "DAILY";
		recurrenceRRule = `FREQ=${freq};INTERVAL=${interval}`;
		working = working.replace(everyNMatch[0], "").trim();
	} else if (/\bevery day\b|\bdaily\b/i.test(working)) {
		recurrencePreset = "daily";
		working = working.replace(/\bevery day\b|\bdaily\b/i, "").trim();
	} else if (/\bevery week\b|\bweekly\b/i.test(working)) {
		recurrencePreset = "weekly";
		working = working.replace(/\bevery week\b|\bweekly\b/i, "").trim();
	} else if (/\bevery month\b|\bmonthly\b/i.test(working)) {
		recurrencePreset = "monthly";
		working = working.replace(/\bevery month\b|\bmonthly\b/i, "").trim();
	} else {
		const rruleMatch = working.match(/\brrule:([^\n]+)$/i);
		if (rruleMatch) {
			const candidate = rruleMatch[1].trim().toUpperCase();
			if (validateRRuleSubset(candidate)) {
				recurrenceRRule = candidate;
				working = working.replace(rruleMatch[0], "").trim();
			} else {
				warnings.push("RRULE did not match supported subset");
			}
		}
	}

	let scheduledAt: string | null = null;
	const scheduleMatch = working.match(
		new RegExp(`\\b(start|scheduled)\\s+(${DATE_PHRASE_SOURCE})`, "i"),
	);
	if (scheduleMatch) {
		scheduledAt = parseDatePhrase(scheduleMatch[2]);
		working = working.replace(scheduleMatch[0], "").trim();
	}

	let dueAt: string | null = null;
	const dueMatch = working.match(
		new RegExp(`\\b(due\\s+)?(${DATE_PHRASE_SOURCE})`, "i"),
	);
	if (dueMatch) {
		dueAt = parseDatePhrase(dueMatch[2]);
		working = working.replace(dueMatch[0], "").trim();
	}

	const title = working.trim() || rawInput.trim();
	let confidence = 0.7;

	if (title.length < 3) {
		confidence -= 0.3;
		warnings.push("Title appears too short");
	}

	if (
		!dueAt &&
		!scheduledAt &&
		!recurrencePreset &&
		!recurrenceRRule &&
		!projectName &&
		!priority
	) {
		confidence -= 0.25;
	}

	return {
		raw: rawInput,
		title,
		projectName,
		priority,
		dueAt,
		scheduledAt,
		dueTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
		recurrencePreset,
		recurrenceRRule,
		warnings,
		source: "deterministic",
		confidence: Math.max(0.1, Math.min(1, confidence)),
	};
}

export async function parseQuickAdd(rawInput: string) {
	return deterministicParse(rawInput);
}

export async function createTaskFromQuickAdd(
	db: Db,
	rawInput: string,
	options?: { parentTaskId?: number | null },
): Promise<{
	parse: QuickAddParseResult;
	task: Task;
}> {
	const parsed = await parseQuickAdd(rawInput);
	const projects = await listProjects(db);
	const project = parsed.projectName
		? projects.find(
				(candidate) =>
					candidate.name.toLowerCase() === parsed.projectName?.toLowerCase(),
			)
		: null;

	const projectId = project?.id ?? (await getInboxProjectId(db));

	const task = await createTask(db, {
		projectId,
		parentTaskId: options?.parentTaskId,
		title: parsed.title,
		priority: parsed.priority ?? 4,
		dueAt: parsed.dueAt,
		scheduledAt: parsed.scheduledAt,
		dueTimezone: parsed.dueTimezone,
		recurrencePreset: parsed.recurrencePreset,
		recurrenceRRule: parsed.recurrenceRRule,
	});

	return { parse: parsed, task };
}
