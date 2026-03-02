import {
	addDays,
	addWeeks,
	format,
	isValid,
	nextDay,
	parseISO,
	set,
	startOfDay,
} from "date-fns";

import type { Priority, Project, RecurrencePreset } from "../server/types";

export type TaskEditPatch = {
	title?: string;
	notes?: string;
	projectId?: number;
	parentTaskId?: number | null;
	priority?: Priority;
	dueAt?: string | null;
	scheduledAt?: string | null;
	dueTimezone?: string;
	recurrencePreset?: RecurrencePreset;
	recurrenceRRule?: string | null;
};

export type ParseTaskEditResult = {
	patch: TaskEditPatch;
	warnings: string[];
};

const KNOWN_PRESETS: Record<string, Exclude<RecurrencePreset, null>> = {
	daily: "daily",
	weekly: "weekly",
	monthly: "monthly",
	yearly: "yearly",
	every_weekday: "every_weekday",
};

// Maps day names to date-fns Day values (0=Sun, 1=Mon, …, 6=Sat)
const DAY_NAMES: Record<string, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
	sunday: 0,
	monday: 1,
	tuesday: 2,
	wednesday: 3,
	thursday: 4,
	friday: 5,
	saturday: 6,
};

function parseDatePhrase(phrase: string): string | null {
	const text = phrase.trim().toLowerCase();
	const now = new Date();

	if (text === "today") {
		return set(now, { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString();
	}

	if (text === "tomorrow") {
		return set(addDays(now, 1), { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString();
	}

	if (text === "next week") {
		return set(addWeeks(now, 1), { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString();
	}

	if (text === "none" || text === "never" || text === "clear") {
		return null;
	}

	const dayIndex = DAY_NAMES[text];
	if (dayIndex !== undefined) {
		const today = startOfDay(now);
		// nextDay always returns the next occurrence >= tomorrow
		const next = nextDay(today, dayIndex);
		return set(next, { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString();
	}

	// DD/MM/YY or DD/MM/YYYY
	const slashMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
	if (slashMatch) {
		const day = Number(slashMatch[1]);
		const month = Number(slashMatch[2]) - 1;
		let year = Number(slashMatch[3]);
		if (year < 100) year += 2000;
		const date = new Date(year, month, day);
		if (isValid(date)) {
			return set(date, { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString();
		}
	}

	// YYYY-MM-DD
	const isoMatch = text.match(/^(\d{4}-\d{2}-\d{2})$/);
	if (isoMatch) {
		const date = parseISO(isoMatch[1]);
		if (isValid(date)) {
			return set(date, { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString();
		}
	}

	return undefined as unknown as null; // signal: unrecognised
}

// Known token prefixes used to delimit multi-word project names and notes
const TOKEN_PREFIXES = [
	"due:",
	"scheduled:",
	"sch:",
	"recurs:",
	"rec:",
	"recurrence:",
	"project:",
	"proj:",
	"parent:",
	"notes:",
	"🚩",
	"🔁",
	"🗓",
	"⏰",
	"📁",
];

/**
 * Extracts a colon-delimited token value from `input` starting at `startIndex`
 * (right after the colon). Reads until the next known token prefix or end of string.
 * Returns [value, endIndex].
 */
function extractTokenValue(input: string, startIndex: number): [string, number] {
	let end = input.length;

	for (const prefix of TOKEN_PREFIXES) {
		// Look for the prefix after startIndex (leave at least one char gap)
		let pos = startIndex;
		while (pos < input.length) {
			const idx = input.indexOf(prefix, pos);
			if (idx === -1) break;
			// Must be preceded by whitespace or be at the start
			if (idx > 0 && input[idx - 1] !== " ") {
				pos = idx + 1;
				continue;
			}
			if (idx < end) end = idx;
			break;
		}
	}

	// Also stop at priority token (e.g. " p1 " or " p1" at end)
	const prioritySearch = input.slice(startIndex);
	const prioMatch = prioritySearch.match(/\s+p[1-4](?:\s|$)/);
	if (prioMatch?.index !== undefined) {
		const prioIdx = startIndex + prioMatch.index;
		if (prioIdx < end) end = prioIdx;
	}

	return [input.slice(startIndex, end).trim(), end];
}

export function parseTaskEditInput(
	input: string,
	projects: Project[],
): ParseTaskEditResult {
	const warnings: string[] = [];
	const patch: TaskEditPatch = {};

	let working = input.trim();

	// --- priority: p1–p4, priority:1, prio:1, 🚩1 ---
	const priorityMatch = working.match(
		/(?:\bp([1-4])\b|\bpriority\s*:\s*p?([1-4])\b|\bprio\s*:\s*p?([1-4])\b|🚩\s*([1-4]))/i,
	);
	if (priorityMatch) {
		const value = priorityMatch[1] ?? priorityMatch[2] ?? priorityMatch[3] ?? priorityMatch[4];
		patch.priority = Number(value) as Priority;
		working = working.replace(priorityMatch[0], "").replace(/\s{2,}/g, " ").trim();
	}

	// --- recurs:<preset>, rec:<preset>, recurrence:<preset>, 🔁 <preset> ---
	const recursMatch = working.match(
		/(?:\brecurs:\s*([\w_]+)|\brec:\s*([\w_]+)|\brecurrence:\s*([\w_]+)|🔁\s*([\w_]+))/i,
	);
	if (recursMatch) {
		const rawPreset = recursMatch[1] ?? recursMatch[2] ?? recursMatch[3] ?? recursMatch[4];
		const presetKey = rawPreset.toLowerCase();
		if (presetKey === "none" || presetKey === "never" || presetKey === "clear") {
			patch.recurrencePreset = null;
			patch.recurrenceRRule = null;
		} else if (KNOWN_PRESETS[presetKey]) {
			patch.recurrencePreset = KNOWN_PRESETS[presetKey];
		} else {
			warnings.push(`Unknown recurrence preset "${rawPreset}". Use: daily, weekly, monthly, yearly, every_weekday, none`);
		}
		working = working.replace(recursMatch[0], "").replace(/\s{2,}/g, " ").trim();
	}

	// --- due:<datePhrase>, ⏰ <datePhrase> ---
	const dueMatch = working.match(/(?:\bdue:|⏰\s*)/i);
	if (dueMatch && dueMatch.index !== undefined) {
		const valueStart = dueMatch.index + dueMatch[0].length;
		const [phrase, end] = extractTokenValue(working, valueStart);
		const parsed = parseDatePhrase(phrase);
		if (parsed === undefined) {
			warnings.push(`Unrecognised due date "${phrase}". Use: today, tomorrow, next week, monday–sunday, DD/MM/YY, YYYY-MM-DD, none`);
		} else {
			patch.dueAt = parsed;
			if (parsed !== null) {
				patch.dueTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
			}
		}
		working = (working.slice(0, dueMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	// --- scheduled:<datePhrase>, sch:<datePhrase>, 🗓 <datePhrase> ---
	const scheduledMatch = working.match(/(?:\bscheduled:|\bsch:|🗓\s*)/i);
	if (scheduledMatch && scheduledMatch.index !== undefined) {
		const valueStart = scheduledMatch.index + scheduledMatch[0].length;
		const [phrase, end] = extractTokenValue(working, valueStart);
		const parsed = parseDatePhrase(phrase);
		if (parsed === undefined) {
			warnings.push(`Unrecognised scheduled date "${phrase}". Use: today, tomorrow, next week, monday–sunday, DD/MM/YY, YYYY-MM-DD, none`);
		} else {
			patch.scheduledAt = parsed;
		}
		working = (working.slice(0, scheduledMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	// --- project:<name>, proj:<name>, 📁 <name> ---
	const projectMatch = working.match(/(?:\bproject:|\bproj:|📁\s*)/i);
	if (projectMatch && projectMatch.index !== undefined) {
		const valueStart = projectMatch.index + projectMatch[0].length;
		const [name] = extractTokenValue(working, valueStart);
		const valueEnd = valueStart + name.length;
		if (name.length === 0) {
			warnings.push("Empty project name after \"project:\"");
		} else {
			const found = projects.find(
				(p) => p.name.toLowerCase() === name.toLowerCase(),
			);
			if (found) {
				patch.projectId = found.id;
			} else {
				warnings.push(`Project "${name}" not found`);
			}
		}
		working = (working.slice(0, projectMatch.index) + working.slice(valueEnd)).replace(/\s{2,}/g, " ").trim();
	}

	// --- parent:<taskId|none> ---
	const parentMatch = working.match(/\bparent:/i);
	if (parentMatch && parentMatch.index !== undefined) {
		const valueStart = parentMatch.index + parentMatch[0].length;
		const [parentValue, end] = extractTokenValue(working, valueStart);
		const normalized = parentValue.trim().toLowerCase();

		if (["none", "clear", "null"].includes(normalized)) {
			patch.parentTaskId = null;
		} else {
			const asNumber = Number(normalized);
			if (Number.isInteger(asNumber) && asNumber > 0) {
				patch.parentTaskId = asNumber;
			} else {
				warnings.push(`Invalid parent value "${parentValue}". Use: parent:<taskId> or parent:none`);
			}
		}

		working = (working.slice(0, parentMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	// --- notes: (rest of line; can contain links and spaces) ---
	const notesMatch = working.match(/\bnotes:/i);
	if (notesMatch && notesMatch.index !== undefined) {
		patch.notes = working.slice(notesMatch.index + notesMatch[0].length).trim();
		working = working.slice(0, notesMatch.index).replace(/\s+$/, "").trim();
	}

	const title = working.trim();
	if (title.length > 0) {
		patch.title = title;
	}

	return { patch, warnings };
}

/**
 * Serialises a task's current properties into the edit-input syntax so the
 * user sees what they're editing when they press `e`.
 */
export function serializeTaskToEditInput(
	title: string,
	opts: {
		projectName?: string;
		parentTaskId?: number | null;
		priority?: Priority;
		dueAt?: string | null;
		scheduledAt?: string | null;
		recurrencePreset?: RecurrencePreset;
		notes?: string;
	},
): string {
	const parts: string[] = [title];

	if (opts.projectName) {
		parts.push(`📁 ${opts.projectName}`);
	}
	if (opts.parentTaskId !== undefined && opts.parentTaskId !== null) {
		parts.push(`parent:${opts.parentTaskId}`);
	}
	if (opts.priority && opts.priority !== 4) {
		parts.push(`🚩${opts.priority}`);
	}
	if (opts.dueAt) {
		parts.push(`⏰ ${format(parseISO(opts.dueAt), "yyyy-MM-dd")}`);
	}
	if (opts.scheduledAt) {
		parts.push(`🗓 ${format(parseISO(opts.scheduledAt), "yyyy-MM-dd")}`);
	}
	if (opts.recurrencePreset) {
		parts.push(`🔁 ${opts.recurrencePreset}`);
	}
	if (opts.notes !== undefined && opts.notes !== "") {
		parts.push(`notes:${opts.notes}`);
	}

	return parts.join(" ");
}
