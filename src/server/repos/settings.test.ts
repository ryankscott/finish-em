import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { getDb, resetDbForTests } from "@/server/db/client";
import { getSettings, updateSettings } from "@/server/repos/settings";

const dbPath = path.join(
	os.tmpdir(),
	`finish-em-settings-test-${Date.now()}.db`,
);

beforeEach(() => {
	process.env.TODO_DB_PATH = dbPath;
	resetDbForTests();
	if (fs.existsSync(dbPath)) {
		fs.unlinkSync(dbPath);
	}
});

afterEach(() => {
	resetDbForTests();
	if (fs.existsSync(dbPath)) {
		fs.unlinkSync(dbPath);
	}
});

describe("settings repository", () => {
	it("loads timezone defaults", async () => {
		const db = getDb();
		const settings = await getSettings(db);

		expect(typeof settings.timezone).toBe("string");
		expect(settings.timezone.length).toBeGreaterThan(0);
	});

	it("updates timezone", async () => {
		const db = getDb();
		const updated = await updateSettings(db, { timezone: "UTC" });

		expect(updated.timezone).toBe("UTC");
		expect((await getSettings(db)).timezone).toBe("UTC");
	});
});
