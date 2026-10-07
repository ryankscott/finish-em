/**
 * Minimal IANA-timezone arithmetic on top of Intl, so the Worker (which has no
 * host timezone) can resolve "9am tomorrow" in the user's zone.
 */

type Parts = { year: number; month: number; day: number; hour: number };

function partsIn(date: Date, timeZone: string): Parts & { minute: number } {
	const fmt = new Intl.DateTimeFormat("en-US", {
		timeZone,
		hourCycle: "h23",
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
	});
	const get = (type: string) =>
		Number(fmt.formatToParts(date).find((p) => p.type === type)?.value);
	return {
		year: get("year"),
		month: get("month"),
		day: get("day"),
		hour: get("hour"),
		minute: get("minute"),
	};
}

function offsetMs(date: Date, timeZone: string): number {
	const p = partsIn(date, timeZone);
	const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
	return asUtc - Math.floor(date.getTime() / 60_000) * 60_000;
}

/** The instant at which the wall clock in `timeZone` reads the given time. */
export function zonedToUtc(parts: Parts, timeZone: string): Date {
	const guess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour);
	// Two passes settle DST transitions where the first offset guess is off.
	let result = guess - offsetMs(new Date(guess), timeZone);
	result = guess - offsetMs(new Date(result), timeZone);
	return new Date(result);
}

/** `hour`:00 in `timeZone`, `dayOffset` calendar days after `base`'s local date. */
export function atZonedHour(
	base: Date,
	timeZone: string,
	dayOffset: number,
	hour: number,
): Date {
	const p = partsIn(base, timeZone);
	const day = new Date(Date.UTC(p.year, p.month - 1, p.day + dayOffset));
	return zonedToUtc(
		{
			year: day.getUTCFullYear(),
			month: day.getUTCMonth() + 1,
			day: day.getUTCDate(),
			hour,
		},
		timeZone,
	);
}
