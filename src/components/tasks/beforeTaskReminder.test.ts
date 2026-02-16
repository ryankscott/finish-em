import { describe, expect, it } from "vitest";

/**
 * Check if a date string includes a specific time (not just midnight)
 */
function hasTime(dateString: string | null): boolean {
	if (!dateString) return false;
	const date = new Date(dateString);
	return date.getUTCHours() !== 0 || date.getUTCMinutes() !== 0;
}

describe("hasTime", () => {
	it("returns false for null", () => {
		expect(hasTime(null)).toBe(false);
	});

	it("returns false for date at midnight", () => {
		expect(hasTime("2026-02-20T00:00:00.000Z")).toBe(false);
	});

	it("returns true for date with specific time", () => {
		expect(hasTime("2026-02-20T14:30:00.000Z")).toBe(true);
		expect(hasTime("2026-02-20T09:00:00.000Z")).toBe(true);
		expect(hasTime("2026-02-20T23:59:00.000Z")).toBe(true);
	});

	it("returns true for date with only minutes", () => {
		expect(hasTime("2026-02-20T00:30:00.000Z")).toBe(true);
	});
});

describe("Before task reminder calculation", () => {
	it("calculates reminder time correctly for 30 minutes before", () => {
		const dueDate = new Date("2026-02-20T14:30:00.000Z");
		const minutes = 30;
		const reminderDate = new Date(dueDate.getTime() - minutes * 60 * 1000);
		
		expect(reminderDate.toISOString()).toBe("2026-02-20T14:00:00.000Z");
	});

	it("calculates reminder time correctly for 1 hour before", () => {
		const dueDate = new Date("2026-02-20T14:30:00.000Z");
		const minutes = 60;
		const reminderDate = new Date(dueDate.getTime() - minutes * 60 * 1000);
		
		expect(reminderDate.toISOString()).toBe("2026-02-20T13:30:00.000Z");
	});

	it("calculates reminder time correctly for 2 hours before", () => {
		const dueDate = new Date("2026-02-20T14:30:00.000Z");
		const minutes = 120;
		const reminderDate = new Date(dueDate.getTime() - minutes * 60 * 1000);
		
		expect(reminderDate.toISOString()).toBe("2026-02-20T12:30:00.000Z");
	});

	it("handles reminder crossing day boundaries", () => {
		const dueDate = new Date("2026-02-20T01:00:00.000Z");
		const minutes = 120; // 2 hours before
		const reminderDate = new Date(dueDate.getTime() - minutes * 60 * 1000);
		
		expect(reminderDate.toISOString()).toBe("2026-02-19T23:00:00.000Z");
	});

	it("detects when reminder would be in the past", () => {
		const now = new Date();
		const pastDue = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
		const minutes = 30;
		const reminderDate = new Date(pastDue.getTime() - minutes * 60 * 1000);
		
		expect(reminderDate.getTime()).toBeLessThan(now.getTime());
	});
});
