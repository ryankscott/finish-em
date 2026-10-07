import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { getDb, resetDbForTests } from "@/server/db/client";
import { createApp } from "@/server/http/app";
import type { ApiClient } from "@/shared/api-client";
import { createHttpApi } from "@/shared/http-api";

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

function makeClient(): ApiClient {
	const app = createApp({ resolveDb: () => getDb() });
	return createHttpApi(async (input, init) => app.request(input, init));
}

describe("change version", () => {
	it("bumps on mutations and holds steady on reads", async () => {
		const api = makeClient();
		const start = (await api.getChanges()).version;

		// Reads must not move it, or every poll would trigger a refetch storm.
		await api.listTasks();
		await api.listProjects();
		expect((await api.getChanges()).version).toBe(start);

		const project = await api.createProject({ name: "Work" });
		const afterCreate = (await api.getChanges()).version;
		expect(afterCreate).toBeGreaterThan(start);

		const task = await api.createTask({
			projectId: project.id,
			title: "Ship it",
		});
		await api.updateTask(task.id, { title: "Ship it twice" });
		await api.completeTask(task.id);
		await api.deleteTask(task.id);
		expect((await api.getChanges()).version).toBeGreaterThan(afterCreate);
	});

	it("stamps the new version on the mutation response", async () => {
		// The web client banks this so the change poller can tell its own write
		// from someone else's and skip a duplicate refetch.
		const app = createApp({ resolveDb: () => getDb() });
		const projects = await (await app.request("/api/projects")).json();
		const response = await app.request("/api/tasks", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				projectId: projects[0].id,
				title: "Stamped",
			}),
		});
		expect(response.status).toBe(200);
		const stamped = Number(response.headers.get("X-Change-Version"));
		const current = await (await app.request("/api/changes")).json();
		expect(stamped).toBe(current.version);

		// Reads carry no stamp, so a poll never looks like a local write.
		const read = await app.request("/api/tasks");
		expect(read.headers.get("X-Change-Version")).toBeNull();
	});

	it("does not bump on a failed mutation", async () => {
		const api = makeClient();
		const before = (await api.getChanges()).version;
		await expect(
			api.createTask({ projectId: 99_999, title: "Orphan" }),
		).rejects.toThrow();
		expect((await api.getChanges()).version).toBe(before);
	});
});

describe("api contract (http)", () => {
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

	it("tracks reminder delivery and keeps missed reminders until acted on", async () => {
		const api = makeClient();
		const projectId =
			(await api.listProjects()).find((p) => p.isInbox)?.id ?? 0;
		const task = await api.createTask({ projectId, title: "Renew passport" });
		const reminder = await api.createReminder(task.id, {
			remindAt: "2020-01-01T09:00:00.000Z",
		});
		expect(reminder.firedAt).toBeNull();

		expect(await api.markRemindersFired([reminder.id])).toEqual({ fired: 1 });
		// A second device delivering the same reminder changes nothing.
		expect(await api.markRemindersFired([reminder.id])).toEqual({ fired: 0 });

		const [missed] = await api.listDueReminders();
		expect(missed?.status).toBe("fired");
		expect(missed?.firedAt).not.toBeNull();

		const snoozed = await api.snoozeReminder(reminder.id, {
			preset: "custom",
			customMinutes: 30,
		});
		expect(snoozed.status).toBe("snoozed");
		expect(snoozed.firedAt).toBeNull();
		expect(await api.listDueReminders()).toHaveLength(0);

		const dismissed = await api.dismissReminder(reminder.id);
		expect(dismissed.status).toBe("dismissed");
		expect(await api.listAllReminders()).toHaveLength(0);
	});

	it("stores push subscriptions and reports push as unconfigured", async () => {
		const api = makeClient();
		expect(await api.getPushConfig()).toEqual({ publicKey: null });
		await api.subscribePush({
			endpoint: "https://web.push.apple.com/abc",
			keys: { p256dh: "p", auth: "a" },
		});
		// Re-subscribing the same endpoint updates rather than duplicates.
		await api.subscribePush({
			endpoint: "https://web.push.apple.com/abc",
			keys: { p256dh: "p2", auth: "a2" },
		});
		await api.unsubscribePush("https://web.push.apple.com/abc");
		await expect(api.testPush()).rejects.toThrow();
	});

	it("does not mark future reminders as fired", async () => {
		const api = makeClient();
		const projectId =
			(await api.listProjects()).find((p) => p.isInbox)?.id ?? 0;
		const task = await api.createTask({ projectId, title: "Later" });
		const reminder = await api.createReminder(task.id, {
			remindAt: "2999-01-01T09:00:00.000Z",
		});
		expect(await api.markRemindersFired([reminder.id])).toEqual({ fired: 0 });
	});

	it("hides reminders for completed and deleted tasks, and restores them on undo", async () => {
		const api = makeClient();
		const projectId =
			(await api.listProjects()).find((p) => p.isInbox)?.id ?? 0;
		const done = await api.createTask({ projectId, title: "Done one" });
		const gone = await api.createTask({ projectId, title: "Deleted one" });
		for (const t of [done, gone]) {
			await api.createReminder(t.id, { remindAt: "2020-01-01T09:00:00.000Z" });
		}
		expect(await api.listDueReminders()).toHaveLength(2);

		await api.completeTask(done.id);
		await api.deleteTask(gone.id);
		expect(await api.listDueReminders()).toHaveLength(0);
		expect(await api.listAllReminders()).toHaveLength(0);

		await api.uncompleteTask(done.id);
		await api.undeleteTask(gone.id);
		expect(await api.listDueReminders()).toHaveLength(2);
	});

	it("moves a recurring task's reminder to the next occurrence", async () => {
		const api = makeClient();
		const projectId =
			(await api.listProjects()).find((p) => p.isInbox)?.id ?? 0;
		const dueAt = new Date(Date.now() + 60 * 60_000);
		const task = await api.createTask({
			projectId,
			title: "Water plants",
			dueAt: dueAt.toISOString(),
			recurrencePreset: "daily",
		});
		const remindAt = new Date(dueAt.getTime() - 15 * 60_000);
		await api.createReminder(task.id, { remindAt: remindAt.toISOString() });

		await api.completeTask(task.id);
		const [carried] = await api.listAllReminders();
		expect(carried?.taskId).not.toBe(task.id);
		expect(carried?.taskTitle).toBe("Water plants");
		expect(Date.parse(carried?.remindAt ?? "")).toBe(
			remindAt.getTime() + 24 * 60 * 60_000,
		);
	});
	it("plans a day, focuses one task, and closes the day", async () => {
		const api = makeClient();
		const projects = await api.listProjects();
		const inbox = projects.find((p) => p.isInbox);
		if (!inbox) throw new Error("no inbox");

		const a = await api.createTask({ projectId: inbox.id, title: "a" });
		const b = await api.createTask({ projectId: inbox.id, title: "b" });
		const backlog = await api.createTask({
			projectId: inbox.id,
			title: "backlog",
		});

		const day = "2026-08-20T00:00:00.000Z";
		const plan = await api.planDay(day, [b.id, a.id]);
		expect(plan.map((t) => t.title)).toEqual(["b", "a"]);
		expect(plan.map((t) => t.planOrder)).toEqual([1, 2]);

		const committed = await api.listTasks({
			status: "open",
			scheduledFrom: day,
			scheduledTo: "2026-08-20T23:59:59.999Z",
		});
		expect(committed.map((t) => t.id).sort()).toEqual([a.id, b.id].sort());

		const unplanned = await api.listTasks({ status: "open", unplanned: true });
		expect(unplanned.map((t) => t.id)).toEqual([backlog.id]);

		const started = await api.startTask(b.id);
		expect(started.startedAt).not.toBeNull();
		const switched = await api.startTask(a.id);
		expect(switched.startedAt).not.toBeNull();

		const stopped = await api.stopTask(a.id);
		expect(stopped.startedAt).toBeNull();

		expect(await api.getDayLog("2026-08-20")).toEqual({
			day: "2026-08-20",
			plannedAt: null,
			closedAt: null,
		});
		const planned = await api.markDayPlanned("2026-08-20");
		expect(planned.plannedAt).not.toBeNull();
		const closed = await api.markDayClosed("2026-08-20");
		expect(closed.closedAt).not.toBeNull();
		expect(closed.plannedAt).toBe(planned.plannedAt);
	});

	it("rejects a day that is not a plain calendar date", async () => {
		const app = createApp({ resolveDb: () => getDb() });
		const response = await app.request("/api/days/2026-08-20T00:00:00.000Z");
		expect(response.status).toBe(400);
	});
});

describe("openapi document", () => {
	it("is served and covers every API route", async () => {
		const app = createApp({ resolveDb: () => getDb() });
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
			"/api/reminders/fire",
			"/api/reminders/{id}/dismiss",
			"/api/reminders/{id}/snooze",
			"/api/push/config",
			"/api/push/subscribe",
			"/api/push/unsubscribe",
			"/api/push/test",
			"/api/tasks/plan",
			"/api/tasks/{id}/start",
			"/api/tasks/{id}/stop",
			"/api/days/{day}",
			"/api/days/{day}/planned",
			"/api/days/{day}/closed",
		]) {
			expect(Object.keys(doc.paths)).toContain(expected);
		}
	});
});
