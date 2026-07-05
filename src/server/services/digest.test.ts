import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { getDb, resetDbForTests } from "@/server/db/client";
import { getInboxProjectId } from "@/server/repos/projects";
import { createTask } from "@/server/repos/tasks";
import { computeDigest, isDigestEmpty } from "@/server/services/digest";

describe("computeDigest", () => {
	let dbPath: string;

	beforeEach(() => {
		dbPath = path.join(os.tmpdir(), `finish-em-digest-test-${randomUUID()}.db`);
		process.env.TODO_DB_PATH = dbPath;
		resetDbForTests();
	});

	afterEach(() => {
		resetDbForTests();
		delete process.env.TODO_DB_PATH;
		for (const suffix of ["", "-wal", "-shm"]) {
			fs.rmSync(`${dbPath}${suffix}`, { force: true });
		}
	});

	function setUpdatedAt(taskId: number, iso: string) {
		getDb().prepare("UPDATE tasks SET updated_at = ? WHERE id = ?").run(iso, taskId);
	}

	it("buckets due-today, overdue, and stale tasks correctly", () => {
		const projectId = getInboxProjectId();
		const now = new Date("2026-07-02T15:00:00.000Z");

		const dueTodayTask = createTask({
			projectId,
			title: "Due today task",
			dueAt: "2026-07-02T20:00:00.000Z",
		});
		const overdueTask = createTask({
			projectId,
			title: "Overdue task",
			dueAt: "2026-06-20T00:00:00.000Z",
		});
		const staleTask = createTask({
			projectId,
			title: "Stale task",
			dueAt: null,
		});
		setUpdatedAt(staleTask.id, "2026-06-01T00:00:00.000Z");

		const freshTask = createTask({
			projectId,
			title: "Fresh task with no due date",
			dueAt: null,
		});

		const digest = computeDigest(now);

		expect(digest.dueToday.map((t) => t.id)).toEqual([dueTodayTask.id]);
		expect(digest.overdue.map((t) => t.id)).toEqual([overdueTask.id]);
		expect(digest.stale.map((t) => t.id)).toEqual([staleTask.id]);
		expect(digest.dueToday.map((t) => t.id)).not.toContain(freshTask.id);
	});

	it("excludes completed and someday tasks", () => {
		const projectId = getInboxProjectId();
		const now = new Date("2026-07-02T15:00:00.000Z");

		const somedayTask = createTask({
			projectId,
			title: "Someday task",
			dueAt: "2026-06-01T00:00:00.000Z",
			someday: true,
		});
		setUpdatedAt(somedayTask.id, "2026-06-01T00:00:00.000Z");

		const digest = computeDigest(now);

		expect(digest.overdue).toHaveLength(0);
		expect(digest.stale).toHaveLength(0);
		expect(isDigestEmpty(digest)).toBe(true);
	});

	it("reports empty digest when nothing needs attention", () => {
		getInboxProjectId();
		const digest = computeDigest(new Date("2026-07-02T15:00:00.000Z"));
		expect(isDigestEmpty(digest)).toBe(true);
	});
});
