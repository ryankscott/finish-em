import {
	addDays,
	addMinutes as fnsAddMinutes,
	isAfter,
	isPast,
} from "date-fns";

export type SnoozePreset =
	| "this_morning"
	| "this_evening"
	| "tomorrow_morning"
	| "next_week"
	| "custom";

function setUTCTime(base: Date, hour: number) {
	const next = new Date(base);
	next.setUTCHours(hour, 0, 0, 0);
	return next;
}

function thisMorning(base: Date) {
	const candidate = setUTCTime(base, 9);
	if (!isAfter(candidate, base)) {
		return addDays(candidate, 1);
	}
	return candidate;
}

function thisEvening(base: Date) {
	const candidate = setUTCTime(base, 18);
	if (!isAfter(candidate, base)) {
		return addDays(candidate, 1);
	}
	return candidate;
}

function tomorrowMorning(base: Date) {
	return setUTCTime(addDays(base, 1), 9);
}

function nextWeek(base: Date) {
	return setUTCTime(addDays(base, 7), 9);
}

export function resolveSnoozeTime(input: {
	now?: Date;
	preset: SnoozePreset;
	customMinutes?: number;
}): string {
	const base = input.now ?? new Date();

	switch (input.preset) {
		case "this_morning":
			return thisMorning(base).toISOString();
		case "this_evening":
			return thisEvening(base).toISOString();
		case "tomorrow_morning":
			return tomorrowMorning(base).toISOString();
		case "next_week":
			return nextWeek(base).toISOString();
		case "custom": {
			const minutes = input.customMinutes ?? 0;
			if (!Number.isInteger(minutes) || minutes <= 0) {
				throw new Error("customMinutes must be a positive integer");
			}
			return fnsAddMinutes(base, minutes).toISOString();
		}
	}
}

export function isReminderDue(remindAt: string, snoozedUntil: string | null) {
	const now = new Date();
	const target = snoozedUntil ? new Date(snoozedUntil) : new Date(remindAt);
	return isPast(target);
}
