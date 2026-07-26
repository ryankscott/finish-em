import { nowIso } from "@/server/db/client";
import type { Db } from "@/server/db/types";
import { mapCalendarEventRow } from "@/server/repos/mappers";
import type { CalendarEvent } from "@/server/types";

export type CalendarEventInput = {
	uid: string;
	recurrenceId?: string;
	summary: string;
	startAt: string;
	endAt: string | null;
	allDay: boolean;
	location: string | null;
	organizer: string | null;
};

const UPSERT_SQL = `INSERT INTO calendar_events (
      uid, recurrence_id, summary, start_at, end_at, all_day, location, organizer, last_seen_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(uid, recurrence_id) DO UPDATE SET
      summary = excluded.summary,
      start_at = excluded.start_at,
      end_at = excluded.end_at,
      all_day = excluded.all_day,
      location = excluded.location,
      organizer = excluded.organizer,
      last_seen_at = excluded.last_seen_at,
      updated_at = excluded.updated_at`;

/**
 * D1 caps a batch at ~1000 statements. A calendar sync window is a few hundred
 * events today, but chunking means an unusually busy feed degrades into several
 * batches instead of failing outright.
 */
const BATCH_LIMIT = 500;

/**
 * Insert or update cached calendar events keyed by (uid, recurrence_id), and
 * stamp last_seen_at with `syncedAt` so a later prune can drop events that
 * disappeared from the feed (cancelled meetings).
 *
 * Batched rather than looped: on D1 every statement is a network round trip, and
 * a full sync is hundreds of events.
 */
export async function upsertEvents(
	db: Db,
	events: CalendarEventInput[],
	syncedAt: string,
): Promise<void> {
	const ops = events.map((event) => ({
		sql: UPSERT_SQL,
		params: [
			event.uid,
			event.recurrenceId ?? "",
			event.summary,
			event.startAt,
			event.endAt,
			event.allDay ? 1 : 0,
			event.location,
			event.organizer,
			syncedAt,
			syncedAt,
		],
	}));

	for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
		await db.batch(ops.slice(i, i + BATCH_LIMIT));
	}
}

/** Delete cached events not seen in the most recent sync run. */
export async function pruneStale(db: Db, syncedAt: string): Promise<number> {
	const result = await db
		.prepare("DELETE FROM calendar_events WHERE last_seen_at < ?")
		.run(syncedAt);
	return result.changes;
}

export async function listEvents(
	db: Db,
	range: {
		from?: string;
		to?: string;
	} = {},
): Promise<CalendarEvent[]> {
	const clauses: string[] = [];
	const values: string[] = [];
	if (range.from) {
		clauses.push("start_at >= ?");
		values.push(range.from);
	}
	if (range.to) {
		clauses.push("start_at <= ?");
		values.push(range.to);
	}
	const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
	const rows = await db
		.prepare(`SELECT * FROM calendar_events ${where} ORDER BY start_at ASC`)
		.all<Record<string, unknown>>(...values);
	return rows.map(mapCalendarEventRow);
}

export async function getEventByUid(
	db: Db,
	uid: string,
): Promise<CalendarEvent | null> {
	const row = await db
		.prepare(
			"SELECT * FROM calendar_events WHERE uid = ? ORDER BY start_at ASC LIMIT 1",
		)
		.get<Record<string, unknown>>(uid);
	return row ? mapCalendarEventRow(row) : null;
}

export async function clearAllEvents(db: Db): Promise<void> {
	await db.prepare("DELETE FROM calendar_events").run();
}

/** Touch all cached events so the next prune treats them as still present. */
export async function touchAll(db: Db): Promise<void> {
	await db.prepare("UPDATE calendar_events SET last_seen_at = ?").run(nowIso());
}
