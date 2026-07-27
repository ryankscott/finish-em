/**
 * Local development server entry point. Serves the JSON API and, in production,
 * the built web frontend from dist/web (SPA fallback to index.html).
 *
 * This is the Bun-specific entry. The deployed target is src/server/worker.ts
 * (Cloudflare Workers); everything here that touches Bun.serve, the filesystem,
 * or setInterval exists only to keep local development working.
 */

import fs from "node:fs";
import path from "node:path";
import { getDb } from "@/server/db/client";
import { fetchAndSyncCalendar } from "@/server/services/calendar";
import { createApp } from "./app";

const CALENDAR_POLL_MS = 15 * 60 * 1000;

const port = Number(process.env.PORT || 5717);
const app = createApp({
	resolveDb: () => getDb(),
	getSecret: () => process.env.FINISH_EM_AUTH_SECRET,
});

// Poll the configured Outlook/ICS calendar feed in the background. No-ops when
// no ICS URL is set; failures are logged but never crash the server. In
// production this is a Cron Trigger instead (see src/server/worker.ts).
const refreshCalendar = () => {
	fetchAndSyncCalendar(getDb()).catch((err) => {
		console.error("Calendar refresh failed:", err);
	});
};
refreshCalendar();
setInterval(refreshCalendar, CALENDAR_POLL_MS);

const webDistCandidates = [
	process.env.WEB_DIST_PATH,
	path.join(path.dirname(process.execPath), "web"),
	path.join(import.meta.dir, "../../../dist/web"),
].filter((p): p is string => Boolean(p));

const webDist = webDistCandidates.find((p) =>
	fs.existsSync(path.join(p, "index.html")),
);

if (webDist) {
	app.get("*", async (c, next) => {
		if (c.req.path.startsWith("/api/")) return next();
		const requested = path.normalize(path.join(webDist, c.req.path));
		const filePath =
			requested.startsWith(webDist) &&
			fs.existsSync(requested) &&
			fs.statSync(requested).isFile()
				? requested
				: path.join(webDist, "index.html");
		const file = Bun.file(filePath);
		return new Response(file, {
			headers: { "Content-Type": file.type },
		});
	});
}

const server = Bun.serve({
	hostname: process.env.HOST ?? "127.0.0.1",
	port,
	fetch: app.fetch,
});

console.log(`READY ${server.port}`);
console.log(`finish-em server listening on http://127.0.0.1:${server.port}`);
if (webDist) {
	console.log(`serving web UI from ${webDist}`);
}
