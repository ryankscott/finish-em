import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { resetDbForTests } from "@/server/db/client";
import { createApp } from "@/server/http/app";
import type { ApiClient } from "@/shared/api-client";
import { createHttpApi } from "@/shared/http-api";
import { createDirectApi } from "@/tui/direct-api";

const dbPath = path.join(os.tmpdir(), `finish-em-contract-${Date.now()}.db`);

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

const clients: Array<[string, () => ApiClient]> = [
	["direct", () => createDirectApi()],
	[
		"http",
		() => {
			const app = createApp();
			return createHttpApi((input, init) => app.request(input, init));
		},
	],
];

for (const [name, makeClient] of clients) {
	describe(`api contract (${name})`, () => {
		it("reads and updates settings", async () => {
			const api = makeClient();
			const settings = await api.getSettings();
			expect(settings.id).toBe(1);
			const updated = await api.updateSettings({
				timezone: "America/New_York",
			});
			expect(updated.timezone).toBe("America/New_York");
		});

		it("supports the project lifecycle and inbox protection", async () => {
			const api = makeClient();
			const project = await api.createProject({ name: "Work", emoji: "🛠️" });
			expect(project.name).toBe("Work");
			expect(project.emoji).toBe("🛠️");

			const renamed = await api.updateProject(project.id, { name: "Werk" });
			expect(renamed.name).toBe("Werk");

			const projects = await api.listProjects();
			expect(projects.map((p) => p.name)).toContain("Werk");

			const inbox = projects.find((p) => p.isInbox);
			expect(inbox).toBeDefined();
			await expect(api.deleteProject(inbox!.id)).rejects.toThrow();

			await api.deleteProject(project.id);
			const after = await api.listProjects();
			expect(after.map((p) => p.name)).not.toContain("Werk");
		});

		it("supports the task lifecycle: create, update, complete, delete, undelete", async () => {
			const api = makeClient();
			const project = await api.createProject({ name: "Tasks" });

			const task = await api.createTask({
				projectId: project.id,
				title: "Ship it",
				priority: 1,
				dueAt: "2026-06-11T09:00:00.000Z",
			});
			expect(task.priority).toBe(1);
			expect(task.status).toBe("open");

			const updated = await api.updateTask(task.id, {
				title: "Ship it now",
				priority: 2,
			});
			expect(updated.title).toBe("Ship it now");
			expect(updated.priority).toBe(2);

			const completed = await api.completeTask(task.id);
			expect(completed.status).toBe("completed");
			const reopened = await api.uncompleteTask(task.id);
			expect(reopened.status).toBe("open");

			await api.deleteTask(task.id);
			const open = await api.listTasks({ projectId: project.id });
			expect(open).toHaveLength(0);

			const deleted = await api.listDeletedTasks();
			expect(deleted.map((t) => t.id)).toContain(task.id);

			const restored = await api.undeleteTask(task.id);
			expect(restored.deletedAt).toBeNull();
		});

		it("filters tasks by query params", async () => {
			const api = makeClient();
			const project = await api.createProject({ name: "Filters" });
			const parent = await api.createTask({
				projectId: project.id,
				title: "Parent",
				priority: 3,
			});
			await api.createTask({
				projectId: project.id,
				title: "Child",
				parentTaskId: parent.id,
				priority: 1,
			});

			const roots = await api.listTasks({
				projectId: project.id,
				rootsOnly: true,
			});
			expect(roots.map((t) => t.title)).toEqual(["Parent"]);

			const children = await api.listTasks({ parentTaskId: parent.id });
			expect(children.map((t) => t.title)).toEqual(["Child"]);

			const p1 = await api.listTasks({ projectId: project.id, priority: 1 });
			expect(p1.map((t) => t.title)).toEqual(["Child"]);
		});

		it("rejects invalid task creation the same way", async () => {
			const api = makeClient();
			await expect(
				(async () => api.createTask({ projectId: 99999, title: "Orphan" }))(),
			).rejects.toThrow();
		});

		it("supports goals", async () => {
			const api = makeClient();
			const goal = await api.createGoal({
				periodType: "weekly",
				periodStart: "2026-06-08",
				title: "Ship the desktop app",
			});
			expect(goal.done).toBe(false);

			const done = await api.updateGoal(goal.id, { done: true });
			expect(done.done).toBe(true);

			const goals = await api.listGoals({
				periodType: "weekly",
				periodStart: "2026-06-08",
			});
			expect(goals).toHaveLength(1);

			await api.deleteGoal(goal.id);
			expect(await api.listGoals({})).toHaveLength(0);
		});

		it("supports reminders with task titles", async () => {
			const api = makeClient();
			const project = await api.createProject({ name: "Reminders" });
			const task = await api.createTask({
				projectId: project.id,
				title: "Call vet",
			});

			const reminder = await api.createReminder(task.id, {
				remindAt: "2020-01-01T09:00:00.000Z",
			});
			expect(reminder.taskId).toBe(task.id);

			const forTask = await api.listTaskReminders(task.id);
			expect(forTask).toHaveLength(1);

			const all = await api.listAllReminders();
			expect(all[0]?.taskTitle).toBe("Call vet");

			const due = await api.listDueReminders();
			expect(due.map((r) => r.id)).toContain(reminder.id);

			await api.deleteReminder(reminder.id);
			expect(await api.listTaskReminders(task.id)).toHaveLength(0);
		});
	});
}

describe("openapi document", () => {
	it("is served and covers every API route", async () => {
		const app = createApp();
		const response = await app.request("/api/openapi.json");
		expect(response.status).toBe(200);
		const doc = (await response.json()) as {
			openapi: string;
			paths: Record<string, unknown>;
		};
		expect(doc.openapi).toBe("3.1.0");
		for (const expected of [
			"/api/settings",
			"/api/projects",
			"/api/projects/{id}",
			"/api/tasks",
			"/api/tasks/deleted",
			"/api/tasks/{id}",
			"/api/tasks/{id}/complete",
			"/api/tasks/{id}/uncomplete",
			"/api/tasks/{id}/undelete",
			"/api/tasks/{id}/reminders",
			"/api/goals",
			"/api/goals/{id}",
			"/api/reminders",
			"/api/reminders/due",
			"/api/reminders/{id}",
		]) {
			expect(Object.keys(doc.paths)).toContain(expected);
		}
	});
});
