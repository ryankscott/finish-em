import { getDb, nowIso } from "@/server/db/client";
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

/**
 * Insert or update cached calendar events keyed by (uid, recurrence_id), and
 * stamp last_seen_at with `syncedAt` so a later prune can drop events that
 * disappeared from the feed (cancelled meetings).
 */
export function upsertEvents(
	events: CalendarEventInput[],
	syncedAt: string,
): void {
	const db = getDb();
	const stmt = db.prepare(
		`INSERT INTO calendar_events (
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
      updated_at = excluded.updated_at`,
	);
	for (const event of events) {
		stmt.run(
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
		);
	}
}

/** Delete cached events not seen in the most recent sync run. */
export function pruneStale(syncedAt: string): number {
	const db = getDb();
	const result = db
		.prepare("DELETE FROM calendar_events WHERE last_seen_at < ?")
		.run(syncedAt);
	return result.changes;
}

export function listEvents(range: {
	from?: string;
	to?: string;
} = {}): CalendarEvent[] {
	const db = getDb();
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
	const rows = db
		.prepare(`SELECT * FROM calendar_events ${where} ORDER BY start_at ASC`)
		.all(...values) as Record<string, unknown>[];
	return rows.map(mapCalendarEventRow);
}

export function getEventByUid(uid: string): CalendarEvent | null {
	const db = getDb();
	const row = db
		.prepare(
			"SELECT * FROM calendar_events WHERE uid = ? ORDER BY start_at ASC LIMIT 1",
		)
		.get(uid) as Record<string, unknown> | undefined;
	return row ? mapCalendarEventRow(row) : null;
}

export function clearAllEvents(): void {
	getDb().prepare("DELETE FROM calendar_events").run();
}

/** Touch all cached events so the next prune treats them as still present. */
export function touchAll(): void {
	getDb()
		.prepare("UPDATE calendar_events SET last_seen_at = ?")
		.run(nowIso());
}
