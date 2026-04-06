import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { resetDbForTests } from "@/server/db/client";
import { listTasks } from "@/server/repos/tasks";
import { processInbox } from "@/server/sync/inbox-importer";

function makeTempDir(): string {
	return fs.mkdtempSync(path.join(os.tmpdir(), "finish-em-inbox-test-"));
}

function writeFile(dir: string, name: string, content: string): string {
	const filePath = path.join(dir, name);
	fs.writeFileSync(filePath, content, "utf8");
	return filePath;
}

describe("processInbox", () => {
	let tmpDir: string;

	beforeEach(() => {
		resetDbForTests();
		tmpDir = makeTempDir();
	});

	afterEach(() => {
		fs.rmSync(tmpDir, { recursive: true, force: true });
		resetDbForTests();
	});

	it("returns zeros when inbox directory does not exist", async () => {
		const result = await processInbox("/nonexistent/path/that/does/not/exist");
		expect(result).toEqual({ imported: 0, failed: 0, errors: [] });
	});

	it("returns zeros for an empty inbox directory", async () => {
		const result = await processInbox(tmpDir);
		expect(result).toEqual({ imported: 0, failed: 0, errors: [] });
	});

	it("imports a single task from a .txt file and deletes it", async () => {
		writeFile(tmpDir, "task.txt", "Buy milk");

		const result = await processInbox(tmpDir);

		expect(result.imported).toBe(1);
		expect(result.failed).toBe(0);
		expect(result.errors).toHaveLength(0);

		const tasks = listTasks({ deletedOnly: false });
		expect(tasks.some((t) => t.title === "Buy milk")).toBe(true);

		// File should have been deleted
		expect(fs.existsSync(path.join(tmpDir, "task.txt"))).toBe(false);
	});

	it("imports multiple task files in a single pass", async () => {
		writeFile(tmpDir, "task1.txt", "Call dentist");
		writeFile(tmpDir, "task2.txt", "Review PR");
		writeFile(tmpDir, "task3.txt", "Renew passport");

		const result = await processInbox(tmpDir);

		expect(result.imported).toBe(3);
		expect(result.failed).toBe(0);

		const titles = listTasks({ deletedOnly: false }).map((t) => t.title);
		expect(titles).toContain("Call dentist");
		expect(titles).toContain("Review PR");
		expect(titles).toContain("Renew passport");
	});

	it("deletes empty .txt files without counting them as imported", async () => {
		writeFile(tmpDir, "empty.txt", "   ");

		const result = await processInbox(tmpDir);

		expect(result.imported).toBe(0);
		expect(result.failed).toBe(0);
		expect(fs.existsSync(path.join(tmpDir, "empty.txt"))).toBe(false);
	});

	it("ignores non-.txt files", async () => {
		writeFile(tmpDir, "task.json", '{"title":"Ignore me"}');
		writeFile(tmpDir, "notes.md", "# Ignore me");
		writeFile(tmpDir, "real.txt", "Actual task");

		const result = await processInbox(tmpDir);

		expect(result.imported).toBe(1);
		const tasks = listTasks({ deletedOnly: false });
		expect(tasks.some((t) => t.title === "Actual task")).toBe(true);
	});

	it("ignores dotfiles", async () => {
		writeFile(tmpDir, ".DS_Store.txt", "Ignore this");
		writeFile(tmpDir, "real.txt", "Keep this");

		const result = await processInbox(tmpDir);

		expect(result.imported).toBe(1);
	});

	it("parses quick-add syntax: priority, and date", async () => {
		writeFile(tmpDir, "task.txt", "Submit report p1 tomorrow");

		await processInbox(tmpDir);

		const tasks = listTasks({ deletedOnly: false });
		const task = tasks.find((t) => t.title === "Submit report");
		expect(task).toBeDefined();
		expect(task?.priority).toBe(1);
		expect(task?.dueAt).not.toBeNull();
	});

	it("moves failed files into a failed/ subdirectory to prevent retries", async () => {
		// Trigger a real import failure by resetting the DB schema without re-seeding
		// the inbox project, so createTask throws "Invalid project".
		resetDbForTests();
		// Now destroy the DB so all SQL calls throw, causing createTaskFromQuickAdd to fail.
		const { getDb } = await import("@/server/db/client");
		const db = getDb();
		db.exec("DROP TABLE tasks");

		writeFile(tmpDir, "broken.txt", "Some task");

		const result = await processInbox(tmpDir);

		expect(result.failed).toBe(1);
		expect(result.errors).toHaveLength(1);
		// Original file should be gone from the inbox root
		expect(fs.existsSync(path.join(tmpDir, "broken.txt"))).toBe(false);
		// And should exist under failed/
		expect(fs.existsSync(path.join(tmpDir, "failed", "broken.txt"))).toBe(true);

		// Restore DB for afterEach cleanup
		resetDbForTests();
	});
});
