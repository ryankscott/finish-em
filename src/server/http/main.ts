/**
 * Desktop server entry point. Serves the JSON API and, in production, the
 * built web frontend from dist/web (SPA fallback to index.html).
 */

import fs from "node:fs";
import path from "node:path";
import { getSyncService } from "@/server/sync/sync-service";
import { createApp } from "./app";

const port = Number(process.env.PORT || 5717);
const app = createApp();

// Start the background sync/inbox-import timer. Like the TUI, the timer runs
// even when bidirectional sync is disabled so iPhone inbox imports still flow.
try {
	getSyncService().startAutoSync();
} catch (err) {
	console.error("Failed to start sync service:", err);
}

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
	hostname: "127.0.0.1",
	port,
	fetch: app.fetch,
});

console.log(`READY ${server.port}`);
console.log(`finish-em server listening on http://127.0.0.1:${server.port}`);
if (webDist) {
	console.log(`serving web UI from ${webDist}`);
}
