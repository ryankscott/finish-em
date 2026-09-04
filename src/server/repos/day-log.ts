import { nowIso } from "@/lib/datetime";
import type { Db } from "@/server/db/types";
import { mapDayLogRow } from "@/server/repos/mappers";

import type { DayLog } from "@/server/types";

const EMPTY = (day: string): DayLog => ({
	day,
	plannedAt: null,
	closedAt: null,
});

/**
 * Whether a day has been planned and whether it has been closed. Kept as stored
 * state rather than derived, because "no tasks in the plan" has two very
 * different meanings -- today is genuinely clear, or you never sat down to plan
 * it -- and only the first should stop the app from offering to help.
 */
export async function getDayLog(db: Db, day: string): Promise<DayLog> {
	const row = await db
		.prepare("SELECT * FROM day_log WHERE day = ?")
		.get<Record<string, unknown>>(day);
	return row ? mapDayLogRow(row) : EMPTY(day);
}

async function stamp(
	db: Db,
	day: string,
	column: "planned_at" | "closed_at",
): Promise<DayLog> {
	const now = nowIso();
	const row = await db
		.prepare(
			`INSERT INTO day_log (day, ${column}, created_at, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(day) DO UPDATE SET ${column} = excluded.${column}, updated_at = excluded.updated_at
       RETURNING *`,
		)
		.get<Record<string, unknown>>(day, now, now, now);
	return row ? mapDayLogRow(row) : EMPTY(day);
}

export async function markDayPlanned(db: Db, day: string): Promise<DayLog> {
	return stamp(db, day, "planned_at");
}

export async function markDayClosed(db: Db, day: string): Promise<DayLog> {
	return stamp(db, day, "closed_at");
}
