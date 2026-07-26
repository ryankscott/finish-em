import { nowIso } from "@/server/db/client";
import type { Db } from "@/server/db/types";

import type { CompletionLog } from "@/server/types";

function mapRow(row: Record<string, unknown>): CompletionLog {
	return {
		id: Number(row.id),
		taskId: Number(row.task_id),
		title: String(row.title ?? ""),
		completedAt: String(row.completed_at),
		notes: String(row.notes ?? ""),
		createdAt: String(row.created_at),
	};
}

/** Record that a task instance was completed at a point in time. */
export async function logCompletion(
	db: Db,
	taskId: number,
	title: string,
	completedAt: string,
	notes = "",
): Promise<CompletionLog> {
	const now = nowIso();
	const row = await db
		.prepare(
			`INSERT INTO task_completion_log (task_id, title, completed_at, notes, created_at)
			 VALUES (?, ?, ?, ?, ?)
			 RETURNING *`,
		)
		.get<Record<string, unknown>>(taskId, title, completedAt, notes, now);
	return mapRow(row as Record<string, unknown>);
}

/** Completion history for a single task, most recent first. */
export async function getCompletionHistory(
	db: Db,
	taskId: number,
	from?: string,
	to?: string,
): Promise<CompletionLog[]> {
	const clauses = ["task_id = ?"];
	const params: unknown[] = [taskId];
	if (from) {
		clauses.push("completed_at >= ?");
		params.push(from);
	}
	if (to) {
		clauses.push("completed_at <= ?");
		params.push(to);
	}
	const rows = await db
		.prepare(
			`SELECT * FROM task_completion_log WHERE ${clauses.join(
				" AND ",
			)} ORDER BY completed_at DESC`,
		)
		.all<Record<string, unknown>>(...params);
	return rows.map(mapRow);
}

/** All completions in a date range, most recent first (for the Logbook). */
export async function listCompletions(
	db: Db,
	from?: string,
	to?: string,
): Promise<CompletionLog[]> {
	const clauses: string[] = [];
	const params: unknown[] = [];
	if (from) {
		clauses.push("completed_at >= ?");
		params.push(from);
	}
	if (to) {
		clauses.push("completed_at <= ?");
		params.push(to);
	}
	const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
	const rows = await db
		.prepare(
			`SELECT * FROM task_completion_log ${where} ORDER BY completed_at DESC`,
		)
		.all<Record<string, unknown>>(...params);
	return rows.map(mapRow);
}

/**
 * Remove the most recent completion entry for a task. Used when a completion is
 * undone so the log stays consistent with the task's actual state.
 */
export async function deleteLatestCompletion(
	db: Db,
	taskId: number,
): Promise<boolean> {
	const result = await db
		.prepare(
			`DELETE FROM task_completion_log
       WHERE id = (
         SELECT id FROM task_completion_log
         WHERE task_id = ?
         ORDER BY completed_at DESC, id DESC
         LIMIT 1
       )`,
		)
		.run(taskId);
	return result.changes > 0;
}
