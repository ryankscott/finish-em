import { getDb, nowIso } from "@/server/db/client";

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
export function logCompletion(
	taskId: number,
	title: string,
	completedAt: string,
	notes = "",
): CompletionLog {
	const db = getDb();
	const now = nowIso();
	const result = db
		.prepare(
			"INSERT INTO task_completion_log (task_id, title, completed_at, notes, created_at) VALUES (?, ?, ?, ?, ?)",
		)
		.run(taskId, title, completedAt, notes, now);
	const id = Number(result.lastInsertRowid);
	const row = db
		.prepare("SELECT * FROM task_completion_log WHERE id = ?")
		.get(id) as Record<string, unknown>;
	return mapRow(row);
}

/** Completion history for a single task, most recent first. */
export function getCompletionHistory(
	taskId: number,
	from?: string,
	to?: string,
): CompletionLog[] {
	const db = getDb();
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
	const rows = db
		.prepare(
			`SELECT * FROM task_completion_log WHERE ${clauses.join(
				" AND ",
			)} ORDER BY completed_at DESC`,
		)
		.all(...params) as Record<string, unknown>[];
	return rows.map(mapRow);
}

/** All completions in a date range, most recent first (for the Logbook). */
export function listCompletions(from?: string, to?: string): CompletionLog[] {
	const db = getDb();
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
	const rows = db
		.prepare(
			`SELECT * FROM task_completion_log ${where} ORDER BY completed_at DESC`,
		)
		.all(...params) as Record<string, unknown>[];
	return rows.map(mapRow);
}

/**
 * Remove the most recent completion entry for a task. Used when a completion is
 * undone so the log stays consistent with the task's actual state.
 */
export function deleteLatestCompletion(taskId: number): boolean {
	const db = getDb();
	const result = db
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
