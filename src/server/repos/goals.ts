import { nowIso } from "@/lib/datetime";
import type { Db } from "@/server/db/types";
import { mapGoalRow } from "@/server/repos/mappers";

import type { Goal, GoalPeriod } from "@/server/types";

export async function listGoals(
	db: Db,
	filters?: {
		periodType?: GoalPeriod;
		periodStart?: string;
	},
): Promise<Goal[]> {
	const clauses: string[] = [];
	const values: string[] = [];

	if (filters?.periodType) {
		clauses.push("period_type = ?");
		values.push(filters.periodType);
	}

	if (filters?.periodStart) {
		clauses.push("period_start = ?");
		values.push(filters.periodStart);
	}

	const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

	const rows = await db
		.prepare(`SELECT * FROM goals ${where} ORDER BY period_start DESC, id DESC`)
		.all<Record<string, unknown>>(...values);

	return rows.map(mapGoalRow);
}

export async function getGoal(db: Db, goalId: number): Promise<Goal | null> {
	const row = await db
		.prepare("SELECT * FROM goals WHERE id = ?")
		.get<Record<string, unknown>>(goalId);

	return row ? mapGoalRow(row) : null;
}

export async function createGoal(
	db: Db,
	input: {
		periodType: GoalPeriod;
		periodStart: string;
		title: string;
		done?: boolean;
	},
): Promise<Goal> {
	const now = nowIso();
	const uuid = crypto.randomUUID();

	const row = await db
		.prepare(
			`INSERT INTO goals (uuid, period_type, period_start, title, done, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?)
			 RETURNING *`,
		)
		.get<Record<string, unknown>>(
			uuid,
			input.periodType,
			input.periodStart,
			input.title,
			input.done ? 1 : 0,
			now,
			now,
		);

	return mapGoalRow(row as Record<string, unknown>);
}

export async function updateGoal(
	db: Db,
	goalId: number,
	patch: Partial<{
		periodType: GoalPeriod;
		periodStart: string;
		title: string;
		done: boolean;
	}>,
): Promise<Goal | null> {
	const existing = await getGoal(db, goalId);

	if (!existing) {
		return null;
	}

	const row = await db
		.prepare(
			`UPDATE goals SET
      period_type = ?,
      period_start = ?,
      title = ?,
      done = ?,
      updated_at = ?
     WHERE id = ?
     RETURNING *`,
		)
		.get<Record<string, unknown>>(
			patch.periodType ?? existing.periodType,
			patch.periodStart ?? existing.periodStart,
			patch.title ?? existing.title,
			patch.done === undefined ? (existing.done ? 1 : 0) : patch.done ? 1 : 0,
			nowIso(),
			goalId,
		);

	return row ? mapGoalRow(row) : null;
}

export async function deleteGoal(db: Db, goalId: number): Promise<boolean> {
	const result = await db.prepare("DELETE FROM goals WHERE id = ?").run(goalId);
	return result.changes > 0;
}
