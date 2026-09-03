import {
	differenceInCalendarDays,
	addDays as fnsAddDays,
	addMonths as fnsAddMonths,
	addYears as fnsAddYears,
	getDay,
} from "date-fns";

const WEEKDAY_INDEX: Record<string, number> = {
	SU: 0,
	MO: 1,
	TU: 2,
	WE: 3,
	TH: 4,
	FR: 5,
	SA: 6,
};

type ParsedRule = {
	freq: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
	interval: number;
	byDay: number[];
	count: number | null;
	until: Date | null;
};

function addDays(date: Date, days: number) {
	return fnsAddDays(date, days);
}

function addMonths(date: Date, months: number) {
	return fnsAddMonths(date, months);
}

function addYears(date: Date, years: number) {
	return fnsAddYears(date, years);
}

function parseRRule(rule: string): ParsedRule | null {
	const normalized = rule.trim().toUpperCase();
	const parts = normalized.split(";").filter(Boolean);
	const data = new Map<string, string>();

	for (const part of parts) {
		const [key, value] = part.split("=");
		if (!key || !value) {
			return null;
		}
		data.set(key, value);
	}

	const freq = data.get("FREQ");
	if (
		freq !== "DAILY" &&
		freq !== "WEEKLY" &&
		freq !== "MONTHLY" &&
		freq !== "YEARLY"
	) {
		return null;
	}

	const intervalRaw = data.get("INTERVAL");
	const interval = intervalRaw ? Number(intervalRaw) : 1;
	if (!Number.isInteger(interval) || interval <= 0) {
		return null;
	}

	const byDayRaw = data.get("BYDAY");
	const byDay = byDayRaw
		? byDayRaw
				.split(",")
				.map((day) => WEEKDAY_INDEX[day])
				.filter((value) => Number.isInteger(value))
		: [];

	const countRaw = data.get("COUNT");
	let count: number | null = null;
	if (countRaw !== undefined) {
		const countVal = Number(countRaw);
		if (!Number.isInteger(countVal) || countVal <= 0) return null;
		count = countVal;
	}

	const untilRaw = data.get("UNTIL");
	let until: Date | null = null;
	if (untilRaw !== undefined) {
		let parsed: Date;
		if (/^\d{8}T\d{6}Z?$/.test(untilRaw)) {
			parsed = new Date(untilRaw);
		} else if (/^\d{8}$/.test(untilRaw)) {
			const y = untilRaw.slice(0, 4);
			const m = untilRaw.slice(4, 6);
			const d = untilRaw.slice(6, 8);
			parsed = new Date(`${y}-${m}-${d}T00:00:00Z`);
		} else {
			return null;
		}
		if (Number.isNaN(parsed.getTime())) return null;
		until = parsed;
	}

	return { freq, interval, byDay, count, until };
}

export function presetToRRule(preset: string | null) {
	switch (preset) {
		case "daily":
			return "FREQ=DAILY;INTERVAL=1";
		case "weekly":
			return "FREQ=WEEKLY;INTERVAL=1";
		case "monthly":
			return "FREQ=MONTHLY;INTERVAL=1";
		case "yearly":
			return "FREQ=YEARLY;INTERVAL=1";
		case "every_weekday":
			return "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR";
		default:
			return null;
	}
}

export function validateRRuleSubset(rule: string | null) {
	if (!rule) {
		return false;
	}
	return parseRRule(rule) !== null;
}

function nextWeeklyByDay(base: Date, interval: number, byDay: number[]) {
	const allowed = byDay.length > 0 ? byDay : [getDay(base)];
	let cursor = addDays(base, 1);

	for (let i = 0; i < 400; i += 1) {
		const diffDays = differenceInCalendarDays(cursor, base);
		const weekBucket = Math.floor(diffDays / 7);

		if (weekBucket % interval === 0 && allowed.includes(getDay(cursor))) {
			return cursor;
		}

		cursor = addDays(cursor, 1);
	}

	return addDays(base, 7 * interval);
}

function stepOnce(base: Date, parsed: ParsedRule) {
	if (parsed.freq === "DAILY") {
		return addDays(base, parsed.interval);
	}
	if (parsed.freq === "MONTHLY") {
		return addMonths(base, parsed.interval);
	}
	if (parsed.freq === "YEARLY") {
		return addYears(base, parsed.interval);
	}
	return nextWeeklyByDay(base, parsed.interval, parsed.byDay);
}

export function getNextOccurrence(input: {
	baseIso: string;
	recurrencePreset: string | null;
	recurrenceRRule: string | null;
	/**
	 * When given, keep stepping until the occurrence lands after this instant.
	 * A daily task ticked off a week late should come back tomorrow, not last
	 * Tuesday, so completion passes "now" here.
	 */
	notBeforeIso?: string | null;
}): string | null {
	const base = new Date(input.baseIso);
	if (Number.isNaN(base.getTime())) {
		return null;
	}

	const ruleText =
		input.recurrenceRRule || presetToRRule(input.recurrencePreset);
	if (!ruleText) {
		return null;
	}

	const parsed = parseRRule(ruleText);
	if (!parsed) {
		return null;
	}

	const notBefore = input.notBeforeIso ? new Date(input.notBeforeIso) : null;
	const floor =
		notBefore && !Number.isNaN(notBefore.getTime()) ? notBefore : null;

	let next = stepOnce(base, parsed);

	// Cap the catch-up so a stale yearly rule cannot spin forever.
	for (let i = 0; floor !== null && next <= floor && i < 1000; i += 1) {
		if (parsed.until !== null && next > parsed.until) {
			break;
		}
		next = stepOnce(next, parsed);
	}

	if (parsed.until !== null && next > parsed.until) {
		return null;
	}

	return next.toISOString();
}
