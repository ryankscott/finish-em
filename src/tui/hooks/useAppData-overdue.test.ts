import { describe, expect, it } from "bun:test";

import { isOverdueTask } from "./useAppData";

const now = new Date("2026-03-05T12:00:00.000Z");

describe("isOverdueTask", () => {
	it("returns true for a task due yesterday", () => {
		expect(isOverdueTask({ dueAt: "2026-03-04T00:00:00.000Z" }, now)).toBe(
			true,
		);
	});

	it("returns true for a task due one week ago", () => {
		expect(isOverdueTask({ dueAt: "2026-02-26T10:00:00.000Z" }, now)).toBe(
			true,
		);
	});

	it("returns false for a task due today", () => {
		// startOfDay(now) is 2026-03-05T00:00:00 — tasks due today are NOT overdue
		expect(isOverdueTask({ dueAt: "2026-03-05T00:00:00.000Z" }, now)).toBe(
			false,
		);
	});

	it("returns false for a task due in the future", () => {
		expect(isOverdueTask({ dueAt: "2026-03-10T00:00:00.000Z" }, now)).toBe(
			false,
		);
	});

	it("returns false for a task with no due date", () => {
		expect(isOverdueTask({ dueAt: null }, now)).toBe(false);
	});
});
