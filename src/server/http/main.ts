/**
 * Desktop server entry point. Serves the JSON API and, in production, the
 * built web frontend from dist/web (SPA fallback to index.html).
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getSettings } from "@/server/repos/settings";
import { fetchAndSyncCalendar } from "@/server/services/calendar";
import {
	computeDigest,
	formatDigestText,
	isDigestEmpty,
} from "@/server/services/digest";
import { processInbox } from "@/server/services/inbox-importer";
import { notifyMacOS } from "@/server/services/notifications";
import { createApp } from "./app";

const CALENDAR_POLL_MS = 15 * 60 * 1000;
const INBOX_POLL_MS = 30 * 1000;
const DIGEST_CHECK_MS = 60 * 1000;
const DIGEST_HOUR = 8;

const port = Number(process.env.PORT || 5717);
const app = createApp();

// Poll the file-drop inbox (e.g. iPhone shortcuts writing .txt files to the
// shared folder) in the background. No-ops when the directory is absent;
// failures are logged but never crash the server.
const refreshInbox = () => {
	processInbox().catch((err) => {
		console.error("Inbox import failed:", err);
	});
};
refreshInbox();
setInterval(refreshInbox, INBOX_POLL_MS);

// Poll the configured Outlook/ICS calendar feed in the background. No-ops when
// no ICS URL is set; failures are logged but never crash the server.
const refreshCalendar = () => {
	fetchAndSyncCalendar().catch((err) => {
		console.error("Calendar refresh failed:", err);
	});
};
refreshCalendar();
setInterval(refreshCalendar, CALENDAR_POLL_MS);

// Once per day, once the local hour reaches DIGEST_HOUR, send a native macOS
// notification summarising overdue/due-today/stale tasks. State is persisted
// to disk (not the DB) so a mid-day server restart doesn't re-fire, and an
// empty digest sends nothing so quiet days stay quiet.
const digestStatePath = path.join(os.homedir(), ".finish-em", "digest-state.json");

function readDigestState(): { lastDigestDate: string | null } {
	try {
		return JSON.parse(fs.readFileSync(digestStatePath, "utf8"));
	} catch {
		return { lastDigestDate: null };
	}
}

function writeDigestState(state: { lastDigestDate: string }) {
	fs.mkdirSync(path.dirname(digestStatePath), { recursive: true });
	fs.writeFileSync(digestStatePath, JSON.stringify(state));
}

function localDateAndHour(timezone: string, now: Date) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: timezone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		hourCycle: "h23",
	}).formatToParts(now);
	const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
	return {
		date: `${get("year")}-${get("month")}-${get("day")}`,
		hour: Number(get("hour")),
	};
}

const checkDigest = async () => {
	try {
		const { timezone } = getSettings();
		const now = new Date();
		const { date, hour } = localDateAndHour(timezone, now);
		if (hour < DIGEST_HOUR) return;

		const state = readDigestState();
		if (state.lastDigestDate === date) return;
		writeDigestState({ lastDigestDate: date });

		const digest = computeDigest(now);
		if (isDigestEmpty(digest)) return;
		await notifyMacOS("finish-em", formatDigestText(digest));
	} catch (err) {
		console.error("Digest check failed:", err);
	}
};

if (process.env.NODE_ENV !== "test" && process.platform === "darwin") {
	checkDigest();
	setInterval(checkDigest, DIGEST_CHECK_MS);
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
