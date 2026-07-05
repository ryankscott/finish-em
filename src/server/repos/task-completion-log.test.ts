import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { resetDbForTests } from "@/server/db/client";
import { createProject } from "@/server/repos/projects";
import {
	getCompletionHistory,
	listCompletions,
} from "@/server/repos/task-completion-log";
import {
	completeTask,
	createTask,
	uncompleteTask,
} from "@/server/repos/tasks";

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
	it("logs a completion when a recurring task is completed", () => {
		const project = createProject({ name: "Work" });
		const task = createTask({
			projectId: project.id,
			title: "Daily standup",
			dueAt: "2026-02-15T09:00:00.000Z",
			recurrencePreset: "daily",
		});

		completeTask(task.id);

		const history = getCompletionHistory(task.id);
		expect(history).toHaveLength(1);
		expect(history[0].taskId).toBe(task.id);
		expect(history[0].title).toBe("Daily standup");
		expect(history[0].completedAt).toBeTruthy();
	});

	it("does not log a completion for a non-recurring task", () => {
		const project = createProject({ name: "Work" });
		const task = createTask({
			projectId: project.id,
			title: "One-off task",
			dueAt: "2026-02-15T09:00:00.000Z",
		});

		completeTask(task.id);

		expect(getCompletionHistory(task.id)).toHaveLength(0);
	});

	it("removes the latest log entry when a recurring completion is undone", () => {
		const project = createProject({ name: "Work" });
		const task = createTask({
			projectId: project.id,
			title: "Weekly review",
			dueAt: "2026-02-15T09:00:00.000Z",
			recurrencePreset: "weekly",
		});

		completeTask(task.id);
		expect(getCompletionHistory(task.id)).toHaveLength(1);

		uncompleteTask(task.id);
		expect(getCompletionHistory(task.id)).toHaveLength(0);
	});

	it("filters completions by date range in listCompletions", () => {
		const project = createProject({ name: "Work" });
		const a = createTask({
			projectId: project.id,
			title: "Task A",
			dueAt: "2026-02-15T09:00:00.000Z",
			recurrencePreset: "daily",
		});
		completeTask(a.id);

		const all = listCompletions();
		expect(all.length).toBeGreaterThanOrEqual(1);

		// A window entirely in the past should exclude just-now completions.
		const past = listCompletions(
			"2000-01-01T00:00:00.000Z",
			"2000-01-02T00:00:00.000Z",
		);
		expect(past).toHaveLength(0);
	});
});
