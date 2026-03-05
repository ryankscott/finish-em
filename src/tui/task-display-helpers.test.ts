import { describe, expect, it } from "bun:test";

import {
	formatDueDate,
	formatScheduledDate,
	isOverdueDueDate,
	priorityColor,
	recurrenceLabel,
	truncate,
} from "./task-display-helpers";

describe("priorityColor", () => {
	it("returns red for priority 1", () => {
		expect(priorityColor(1)).toBe("red");
	});
	it("returns yellow for priority 2", () => {
		expect(priorityColor(2)).toBe("yellow");
	});
	it("returns green for priority 3", () => {
		expect(priorityColor(3)).toBe("green");
	});
	it("returns blue for priority 4 (default)", () => {
		expect(priorityColor(4)).toBe("blue");
	});
});

describe("formatDueDate", () => {
	it("formats a valid ISO date as MMM dd", () => {
		const result = formatDueDate("2026-01-15T00:00:00.000Z");
		expect(result).toMatch(/Jan \d{2}/);
	});
	it("returns the original string for invalid dates", () => {
		expect(formatDueDate("not-a-date")).toBe("not-a-date");
	});
});

describe("formatScheduledDate", () => {
	it("formats a valid ISO date as MMM dd", () => {
		const result = formatScheduledDate("2026-06-20T00:00:00.000Z");
		expect(result).toMatch(/Jun \d{2}/);
	});
	it("returns the original string for invalid dates", () => {
		expect(formatScheduledDate("bad")).toBe("bad");
	});
});

describe("isOverdueDueDate", () => {
	it("returns true for a past date", () => {
		expect(isOverdueDueDate("2020-01-01T00:00:00.000Z")).toBe(true);
	});
	it("returns false for a future date", () => {
		expect(isOverdueDueDate("2099-12-31T00:00:00.000Z")).toBe(false);
	});
	it("returns false for an invalid date string", () => {
		expect(isOverdueDueDate("garbage")).toBe(false);
	});
});

describe("recurrenceLabel", () => {
	it("returns 'Does not recur' for null", () => {
		expect(recurrenceLabel(null)).toBe("Does not recur");
	});
	it("replaces underscores with spaces", () => {
		expect(recurrenceLabel("every_weekday")).toBe("every weekday");
	});
	it("returns preset unchanged if no underscores", () => {
		expect(recurrenceLabel("daily")).toBe("daily");
	});
});

describe("truncate", () => {
	it("pads short strings to maxLen", () => {
		expect(truncate("hi", 5)).toBe("hi   ");
	});
	it("returns the string unchanged if exactly maxLen", () => {
		expect(truncate("hello", 5)).toBe("hello");
	});
	it("truncates long strings and appends ellipsis", () => {
		const result = truncate("hello world", 8);
		expect(result.length).toBe(8);
		expect(result.endsWith("…")).toBe(true);
	});
});
