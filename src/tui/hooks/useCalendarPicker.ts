import { addDays, addMonths, endOfMonth, startOfMonth } from "date-fns";
import { useState } from "react";

export type CalendarPickerState = {
	cursorDate: Date;
	visibleMonth: Date;
	setCursorDate: React.Dispatch<React.SetStateAction<Date>>;
	setVisibleMonth: React.Dispatch<React.SetStateAction<Date>>;
};

/** Returns initial state for the calendar picker. If existingIsoDate is provided
 *  (YYYY-MM-DD or ISO datetime), starts there; otherwise starts at today. */
export function initCalendarPicker(existingIsoDate?: string): {
	cursorDate: Date;
	visibleMonth: Date;
} {
	let cursor = new Date();
	if (existingIsoDate) {
		const parsed = new Date(existingIsoDate);
		if (!isNaN(parsed.getTime())) {
			cursor = parsed;
		}
	}
	// Normalize to start of day in local time to avoid UTC offset surprises
	cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
	return {
		cursorDate: cursor,
		visibleMonth: startOfMonth(cursor),
	};
}

/** Move cursor by `delta` days, adjusting visibleMonth if needed. */
export function moveCursorByDays(
	cursorDate: Date,
	delta: number,
): { cursorDate: Date; visibleMonth: Date } {
	const next = addDays(cursorDate, delta);
	return { cursorDate: next, visibleMonth: startOfMonth(next) };
}

/** Step visible month by `delta` months (-1 or +1), clamping cursor to last day of new month. */
export function stepCalendarMonth(
	cursorDate: Date,
	visibleMonth: Date,
	delta: -1 | 1,
): { cursorDate: Date; visibleMonth: Date } {
	const newMonth = addMonths(visibleMonth, delta);
	const lastDayOfNewMonth = endOfMonth(newMonth);
	const clampedCursor =
		cursorDate.getDate() > lastDayOfNewMonth.getDate()
			? new Date(
					newMonth.getFullYear(),
					newMonth.getMonth(),
					lastDayOfNewMonth.getDate(),
				)
			: new Date(
					newMonth.getFullYear(),
					newMonth.getMonth(),
					cursorDate.getDate(),
				);
	return { cursorDate: clampedCursor, visibleMonth: newMonth };
}

export function useCalendarPicker(): CalendarPickerState {
	const initial = initCalendarPicker();
	const [cursorDate, setCursorDate] = useState<Date>(initial.cursorDate);
	const [visibleMonth, setVisibleMonth] = useState<Date>(initial.visibleMonth);

	return { cursorDate, visibleMonth, setCursorDate, setVisibleMonth };
}
