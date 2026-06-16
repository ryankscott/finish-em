import { describe, expect, it } from "bun:test";

import type { InputMode } from "./useInputBar";

// Test the E-key → calendar picker mapping logic in isolation.

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

function simulateEKeyPress(
	inputMode: InputMode,
	currentValue: string,
): { calendarMode: InputMode; existingIsoDate: string | undefined } | null {
	if (!DATE_TEXT_INPUT_MODES.includes(inputMode)) return null;
	const calendarMode = DATE_MODE_TO_CALENDAR_MODE[inputMode];
	if (!calendarMode) return null;
	return { calendarMode, existingIsoDate: currentValue || undefined };
}

describe("E key → calendar picker mapping", () => {
	it("editDueDate → calendarPickerDueDate", () => {
		const result = simulateEKeyPress("editDueDate", "2026-03-15");
		expect(result?.calendarMode).toBe("calendarPickerDueDate");
		expect(result?.existingIsoDate).toBe("2026-03-15");
	});

	it("editScheduledDate → calendarPickerScheduledDate", () => {
		const result = simulateEKeyPress("editScheduledDate", "");
		expect(result?.calendarMode).toBe("calendarPickerScheduledDate");
		expect(result?.existingIsoDate).toBeUndefined();
	});

	it("editProjectStartDate → calendarPickerProjectStartDate", () => {
		const result = simulateEKeyPress("editProjectStartDate", "2026-01-01");
		expect(result?.calendarMode).toBe("calendarPickerProjectStartDate");
	});

	it("editProjectEndDate → calendarPickerProjectEndDate", () => {
		const result = simulateEKeyPress("editProjectEndDate", "");
		expect(result?.calendarMode).toBe("calendarPickerProjectEndDate");
	});

	it("non-date modes return null (E does not open calendar)", () => {
		expect(simulateEKeyPress("editNotes", "")).toBeNull();
		expect(simulateEKeyPress("quickAdd", "")).toBeNull();
		expect(simulateEKeyPress("editTask", "")).toBeNull();
	});
});
