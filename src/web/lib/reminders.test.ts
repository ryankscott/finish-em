import { describe, expect, it } from "bun:test";

import {
	type DueReminder,
	missedLabel,
	titleWithCount,
	undelivered,
} from "./reminders";

function reminder(patch: Partial<DueReminder>): DueReminder {
	return {
		id: 1,
		taskId: 1,
		taskTitle: "Call vet",
		remindAt: "2026-10-08T09:00:00.000Z",
		status: "pending",
		snoozedUntil: null,
		firedAt: null,
		createdAt: "2026-10-01T00:00:00.000Z",
		updatedAt: "2026-10-01T00:00:00.000Z",
		...patch,
	};
}

describe("undelivered", () => {
	it("keeps only reminders without a delivery time", () => {
		const fresh = reminder({ id: 1 });
		const fired = reminder({
			id: 2,
			status: "fired",
			firedAt: "2026-10-08T09:00:05.000Z",
		});
		expect(undelivered([fresh, fired]).map((r) => r.id)).toEqual([1]);
	});
});

describe("missedLabel", () => {
	it("uses the snoozed time when present", () => {
		const r = reminder({ snoozedUntil: "2026-10-08T11:00:00.000Z" });
		expect(missedLabel(r, new Date("2026-10-08T12:00:00.000Z"))).toBe(
			"1 hour ago",
		);
	});

	it("says just now inside the first minute", () => {
		expect(
			missedLabel(reminder({}), new Date("2026-10-08T09:00:30.000Z")),
		).toBe("just now");
	});
});

describe("titleWithCount", () => {
	it("adds, replaces and removes the count", () => {
		expect(titleWithCount("finish-em", 2)).toBe("(2) finish-em");
		expect(titleWithCount("(2) finish-em", 5)).toBe("(5) finish-em");
		expect(titleWithCount("(5) finish-em", 0)).toBe("finish-em");
	});
});
