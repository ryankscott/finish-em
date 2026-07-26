import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { getDb, resetDbForTests } from "@/server/db/client";
import { createProject } from "@/server/repos/projects";
import {
	getCompletionHistory,
	listCompletions,
} from "@/server/repos/task-completion-log";
import { completeTask, createTask, uncompleteTask } from "@/server/repos/tasks";

const dbPath = path.join(
	os.tmpdir(),
	`finish-em-completion-test-${Date.now()}.db`,
);

beforeEach(() => {
	process.env.TODO_DB_PATH = dbPath;
	resetDbForTests();
	if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
});

afterEach(() => {
	resetDbForTests();
	if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
	delete process.env.TODO_DB_PATH;
});

describe("task completion log", () => {
	it("logs a completion when a recurring task is completed", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "Work" });
		const task = await createTask(db, {
			projectId: project.id,
			title: "Daily standup",
			dueAt: "2026-02-15T09:00:00.000Z",
			recurrencePreset: "daily",
		});

		await completeTask(db, task.id);

		const history = await getCompletionHistory(db, task.id);
		expect(history).toHaveLength(1);
		expect(history[0].taskId).toBe(task.id);
		expect(history[0].title).toBe("Daily standup");
		expect(history[0].completedAt).toBeTruthy();
	});

	it("does not log a completion for a non-recurring task", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "Work" });
		const task = await createTask(db, {
			projectId: project.id,
			title: "One-off task",
			dueAt: "2026-02-15T09:00:00.000Z",
		});

		await completeTask(db, task.id);

		expect(await getCompletionHistory(db, task.id)).toHaveLength(0);
	});

	it("removes the latest log entry when a recurring completion is undone", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "Work" });
		const task = await createTask(db, {
			projectId: project.id,
			title: "Weekly review",
			dueAt: "2026-02-15T09:00:00.000Z",
			recurrencePreset: "weekly",
		});

		await completeTask(db, task.id);
		expect(await getCompletionHistory(db, task.id)).toHaveLength(1);

		await uncompleteTask(db, task.id);
		expect(await getCompletionHistory(db, task.id)).toHaveLength(0);
	});

	it("filters completions by date range in listCompletions", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "Work" });
		const a = await createTask(db, {
			projectId: project.id,
			title: "Task A",
			dueAt: "2026-02-15T09:00:00.000Z",
			recurrencePreset: "daily",
		});
		await completeTask(db, a.id);

		const all = await listCompletions(db);
		expect(all.length).toBeGreaterThanOrEqual(1);

		// A window entirely in the past should exclude just-now completions.
		const past = await listCompletions(
			db,
			"2000-01-01T00:00:00.000Z",
			"2000-01-02T00:00:00.000Z",
		);
		expect(past).toHaveLength(0);
	});
});
