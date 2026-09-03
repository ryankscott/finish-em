/**
 * Guards the two writes fetchAndSyncCalendar gates on a real change. The cron
 * fires every 15 minutes and almost every run finds nothing new, so an
 * ungated bump here would make every connected client refetch its whole screen
 * 96 times a day -- exactly the cost the change counter exists to remove.
 *
 * node-ical is mocked at module scope, so this lives in its own file rather
 * than alongside the expandEvent tests that use the real parser.
 */

import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

let feed: Record<string, unknown> = {};

mock.module("node-ical", () => ({
	async: { fromURL: async () => feed },
}));

const { getDb, resetDbForTests } = await import("@/server/db/client");
const { getVersion } = await import("@/server/repos/change-version");
const { getSettings, updateSettings } = await import("@/server/repos/settings");
const { fetchAndSyncCalendar } = await import("@/server/services/calendar");

const dbPath = path.join(os.tmpdir(), `finish-em-cal-sync-${Date.now()}.db`);

function cleanDb() {
	resetDbForTests();
	for (const suffix of ["", "-wal", "-shm"]) {
		const file = `${dbPath}${suffix}`;
		if (fs.existsSync(file)) fs.unlinkSync(file);
	}
}

beforeEach(() => {
	process.env.TODO_DB_PATH = dbPath;
	cleanDb();
});

afterEach(() => {
	cleanDb();
});

const NOW = new Date("2026-06-10T12:00:00.000Z");

function vevent(start: string, summary = "Standup") {
	return {
		type: "VEVENT",
		uid: "standup",
		summary,
		start: new Date(start),
		end: new Date(start),
	};
}

describe("fetchAndSyncCalendar change gating", () => {
	it("bumps the version on the first sync and holds it on a quiet re-sync", async () => {
		const db = getDb();
		await updateSettings(db, {
			calendarIcsUrl: "https://example.test/cal.ics",
		});
		feed = { standup: vevent("2026-06-11T09:00:00.000Z") };

		const before = await getVersion(db);
		await fetchAndSyncCalendar(db, NOW);
		const afterFirst = await getVersion(db);
		expect(afterFirst).toBeGreaterThan(before);

		// Same feed, an hour later so the stamp is not yet stale.
		await fetchAndSyncCalendar(db, new Date("2026-06-10T12:30:00.000Z"));
		expect(await getVersion(db)).toBe(afterFirst);
	});

	it("leaves the last-synced stamp alone on a quiet re-sync", async () => {
		const db = getDb();
		await updateSettings(db, {
			calendarIcsUrl: "https://example.test/cal.ics",
		});
		feed = { standup: vevent("2026-06-11T09:00:00.000Z") };

		await fetchAndSyncCalendar(db, NOW);
		const stamp = (await getSettings(db)).calendarLastSyncedAt;

		await fetchAndSyncCalendar(db, new Date("2026-06-10T12:30:00.000Z"));
		expect((await getSettings(db)).calendarLastSyncedAt).toBe(stamp);
	});

	it("refreshes the stamp once it is over an hour old, even with no change", async () => {
		const db = getDb();
		await updateSettings(db, {
			calendarIcsUrl: "https://example.test/cal.ics",
		});
		feed = { standup: vevent("2026-06-11T09:00:00.000Z") };
		await fetchAndSyncCalendar(db, NOW);
		const version = await getVersion(db);

		const later = new Date("2026-06-10T14:00:00.000Z");
		await fetchAndSyncCalendar(db, later);
		expect((await getSettings(db)).calendarLastSyncedAt).toBe(
			later.toISOString(),
		);
		// A stamp refresh is not a data change, so clients stay put.
		expect(await getVersion(db)).toBe(version);
	});

	it("bumps when a meeting moves", async () => {
		const db = getDb();
		await updateSettings(db, {
			calendarIcsUrl: "https://example.test/cal.ics",
		});
		feed = { standup: vevent("2026-06-11T09:00:00.000Z") };
		await fetchAndSyncCalendar(db, NOW);
		const version = await getVersion(db);

		feed = { standup: vevent("2026-06-11T10:00:00.000Z") };
		await fetchAndSyncCalendar(db, new Date("2026-06-10T12:30:00.000Z"));
		expect(await getVersion(db)).toBeGreaterThan(version);
	});

	it("does nothing at all when no ICS url is configured", async () => {
		const db = getDb();
		const before = await getVersion(db);
		const result = await fetchAndSyncCalendar(db, NOW);
		expect(result.count).toBe(0);
		expect(await getVersion(db)).toBe(before);
	});
});
