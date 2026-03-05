import { getDb, nowIso } from "@/server/db/client";
import { mapReminderRow } from "@/server/repos/mappers";
import { resolveSnoozeTime } from "@/server/services/reminders";

import type { Reminder, ReminderStatus } from "@/server/types";

export function listTaskReminders(taskId: number): Reminder[] {
	const db = getDb();
	const rows = db
		.prepare(
			"SELECT * FROM reminders WHERE task_id = ? ORDER BY updated_at DESC LIMIT 1",
		)
		.all(taskId) as Record<string, unknown>[];

	return rows.map(mapReminderRow);
}

export function getReminder(reminderId: number): Reminder | null {
	const db = getDb();
	const row = db
		.prepare("SELECT * FROM reminders WHERE id = ?")
		.get(reminderId) as Record<string, unknown> | undefined;

	return row ? mapReminderRow(row) : null;
}

export function createReminder(input: {
	taskId: number;
	remindAt: string;
	status?: ReminderStatus;
}): Reminder {
	const db = getDb();
	const now = nowIso();
	const existingRows = db
		.prepare(
			"SELECT id FROM reminders WHERE task_id = ? ORDER BY created_at ASC",
		)
		.all(input.taskId) as Array<{ id: number }>;

	const existingPrimary = existingRows[0];

	if (existingPrimary) {
		db.prepare(
			`UPDATE reminders SET
        remind_at = ?,
        status = ?,
        snoozed_until = NULL,
        updated_at = ?
      WHERE id = ?`,
		).run(input.remindAt, input.status ?? "pending", now, existingPrimary.id);

		if (existingRows.length > 1) {
			const duplicateIds = existingRows.slice(1).map((row) => row.id);
			const placeholders = duplicateIds.map(() => "?").join(",");
			db.prepare(`DELETE FROM reminders WHERE id IN (${placeholders})`).run(
				...duplicateIds,
			);
		}

		const row = db
			.prepare("SELECT * FROM reminders WHERE id = ?")
			.get(existingPrimary.id) as Record<string, unknown>;

		return mapReminderRow(row);
	}

	const result = db
		.prepare(
			"INSERT INTO reminders (task_id, remind_at, status, snoozed_until, created_at, updated_at) VALUES (?, ?, ?, NULL, ?, ?)",
		)
		.run(input.taskId, input.remindAt, input.status ?? "pending", now, now);

	const id = Number(result.lastInsertRowid);
	const row = db
		.prepare("SELECT * FROM reminders WHERE id = ?")
		.get(id) as Record<string, unknown>;

	return mapReminderRow(row);
}

export function updateReminder(
	reminderId: number,
	patch: Partial<{
		remindAt: string;
		status: ReminderStatus;
		snoozedUntil: string | null;
	}>,
): Reminder | null {
	const db = getDb();
	const existing = getReminder(reminderId);

	if (!existing) {
		return null;
	}

	db.prepare(
		`UPDATE reminders SET
      remind_at = ?,
      status = ?,
      snoozed_until = ?,
      updated_at = ?
    WHERE id = ?`,
	).run(
		patch.remindAt ?? existing.remindAt,
		patch.status ?? existing.status,
		patch.snoozedUntil === undefined
			? existing.snoozedUntil
			: patch.snoozedUntil,
		nowIso(),
		reminderId,
	);

	return getReminder(reminderId);
}

export function deleteReminder(reminderId: number): boolean {
	const db = getDb();
	const result = db
		.prepare("DELETE FROM reminders WHERE id = ?")
		.run(reminderId);
	return result.changes > 0;
}

export function snoozeReminder(input: {
	reminderId: number;
	preset:
		| "this_morning"
		| "this_evening"
		| "tomorrow_morning"
		| "next_week"
		| "custom";
	customMinutes?: number;
}): Reminder | null {
	const next = resolveSnoozeTime({
		preset: input.preset,
		customMinutes: input.customMinutes,
	});

	return updateReminder(input.reminderId, {
		status: "snoozed",
		snoozedUntil: next,
	});
}

export function listDueReminders(): Reminder[] {
	const db = getDb();
	const now = nowIso();
	const rows = db
		.prepare(
			`SELECT * FROM reminders
       WHERE status IN ('pending', 'snoozed')
         AND COALESCE(snoozed_until, remind_at) <= ?
       ORDER BY COALESCE(snoozed_until, remind_at) ASC`,
		)
		.all(now) as Record<string, unknown>[];

	return rows.map(mapReminderRow);
}

export type DueReminderWithTitle = Reminder & { taskTitle: string };

export function listDueRemindersWithTitles(): DueReminderWithTitle[] {
	const db = getDb();
	const now = nowIso();
	const rows = db
		.prepare(
			`SELECT r.*, t.title AS task_title
       FROM reminders r
       INNER JOIN tasks t ON t.id = r.task_id
       WHERE r.status IN ('pending', 'snoozed')
         AND COALESCE(r.snoozed_until, r.remind_at) <= ?
       ORDER BY COALESCE(r.snoozed_until, r.remind_at) ASC`,
		)
		.all(now) as (Record<string, unknown> & { task_title: string })[];

	return rows.map((row) => {
		const { task_title, ...rest } = row;
		return {
			...mapReminderRow(rest),
			taskTitle: String(task_title ?? ""),
		};
	});
}
