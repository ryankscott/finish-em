import type { BatchOp, Db } from "@/server/db/types";
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

const INSERT_SQL = `INSERT INTO calendar_events (
      uid, recurrence_id, summary, start_at, end_at, all_day, location, organizer, last_seen_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const UPDATE_SQL = `UPDATE calendar_events SET
      summary = ?,
      start_at = ?,
      end_at = ?,
      all_day = ?,
      location = ?,
      organizer = ?,
      updated_at = ?
    WHERE id = ?`;

const DELETE_SQL = "DELETE FROM calendar_events WHERE id = ?";

/**
 * D1 caps a batch at ~1000 statements. A calendar sync window is a few hundred
 * events today, but chunking means an unusually busy feed degrades into several
 * batches instead of failing outright.
 */
const BATCH_LIMIT = 500;

export type SyncEventsResult = {
	inserted: number;
	updated: number;
	deleted: number;
};

/** The cached columns a sync compares against, keyed by (uid, recurrence_id). */
type CachedEvent = {
	id: number;
	uid: string;
	recurrence_id: string;
	summary: string;
	start_at: string;
	end_at: string | null;
	all_day: number;
	location: string | null;
	organizer: string | null;
};

function cacheKey(uid: string, recurrenceId: string): string {
	// \u0000 cannot appear in an ICS UID, so it is a safe separator.
	return `${uid}\u0000${recurrenceId}`;
}

/** SQLite stores all_day as 0/1; the feed gives a boolean. */
function sameEvent(cached: CachedEvent, event: CalendarEventInput): boolean {
	return (
		cached.summary === event.summary &&
		cached.start_at === event.startAt &&
		(cached.end_at ?? null) === (event.endAt ?? null) &&
		cached.all_day === (event.allDay ? 1 : 0) &&
		(cached.location ?? null) === (event.location ?? null) &&
		(cached.organizer ?? null) === (event.organizer ?? null)
	);
}

/**
 * Reconcile the cached calendar with a freshly fetched feed: insert new
 * instances, update changed ones, delete instances that disappeared (cancelled
 * meetings).
 *
 * Diffed in JS against one full read rather than blind-upserting every row.
 * The old version stamped last_seen_at and updated_at on every conflict, so a
 * 15-minute cron rewrote all ~175 rows (plus two index entries each) 96 times a
 * day whether or not a single meeting had moved -- around 50k D1 rows written
 * daily for no semantic change. A quiet sync now writes nothing at all, and the
 * returned counts tell callers whether it is worth bumping the change version.
 *
 * The read costs the same as the prune it replaces, which full-scanned the
 * table on an unindexed last_seen_at.
 *
 * Writes are batched: on D1 every statement is a network round trip.
 */
export async function syncEvents(
	db: Db,
	events: CalendarEventInput[],
	syncedAt: string,
): Promise<SyncEventsResult> {
	const cachedRows = await db
		.prepare(
			`SELECT id, uid, recurrence_id, summary, start_at, end_at, all_day, location, organizer
       FROM calendar_events`,
		)
		.all<CachedEvent>();

	const cached = new Map<string, CachedEvent>();
	for (const row of cachedRows) {
		cached.set(cacheKey(row.uid, row.recurrence_id ?? ""), row);
	}

	const ops: BatchOp[] = [];
	const seen = new Set<string>();
	let inserted = 0;
	let updated = 0;

	for (const event of events) {
		const recurrenceId = event.recurrenceId ?? "";
		const key = cacheKey(event.uid, recurrenceId);
		// A feed can expand to the same instance twice; first one wins, and
		// without this the second would be counted as a delete.
		if (seen.has(key)) continue;
		seen.add(key);

		const row = cached.get(key);
		if (!row) {
			ops.push({
				sql: INSERT_SQL,
				params: [
					event.uid,
					recurrenceId,
					event.summary,
					event.startAt,
					event.endAt,
					event.allDay ? 1 : 0,
					event.location,
					event.organizer,
					syncedAt,
					syncedAt,
				],
			});
			inserted += 1;
			continue;
		}

		if (sameEvent(row, event)) continue;

		ops.push({
			sql: UPDATE_SQL,
			params: [
				event.summary,
				event.startAt,
				event.endAt,
				event.allDay ? 1 : 0,
				event.location,
				event.organizer,
				syncedAt,
				row.id,
			],
		});
		updated += 1;
	}

	let deleted = 0;
	for (const [key, row] of cached) {
		if (seen.has(key)) continue;
		ops.push({ sql: DELETE_SQL, params: [row.id] });
		deleted += 1;
	}

	for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
		await db.batch(ops.slice(i, i + BATCH_LIMIT));
	}

	return { inserted, updated, deleted };
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
