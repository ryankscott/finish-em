/**
 * A single counter row that clients poll to learn whether anything has changed,
 * so they can hold cached data instead of re-reading every table on a timer.
 *
 * INVARIANT: every code path that writes to D1 must bump this counter, or
 * clients keep serving stale data until the user hits the manual refresh
 * hotkey. Two paths cover that today:
 *
 *   1. The mutation middleware in src/server/http/app.ts, which bumps after any
 *      successful non-GET /api/* request. New HTTP routes are covered for free.
 *   2. fetchAndSyncCalendar in src/server/services/calendar.ts, which runs from
 *      the cron trigger outside HTTP and bumps itself -- but only when its diff
 *      found a real change. An unconditional bump there would make every client
 *      refetch everything every 15 minutes, which is the cost this table exists
 *      to avoid.
 *
 * Anything that writes outside those two (a future queue consumer, a manual
 * `wrangler d1 execute`) has to call bumpVersion itself.
 */

import { nowIso } from "@/lib/datetime";
import type { Db } from "@/server/db/types";

export async function getVersion(db: Db): Promise<number> {
	const row = await db
		.prepare("SELECT version FROM change_version WHERE id = 1")
		.get<{ version: number }>();
	return row?.version ?? 0;
}

/**
 * Increment the counter and return the value it landed on. RETURNING rather
 * than a follow-up SELECT: the caller needs the new number to stamp on the
 * response, and a second read would cost another round trip.
 */
export async function bumpVersion(db: Db): Promise<number> {
	const row = await db
		.prepare(
			"UPDATE change_version SET version = version + 1, updated_at = ? WHERE id = 1 RETURNING version",
		)
		.get<{ version: number }>(nowIso());
	return row?.version ?? 0;
}
