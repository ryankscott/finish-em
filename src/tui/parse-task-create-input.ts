import {
	addDays,
	addWeeks,
	isValid,
	nextDay,
	parseISO,
	set,
	startOfDay,
} from "date-fns";

import type { Priority, Project, RecurrencePreset } from "../server/types";

type TaskCreateInput = {
	title: string;
	projectId?: number;
	parentTaskId?: number | null;
	notes?: string;
	priority?: Priority;
	scheduledAt?: string | null;
	dueAt?: string | null;
	dueTimezone?: string;
	recurrencePreset?: RecurrencePreset;
	recurrenceRRule?: string | null;
};

export type ParseTaskCreateResult = {
	input: Partial<TaskCreateInput>;
	warnings: string[];
	errors: string[];
	usedTokens: boolean;
};

const DAY_NAMES: Record<string, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
	sunday: 0,
	monday: 1,
	tuesday: 2,
	wednesday: 3,
	thursday: 4,
	friday: 5,
	saturday: 6,
};

const KNOWN_PRESETS: Record<string, Exclude<RecurrencePreset, null>> = {
	daily: "daily",
	weekly: "weekly",
	monthly: "monthly",
	yearly: "yearly",
	every_weekday: "every_weekday",
};

const TOKEN_PREFIXES = [
	"title:",
	"project:",
	"priority:",
	"due:",
	"scheduled:",
	"notes:",
	"parent:",
	"recurs:",
];

function parseDatePhrase(phrase: string): string | null | undefined {
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
		const next = nextDay(today, dayIndex);
		return set(next, { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString();
	}

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

	const isoMatch = text.match(/^(\d{4}-\d{2}-\d{2})$/);
	if (isoMatch) {
		const date = parseISO(isoMatch[1]);
		if (isValid(date)) {
			return set(date, { hours: 9, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString();
		}
	}

	return undefined;
}

function extractTokenValue(input: string, startIndex: number): [string, number] {
	let end = input.length;

	for (const prefix of TOKEN_PREFIXES) {
		let pos = startIndex;
		while (pos < input.length) {
			const idx = input.toLowerCase().indexOf(prefix, pos);
			if (idx === -1) break;
			if (idx > 0 && input[idx - 1] !== " ") {
				pos = idx + 1;
				continue;
			}
			if (idx < end) end = idx;
			break;
		}
	}

	const pTokenSearch = input.slice(startIndex);
	const pTokenMatch = pTokenSearch.match(/\s+p[1-4](?:\s|$)/i);
	if (pTokenMatch?.index !== undefined) {
		const pIdx = startIndex + pTokenMatch.index;
		if (pIdx < end) end = pIdx;
	}

	return [input.slice(startIndex, end).trim(), end];
}

function parsePriorityValue(value: string): Priority | undefined {
	const normalized = value.trim().toLowerCase();
	if (normalized.startsWith("p")) {
		const maybe = Number(normalized.slice(1));
		if (maybe >= 1 && maybe <= 4) return maybe as Priority;
	}
	const asNumber = Number(normalized);
	if (asNumber >= 1 && asNumber <= 4) {
		return asNumber as Priority;
	}
	return undefined;
}

export function parseTaskCreateInput(
	input: string,
	projects: Project[],
): ParseTaskCreateResult {
	const warnings: string[] = [];
	const errors: string[] = [];
	const trimmed = input.trim();

	if (trimmed.length === 0) {
		return {
			input: {},
			warnings,
			errors: ["Task title is required"],
			usedTokens: false,
		};
	}

	const usedTokens = /(\btitle:|\bproject:|\bpriority:|\bdue:|\bscheduled:|\bnotes:|\bparent:|\brecurs:|\bp[1-4]\b)/i.test(trimmed);
	if (!usedTokens) {
		return {
			input: { title: trimmed },
			warnings,
			errors,
			usedTokens: false,
		};
	}

	let working = trimmed;
	const result: Partial<TaskCreateInput> = {};

	const unknownTokens = [...trimmed.matchAll(/\b([a-z_]+):/gi)]
		.map((match) => match[1]?.toLowerCase())
		.filter((key) => key && !["title", "project", "priority", "due", "scheduled", "notes", "parent", "recurs"].includes(key));
	for (const unknown of unknownTokens) {
		warnings.push(`Unrecognized token "${unknown}:"`);
	}

	const priorityTokenMatch = working.match(/\bp([1-4])\b/i);
	if (priorityTokenMatch) {
		result.priority = Number(priorityTokenMatch[1]) as Priority;
		working = working.replace(priorityTokenMatch[0], "").replace(/\s{2,}/g, " ").trim();
	}

	const titleMatch = working.match(/\btitle:/i);
	if (titleMatch && titleMatch.index !== undefined) {
		const valueStart = titleMatch.index + titleMatch[0].length;
		const [value, end] = extractTokenValue(working, valueStart);
		if (value.trim().length > 0) {
			result.title = value.trim();
		}
		working = (working.slice(0, titleMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	const notesMatch = working.match(/\bnotes:/i);
	if (notesMatch && notesMatch.index !== undefined) {
		const valueStart = notesMatch.index + notesMatch[0].length;
		const [value, end] = extractTokenValue(working, valueStart);
		if (value.trim().length > 0) {
			result.notes = value.trim();
		}
		working = (working.slice(0, notesMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	const projectMatch = working.match(/\bproject:/i);
	if (projectMatch && projectMatch.index !== undefined) {
		const valueStart = projectMatch.index + projectMatch[0].length;
		const [name, end] = extractTokenValue(working, valueStart);
		if (name.length === 0) {
			warnings.push('Empty project name after "project:"');
		} else {
			const found = projects.find((project) => project.name.toLowerCase() === name.toLowerCase());
			if (found) {
				result.projectId = found.id;
			} else {
				warnings.push(`Project "${name}" not found`);
			}
		}
		working = (working.slice(0, projectMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	const priorityMatch = working.match(/\bpriority:/i);
	if (priorityMatch && priorityMatch.index !== undefined) {
		const valueStart = priorityMatch.index + priorityMatch[0].length;
		const [value, end] = extractTokenValue(working, valueStart);
		const priority = parsePriorityValue(value);
		if (!priority) {
			errors.push('priority must be 1-4 (or p1-p4)');
		} else {
			result.priority = priority;
		}
		working = (working.slice(0, priorityMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	const recursMatch = working.match(/\brecurs:([\w_]+)/i);
	if (recursMatch) {
		const presetKey = recursMatch[1].toLowerCase();
		if (presetKey === "none" || presetKey === "never" || presetKey === "clear") {
			result.recurrencePreset = null;
			result.recurrenceRRule = null;
		} else if (KNOWN_PRESETS[presetKey]) {
			result.recurrencePreset = KNOWN_PRESETS[presetKey];
		} else {
			errors.push(`Unknown recurrence preset "${recursMatch[1]}"`);
		}
		working = working.replace(recursMatch[0], "").replace(/\s{2,}/g, " ").trim();
	}

	const dueMatch = working.match(/\bdue:/i);
	if (dueMatch && dueMatch.index !== undefined) {
		const valueStart = dueMatch.index + dueMatch[0].length;
		const [phrase, end] = extractTokenValue(working, valueStart);
		const parsed = parseDatePhrase(phrase);
		if (parsed === undefined) {
			errors.push(`Unrecognised due date "${phrase}"`);
		} else {
			result.dueAt = parsed;
			if (parsed !== null) {
				result.dueTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
			}
		}
		working = (working.slice(0, dueMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	const scheduledMatch = working.match(/\bscheduled:/i);
	if (scheduledMatch && scheduledMatch.index !== undefined) {
		const valueStart = scheduledMatch.index + scheduledMatch[0].length;
		const [phrase, end] = extractTokenValue(working, valueStart);
		const parsed = parseDatePhrase(phrase);
		if (parsed === undefined) {
			errors.push(`Unrecognised scheduled date "${phrase}"`);
		} else {
			result.scheduledAt = parsed;
		}
		working = (working.slice(0, scheduledMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	const parentMatch = working.match(/\bparent:/i);
	if (parentMatch && parentMatch.index !== undefined) {
		const valueStart = parentMatch.index + parentMatch[0].length;
		const [parentValue, end] = extractTokenValue(working, valueStart);
		const normalized = parentValue.trim().toLowerCase();
		if (["none", "clear", "null"].includes(normalized)) {
			result.parentTaskId = null;
		} else {
			const asNumber = Number(normalized);
			if (Number.isInteger(asNumber) && asNumber > 0) {
				result.parentTaskId = asNumber;
			} else {
				errors.push(`Invalid parent value "${parentValue}"`);
			}
		}
		working = (working.slice(0, parentMatch.index) + working.slice(end)).replace(/\s{2,}/g, " ").trim();
	}

	if (!result.title && working.length > 0) {
		result.title = working;
	}

	if (!result.title || result.title.trim().length === 0) {
		errors.push('title is required (use plain text or "title:")');
	}

	return {
		input: result,
		warnings,
		errors,
		usedTokens: true,
	};
}
