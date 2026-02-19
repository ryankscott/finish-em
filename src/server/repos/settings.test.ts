import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

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
	it("allows non-assistant updates when LM Studio model is unset", () => {
		const updated = updateSettings({ timezone: "UTC" });

		expect(updated.timezone).toBe("UTC");
	});

	it("requires a model when saving LM Studio provider settings", () => {
		expect(() =>
			updateSettings({ aiProvider: "lmstudio", aiModel: null }),
		).toThrow("LM Studio model is required");
	});

	it("accepts LM Studio settings when model is provided", () => {
		const updated = updateSettings({
			aiProvider: "lmstudio",
			aiModel: "qwen/qwen3-vl-4b",
		});

		expect(updated.aiProvider).toBe("lmstudio");
		expect(updated.aiModel).toBe("qwen/qwen3-vl-4b");
		expect(getSettings().aiModel).toBe("qwen/qwen3-vl-4b");
	});

	it("rewrites legacy LM Studio /api/v1 base URL when updating settings", () => {
		const updated = updateSettings({
			aiProvider: "lmstudio",
			aiBaseUrl: "http://localhost:11434/api/v1",
			aiModel: "qwen/qwen3-vl-4b",
		});

		expect(updated.aiBaseUrl).toBe("http://localhost:11434/v1");
	});

	it("rewrites legacy LM Studio /api/v1 base URL when reading settings", () => {
		const db = getDb();
		db.prepare(
			"UPDATE settings SET ai_provider = ?, ai_base_url = ?, ai_model = ?, updated_at = ? WHERE id = 1",
		).run(
			"lmstudio",
			"http://localhost:11434/api/v1",
			"qwen/qwen3-vl-4b",
			"2026-02-19T00:00:00.000Z",
		);

		const mapped = getSettings();
		expect(mapped.aiBaseUrl).toBe("http://localhost:11434/v1");

		const persisted = db
			.prepare("SELECT ai_base_url FROM settings WHERE id = 1")
			.get() as { ai_base_url: string };
		expect(persisted.ai_base_url).toBe("http://localhost:11434/v1");
	});
});
