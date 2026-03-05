import { describe, expect, it } from "bun:test";

import { dueReminderKey, getNewlyDueReminders } from "./useReminderBell";

describe("dueReminderKey", () => {
	it("uses reminder id and effective time (remindAt when no snoozedUntil)", () => {
		expect(dueReminderKey({ id: 1, remindAt: "2026-01-01T10:00:00Z", snoozedUntil: null })).toBe(
			"1-2026-01-01T10:00:00Z",
		);
	});

	it("uses snoozedUntil when present", () => {
		expect(
			dueReminderKey({
				id: 1,
				remindAt: "2026-01-01T10:00:00Z",
				snoozedUntil: "2026-01-02T12:00:00Z",
			}),
		).toBe("1-2026-01-02T12:00:00Z");
	});

	it("produces different keys for same id with different effective times", () => {
		const key1 = dueReminderKey({ id: 1, remindAt: "2026-01-01T10:00:00Z", snoozedUntil: null });
		const key2 = dueReminderKey({ id: 1, remindAt: "2026-01-02T10:00:00Z", snoozedUntil: null });
		expect(key1).not.toBe(key2);
	});
});

describe("getNewlyDueReminders", () => {
	const due = [
		{ id: 1, remindAt: "2026-01-01T10:00:00Z", snoozedUntil: null as string | null },
		{ id: 2, remindAt: "2026-01-01T11:00:00Z", snoozedUntil: null as string | null },
	];

	it("returns all due when notified set is empty", () => {
		const notified = new Set<string>();
		expect(getNewlyDueReminders(due, notified)).toEqual(due);
	});

	it("returns only reminders not in notified set", () => {
		const notified = new Set([dueReminderKey(due[0])]);
		expect(getNewlyDueReminders(due, notified)).toEqual([due[1]]);
	});

	it("returns empty when all are already notified", () => {
		const notified = new Set(due.map((r) => dueReminderKey(r)));
		expect(getNewlyDueReminders(due, notified)).toEqual([]);
	});
});

