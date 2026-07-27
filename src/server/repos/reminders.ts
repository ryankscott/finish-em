import { nowIso } from "@/lib/datetime";
import type { Db } from "@/server/db/types";
import { mapReminderRow } from "@/server/repos/mappers";
import { resolveSnoozeTime } from "@/server/services/reminders";

import type { Reminder, ReminderStatus } from "@/server/types";

export async function listTaskReminders(
	db: Db,
	taskId: number,
): Promise<Reminder[]> {
	const rows = await db
		.prepare(
			"SELECT * FROM reminders WHERE task_id = ? ORDER BY updated_at DESC LIMIT 1",
		)
		.all<Record<string, unknown>>(taskId);

	return rows.map(mapReminderRow);
}

export async function getReminder(
	db: Db,
	reminderId: number,
): Promise<Reminder | null> {
	const row = await db
		.prepare("SELECT * FROM reminders WHERE id = ?")
		.get<Record<string, unknown>>(reminderId);

	return row ? mapReminderRow(row) : null;
}

export async function createReminder(
	db: Db,
	input: {
		taskId: number;
		remindAt: string;
		status?: ReminderStatus;
	},
): Promise<Reminder> {
	const now = nowIso();
	const existingRows = await db
		.prepare(
			"SELECT id FROM reminders WHERE task_id = ? ORDER BY created_at ASC",
		)
		.all<{ id: number }>(input.taskId);

	const existingPrimary = existingRows[0];

	if (existingPrimary) {
		// Collapse to a single reminder per task: update the oldest, drop any
		// duplicates. Batched so a task can never be left with the update applied
		// and the duplicates still present.
		const duplicateIds = existingRows.slice(1).map((row) => row.id);
		const ops = [
			{
				sql: `UPDATE reminders SET
        remind_at = ?,
        status = ?,
        snoozed_until = NULL,
        updated_at = ?
      WHERE id = ?`,
				params: [
					input.remindAt,
					input.status ?? "pending",
					now,
					existingPrimary.id,
				],
			},
		];
		if (duplicateIds.length > 0) {
			const placeholders = duplicateIds.map(() => "?").join(",");
			ops.push({
				sql: `DELETE FROM reminders WHERE id IN (${placeholders})`,
				params: duplicateIds,
			});
		}
		await db.batch(ops);

		const row = await db
			.prepare("SELECT * FROM reminders WHERE id = ?")
			.get<Record<string, unknown>>(existingPrimary.id);

		return mapReminderRow(row as Record<string, unknown>);
	}

	const row = await db
		.prepare(
			`INSERT INTO reminders (task_id, remind_at, status, snoozed_until, created_at, updated_at)
			 VALUES (?, ?, ?, NULL, ?, ?)
			 RETURNING *`,
		)
		.get<Record<string, unknown>>(
			input.taskId,
			input.remindAt,
			input.status ?? "pending",
			now,
			now,
		);

	return mapReminderRow(row as Record<string, unknown>);
}

export async function updateReminder(
	db: Db,
	reminderId: number,
	patch: Partial<{
		remindAt: string;
		status: ReminderStatus;
		snoozedUntil: string | null;
	}>,
): Promise<Reminder | null> {
	const existing = await getReminder(db, reminderId);

	if (!existing) {
		return null;
	}

	const row = await db
		.prepare(
			`UPDATE reminders SET
      remind_at = ?,
      status = ?,
      snoozed_until = ?,
      updated_at = ?
    WHERE id = ?
    RETURNING *`,
		)
		.get<Record<string, unknown>>(
			patch.remindAt ?? existing.remindAt,
			patch.status ?? existing.status,
			patch.snoozedUntil === undefined
				? existing.snoozedUntil
				: patch.snoozedUntil,
			nowIso(),
			reminderId,
		);

	return row ? mapReminderRow(row) : null;
}

export async function deleteReminder(
	db: Db,
	reminderId: number,
): Promise<boolean> {
	const result = await db
		.prepare("DELETE FROM reminders WHERE id = ?")
		.run(reminderId);
	return result.changes > 0;
}

export async function snoozeReminder(
	db: Db,
	input: {
		reminderId: number;
		preset:
			| "this_morning"
			| "this_evening"
			| "tomorrow_morning"
			| "next_week"
			| "custom";
		customMinutes?: number;
	},
): Promise<Reminder | null> {
	const next = resolveSnoozeTime({
		preset: input.preset,
		customMinutes: input.customMinutes,
	});

	return updateReminder(db, input.reminderId, {
		status: "snoozed",
		snoozedUntil: next,
	});
}

export async function listDueReminders(db: Db): Promise<Reminder[]> {
	const now = nowIso();
	const rows = await db
		.prepare(
			`SELECT * FROM reminders
       WHERE status IN ('pending', 'snoozed')
         AND COALESCE(snoozed_until, remind_at) <= ?
       ORDER BY COALESCE(snoozed_until, remind_at) ASC`,
		)
		.all<Record<string, unknown>>(now);

	return rows.map(mapReminderRow);
}

export type AllReminderWithTitle = Reminder & { taskTitle: string };

export async function listAllRemindersWithTitles(
	db: Db,
): Promise<AllReminderWithTitle[]> {
	const rows = await db
		.prepare(
			`SELECT r.*, t.title AS task_title
       FROM reminders r
       INNER JOIN tasks t ON t.id = r.task_id
       WHERE r.status IN ('pending', 'snoozed')
         AND t.deleted_at IS NULL
       ORDER BY COALESCE(r.snoozed_until, r.remind_at) ASC`,
		)
		.all<Record<string, unknown> & { task_title: string }>();

	return rows.map((row) => {
		const { task_title, ...rest } = row;
		return {
			...mapReminderRow(rest),
			taskTitle: String(task_title ?? ""),
		};
	});
}

export type DueReminderWithTitle = Reminder & { taskTitle: string };

export async function listDueRemindersWithTitles(
	db: Db,
): Promise<DueReminderWithTitle[]> {
	const now = nowIso();
	const rows = await db
		.prepare(
			`SELECT r.*, t.title AS task_title
       FROM reminders r
       INNER JOIN tasks t ON t.id = r.task_id
       WHERE r.status IN ('pending', 'snoozed')
         AND COALESCE(r.snoozed_until, r.remind_at) <= ?
       ORDER BY COALESCE(r.snoozed_until, r.remind_at) ASC`,
		)
		.all<Record<string, unknown> & { task_title: string }>(now);

	return rows.map((row) => {
		const { task_title, ...rest } = row;
		return {
			...mapReminderRow(rest),
			taskTitle: String(task_title ?? ""),
		};
	});
}
