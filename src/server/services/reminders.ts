import { addMinutes as fnsAddMinutes, isAfter, isPast } from "date-fns";

import { atZonedHour } from "@/lib/zoned";

export type SnoozePreset =
	| "this_morning"
	| "this_evening"
	| "tomorrow_morning"
	| "next_week"
	| "custom";

const MORNING_HOUR = 9;
const EVENING_HOUR = 18;

/** Today at `hour` if that is still ahead, otherwise tomorrow at `hour`. */
function nextAt(base: Date, timeZone: string, hour: number) {
	const today = atZonedHour(base, timeZone, 0, hour);
	return isAfter(today, base) ? today : atZonedHour(base, timeZone, 1, hour);
}

export function resolveSnoozeTime(input: {
	now?: Date;
	preset: SnoozePreset;
	customMinutes?: number;
	timeZone?: string;
}): string {
	const base = input.now ?? new Date();
	const tz = input.timeZone ?? "UTC";

	switch (input.preset) {
		case "this_morning":
			return nextAt(base, tz, MORNING_HOUR).toISOString();
		case "this_evening":
			return nextAt(base, tz, EVENING_HOUR).toISOString();
		case "tomorrow_morning":
			return atZonedHour(base, tz, 1, MORNING_HOUR).toISOString();
		case "next_week":
			return atZonedHour(base, tz, 7, MORNING_HOUR).toISOString();
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
	const target = snoozedUntil ? new Date(snoozedUntil) : new Date(remindAt);
	return isPast(target);
}
