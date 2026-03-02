import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import { resetDbForTests } from "@/server/db/client";
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
	it("loads timezone defaults", () => {
		const settings = getSettings();

		expect(typeof settings.timezone).toBe("string");
		expect(settings.timezone.length).toBeGreaterThan(0);
	});

	it("updates timezone", () => {
		const updated = updateSettings({ timezone: "UTC" });

		expect(updated.timezone).toBe("UTC");
		expect(getSettings().timezone).toBe("UTC");
	});
});
