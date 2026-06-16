import { addDays, addWeeks, isValid, parseISO, set } from "date-fns";
import { z } from "zod/v3";
import { getInboxProjectId, listProjects } from "@/server/repos/projects";
import { createTask } from "@/server/repos/tasks";
import { validateRRuleSubset } from "@/server/services/recurrence";

import type { Priority, Task } from "@/server/types";

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
	source: "deterministic" | "ai";
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

	if (/\bevery weekday\b/i.test(working)) {
		recurrencePreset = "every_weekday";
		working = working.replace(/\bevery weekday\b/i, "").trim();
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
		/\b(start|scheduled)\s+(today|tomorrow|next week|\d{4}-\d{2}-\d{2}(?:\s+at\s+.+)?)/i,
	);
	if (scheduleMatch) {
		scheduledAt = parseDatePhrase(scheduleMatch[2]);
		working = working.replace(scheduleMatch[0], "").trim();
	}

	let dueAt: string | null = null;
	const dueMatch = working.match(
		/\b(due\s+)?(today|tomorrow|next week|\d{4}-\d{2}-\d{2}(?:\s+at\s+.+)?)/i,
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

async function parseWithAiFallback(
	rawInput: string,
	deterministic: QuickAddParseResult,
): Promise<QuickAddParseResult | null> {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		return null;
	}

	const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
	const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

	const prompt = `Extract todo fields from this input: ${rawInput}`;

	try {
		const [aiModule, openAiModule] = await Promise.all([
			import("ai") as Promise<unknown>,
			import("@ai-sdk/openai") as Promise<unknown>,
		]);

		const { generateObject } = aiModule as {
			generateObject: (input: {
				model: unknown;
				schema: unknown;
				system: string;
				prompt: string;
				temperature: number;
			}) => Promise<{ object: Record<string, unknown> }>;
		};

		const { createOpenAI } = openAiModule as {
			createOpenAI: (options: {
				apiKey: string;
				baseURL: string;
				compatibility: "compatible";
			}) => (modelName: string) => unknown;
		};

		const provider = createOpenAI({
			apiKey,
			baseURL: baseUrl,
			compatibility: "compatible",
		});

		const schema = z.object({
			title: z.string().optional(),
			projectName: z.string().nullable().optional(),
			priority: z.number().int().min(1).max(4).nullable().optional(),
			dueAt: z.string().nullable().optional(),
			scheduledAt: z.string().nullable().optional(),
			recurrencePreset: z
				.enum(["daily", "weekly", "monthly", "every_weekday"])
				.nullable()
				.optional(),
			recurrenceRRule: z.string().nullable().optional(),
			warnings: z.array(z.string()).optional(),
		});

		const result = await generateObject({
			model: provider(model),
			schema,
			system:
				"Extract task attributes and return JSON. Prefer null for unknown values. Keep dates as ISO strings when possible.",
			prompt,
			temperature: 0,
		});

		const parsed = result.object as Partial<QuickAddParseResult>;

		return {
			...deterministic,
			title: parsed.title?.trim() || deterministic.title,
			projectName: parsed.projectName ?? deterministic.projectName,
			priority:
				parsed.priority && [1, 2, 3, 4].includes(Number(parsed.priority))
					? (Number(parsed.priority) as Priority)
					: deterministic.priority,
			dueAt: parsed.dueAt ?? deterministic.dueAt,
			scheduledAt: parsed.scheduledAt ?? deterministic.scheduledAt,
			recurrencePreset:
				parsed.recurrencePreset ?? deterministic.recurrencePreset,
			recurrenceRRule: parsed.recurrenceRRule ?? deterministic.recurrenceRRule,
			warnings: [
				...deterministic.warnings,
				...(parsed.warnings ?? []).map((warning) => String(warning)),
			],
			source: "ai",
			confidence: 0.9,
		};
	} catch {
		return null;
	}
}

export async function parseQuickAdd(rawInput: string) {
	const deterministic = deterministicParse(rawInput);

	if (deterministic.confidence >= 0.6) {
		return deterministic;
	}

	const aiResult = await parseWithAiFallback(rawInput, deterministic);
	if (!aiResult) {
		return {
			...deterministic,
			warnings: [...deterministic.warnings, "AI fallback unavailable"],
		};
	}

	return aiResult;
}

export async function createTaskFromQuickAdd(
	rawInput: string,
	options?: { parentTaskId?: number | null },
): Promise<{
	parse: QuickAddParseResult;
	task: Task;
}> {
	const parsed = await parseQuickAdd(rawInput);
	const projects = listProjects();
	const project = parsed.projectName
		? projects.find(
				(candidate) =>
					candidate.name.toLowerCase() === parsed.projectName?.toLowerCase(),
			)
		: null;

	const projectId = project?.id ?? getInboxProjectId();

	const task = createTask({
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
