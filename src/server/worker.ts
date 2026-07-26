/**
 * Cloudflare Worker entry point. The deployed target.
 *
 * Replaces src/server/http/main.ts, which stays for local Bun development.
 * Everything main.ts does with Bun.serve, the filesystem, and setInterval is
 * handled by the platform here: static assets come from the [assets] binding,
 * and the calendar poll is a Cron Trigger instead of a timer, because a Worker
 * has no long-lived process to hold one.
 */

import { createD1Db, type D1Database } from "@/server/db/d1";
import { createApp } from "@/server/http/app";
import { fetchAndSyncCalendar } from "@/server/services/calendar";

export type Env = {
	DB: D1Database;
	/** Set with `wrangler secret put FINISH_EM_AUTH_SECRET`. Absent = open API. */
	FINISH_EM_AUTH_SECRET?: string;
};

const app = createApp({
	resolveDb: (c) => createD1Db((c.env as Env).DB),
	getSecret: (c) => (c.env as Env).FINISH_EM_AUTH_SECRET,
});

export default {
	fetch: app.fetch,

	/**
	 * Cron Trigger: refresh the cached calendar. Errors are logged rather than
	 * thrown so one bad ICS response doesn't mark the schedule as failing.
	 */
	async scheduled(
		_event: unknown,
		env: Env,
		ctx: { waitUntil(promise: Promise<unknown>): void },
	) {
		ctx.waitUntil(
			fetchAndSyncCalendar(createD1Db(env.DB))
				.then(({ count }) => {
					console.log(`calendar sync: cached ${count} event instances`);
				})
				.catch((err) => {
					console.error("Calendar refresh failed:", err);
				}),
		);
	},
};
