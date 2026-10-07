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
import { sha256Hex } from "@/server/http/auth";
import { handleMcpRequest } from "@/server/http/mcp";
import type { VapidConfig } from "@/server/push/web-push";
import { fetchAndSyncCalendar } from "@/server/services/calendar";
import {
	dispatchDueReminderPushes,
	vapidSender,
} from "@/server/services/reminder-push";

export type Env = {
	DB: D1Database;
	/** Set with `wrangler secret put FINISH_EM_AUTH_SECRET`. Absent = open API. */
	FINISH_EM_AUTH_SECRET?: string;
	/** Path secret for /mcp/<secret>. Absent = the MCP endpoint does not exist. */
	FINISH_EM_MCP_SECRET?: string;
	/** Web Push. Generate with `bun run push:keys`; private key is a secret. */
	VAPID_PUBLIC_KEY?: string;
	VAPID_PRIVATE_KEY?: string;
	VAPID_SUBJECT?: string;
};

function vapidFrom(env: Env): VapidConfig | undefined {
	if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return undefined;
	return {
		publicKey: env.VAPID_PUBLIC_KEY,
		privateKey: env.VAPID_PRIVATE_KEY,
		subject: env.VAPID_SUBJECT ?? "mailto:finish-em@example.invalid",
	};
}

const app = createApp({
	resolveDb: (c) => createD1Db((c.env as Env).DB),
	getSecret: (c) => (c.env as Env).FINISH_EM_AUTH_SECRET,
	getVapid: (c) => vapidFrom(c.env as Env),
});

export default {
	async fetch(request: Request, env: Env, ctx: unknown) {
		const mcp = await handleMcpRequest(
			request,
			env.FINISH_EM_MCP_SECRET,
			async (method, path, body) => {
				const headers: Record<string, string> = {};
				if (env.FINISH_EM_AUTH_SECRET) {
					headers.authorization = `Bearer ${await sha256Hex(env.FINISH_EM_AUTH_SECRET)}`;
				}
				if (body !== undefined) headers["content-type"] = "application/json";
				const res = await app.fetch(
					new Request(new URL(path, request.url), {
						method,
						headers,
						body: body === undefined ? undefined : JSON.stringify(body),
					}),
					env,
					ctx as never,
				);
				const text = await res.text();
				let parsed: unknown = text;
				try {
					parsed = text ? JSON.parse(text) : null;
				} catch {}
				return { ok: res.ok, status: res.status, body: parsed };
			},
		);
		return mcp ?? app.fetch(request, env, ctx as never);
	},

	/**
	 * Cron Trigger, every 5 minutes: push due reminders, and every 15th minute
	 * refresh the cached calendar. Errors are logged rather than thrown so one
	 * failure doesn't mark the schedule as failing.
	 */
	async scheduled(
		event: { scheduledTime?: number },
		env: Env,
		ctx: { waitUntil(promise: Promise<unknown>): void },
	) {
		const db = createD1Db(env.DB);
		const vapid = vapidFrom(env);
		if (vapid) {
			ctx.waitUntil(
				dispatchDueReminderPushes(db, vapidSender(vapid))
					.then((r) => {
						if (r.reminders > 0) console.log("reminder push:", r);
					})
					.catch((err) => console.error("Reminder push failed:", err)),
			);
		}

		const minute = new Date(event.scheduledTime ?? Date.now()).getUTCMinutes();
		if (minute % 15 !== 0) return;
		ctx.waitUntil(
			fetchAndSyncCalendar(db)
				.then(({ count }) => {
					console.log(`calendar sync: cached ${count} event instances`);
				})
				.catch((err) => {
					console.error("Calendar refresh failed:", err);
				}),
		);
	},
};
