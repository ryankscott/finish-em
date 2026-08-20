/**
 * Parse a duration written the way a person types one.
 *
 * Three-state return, matching parseDatePhrase's convention:
 *   number     a recognised duration, in minutes
 *   null       an explicit clear ("none", "clear")
 *   undefined  not recognised, so the caller can warn instead of guessing
 *
 * A bare number means minutes, because "est:45" reads as 45 minutes to anyone
 * typing it quickly, and 45 hours is not a plausible estimate.
 */
export function parseDurationMinutes(
	text: string,
): number | null | undefined {
	const value = text.trim().toLowerCase();
	if (value.length === 0) return undefined;
	if (value === "none" || value === "clear" || value === "0") {
		return value === "0" ? 0 : null;
	}

	// 1h30, 1h 30m, 1h, 1.5h
	const hoursAndMinutes = value.match(
		/^(\d+(?:\.\d+)?)\s*h(?:ou)?r?s?(?:\s*(\d+)\s*(?:m(?:in(?:ute)?s?)?)?)?$/,
	);
	if (hoursAndMinutes) {
		const hours = Number(hoursAndMinutes[1]);
		const minutes = Number(hoursAndMinutes[2] ?? 0);
		// A fractional hour and an explicit minute part together ("1.5h30") is
		// ambiguous, so refuse it rather than pick an interpretation.
		if (!Number.isInteger(hours) && hoursAndMinutes[2] !== undefined) {
			return undefined;
		}
		const total = Math.round(hours * 60 + minutes);
		return inRange(total);
	}

	// 45m, 45min, 45
	const minutesOnly = value.match(/^(\d+)\s*(?:m(?:in(?:ute)?s?)?)?$/);
	if (minutesOnly) return inRange(Number(minutesOnly[1]));

	return undefined;
}

/** A day is the ceiling: anything larger is a typo, not an estimate. */
const inRange = (minutes: number) =>
	minutes >= 0 && minutes <= 1440 ? minutes : undefined;
