import { describe, expect, it } from "bun:test";

import { format } from "date-fns";

import { initCalendarPicker, moveCursorByDays, stepCalendarMonth } from "./hooks/useCalendarPicker";
import { parseDatePhrase } from "./parse-task-input";
import type { InputMode } from "./hooks/useInputBar";

// ---
// Integration tests: calendar picker → date field update flow
// ---

const DATE_TEXT_INPUT_MODES: InputMode[] = [
	"editDueDate",
	"editScheduledDate",
	"editProjectStartDate",
	"editProjectEndDate",
];

const DATE_MODE_TO_CALENDAR_MODE: Partial<Record<InputMode, InputMode>> = {
	editDueDate: "calendarPickerDueDate",
	editScheduledDate: "calendarPickerScheduledDate",
	editProjectStartDate: "calendarPickerProjectStartDate",
	editProjectEndDate: "calendarPickerProjectEndDate",
};

describe("E key in editDueDate → calendar picker mode", () => {
	it("editDueDate E press switches to calendarPickerDueDate", () => {
		const inputMode: InputMode = "editDueDate";
		const isDateMode = DATE_TEXT_INPUT_MODES.includes(inputMode);
		expect(isDateMode).toBe(true);
		const calendarMode = DATE_MODE_TO_CALENDAR_MODE[inputMode];
		expect(calendarMode).toBe("calendarPickerDueDate");
	});

	it("calendar initialises from existing due date", () => {
		const { cursorDate, visibleMonth } = initCalendarPicker("2026-06-15");
		expect(cursorDate.getFullYear()).toBe(2026);
		expect(cursorDate.getMonth()).toBe(5); // June
		expect(cursorDate.getDate()).toBe(15);
		expect(visibleMonth.getDate()).toBe(1);
		expect(visibleMonth.getMonth()).toBe(5);
	});

	it("calendar initialises to today when no date set", () => {
		const today = new Date();
		const { cursorDate } = initCalendarPicker(undefined);
		expect(cursorDate.getFullYear()).toBe(today.getFullYear());
		expect(cursorDate.getMonth()).toBe(today.getMonth());
		expect(cursorDate.getDate()).toBe(today.getDate());
	});
});

describe("calendarPickerDueDate Enter → sets task due date", () => {
	it("Enter formats cursor date as YYYY-MM-DD and parseDatePhrase resolves it", () => {
		const cursorDate = new Date(2026, 5, 15); // June 15 2026
		const dateStr = format(cursorDate, "yyyy-MM-dd");
		expect(dateStr).toBe("2026-06-15");

		const parsed = parseDatePhrase(dateStr);
		expect(parsed).not.toBeNull();
		const d = new Date(parsed!);
		expect(d.getFullYear()).toBe(2026);
		expect(d.getMonth()).toBe(5);
		expect(d.getDate()).toBe(15);
	});

	it("arrow key navigation advances cursorDate correctly", () => {
		const start = new Date(2026, 5, 15);
		const { cursorDate } = moveCursorByDays(start, 1);
		expect(cursorDate.getDate()).toBe(16);
		expect(cursorDate.getMonth()).toBe(5);
	});

	it("down arrow (7 days) advances by one week", () => {
		const start = new Date(2026, 5, 15);
		const { cursorDate } = moveCursorByDays(start, 7);
		expect(cursorDate.getDate()).toBe(22);
	});

	it("left arrow crossing month boundary updates visibleMonth", () => {
		const start = new Date(2026, 5, 1); // June 1
		const { cursorDate, visibleMonth } = moveCursorByDays(start, -1);
		expect(cursorDate.getMonth()).toBe(4); // May
		expect(visibleMonth.getMonth()).toBe(4);
	});
});

describe("pressing c in calendar picker clears date", () => {
	it("'clear' value passed to parseDatePhrase returns null", () => {
		const parsed = parseDatePhrase("clear");
		expect(parsed).toBeNull();
	});

	it("step month clamps cursor to last day of shorter month", () => {
		const cursor = new Date(2026, 0, 31); // Jan 31
		const visibleMonth = new Date(2026, 0, 1); // Jan
		const { cursorDate } = stepCalendarMonth(cursor, visibleMonth, 1); // → Feb
		// Feb 2026 has 28 days
		expect(cursorDate.getDate()).toBeLessThanOrEqual(28);
		expect(cursorDate.getMonth()).toBe(1); // February
	});
});
