import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { getDb, resetDbForTests } from "@/server/db/client";
import { createGoal, listGoals, updateGoal } from "@/server/repos/goals";
import {
	createProject,
	listProjects,
	reorderProjects,
} from "@/server/repos/projects";
import {
	createReminder,
	listTaskReminders,
	snoozeReminder,
} from "@/server/repos/reminders";
import {
	completeTask,
	createTask,
	deleteTask,
	getTask,
	listDeletedTasks,
	listTasks,
	undeleteTask,
	updateTask,
} from "@/server/repos/tasks";

const dbPath = path.join(os.tmpdir(), `finish-em-test-${Date.now()}.db`);

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

describe("repositories integration", () => {
	it("creates recurring next task on complete", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "Work" });
		const task = await createTask(db, {
			projectId: project.id,
			title: "Daily standup notes",
			priority: 2,
			dueAt: "2026-02-15T09:00:00.000Z",
			recurrencePreset: "daily",
		});

		const completion = await completeTask(db, task.id);

		expect(completion.task?.status).toBe("completed");
		expect(completion.nextTask).toBeTruthy();
		expect(completion.nextTask?.dueAt).toBe("2026-02-16T09:00:00.000Z");
	});

	it("reorders projects and keeps inbox pinned first", async () => {
		const db = getDb();
		const a = await createProject(db, { name: "Alpha" });
		const b = await createProject(db, { name: "Bravo" });
		const c = await createProject(db, { name: "Charlie" });

		// New projects append in creation order.
		const before = (await listProjects(db)).filter((p) => !p.isInbox);
		expect(before.map((p) => p.id)).toEqual([a.id, b.id, c.id]);

		await reorderProjects(db, [c.id, a.id, b.id]);

		const all = await listProjects(db);
		expect(all[0]?.isInbox).toBe(true);
		expect(all.filter((p) => !p.isInbox).map((p) => p.id)).toEqual([
			c.id,
			a.id,
			b.id,
		]);
	});

	it("supports reminders with snoozing", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "Ops" });
		const task = await createTask(db, {
			projectId: project.id,
			title: "Rotate keys",
		});

		const reminder = await createReminder(db, {
			taskId: task.id,
			remindAt: "2026-02-15T12:00:00.000Z",
		});

		expect(await listTaskReminders(db, task.id)).toHaveLength(1);

		const snoozed = await snoozeReminder(db, {
			reminderId: reminder.id,
			preset: "this_evening",
		});

		expect(snoozed?.status).toBe("snoozed");
		expect(snoozed?.snoozedUntil).toBeTruthy();
	});

	it("supports goal creation and completion state", async () => {
		const db = getDb();
		const goal = await createGoal(db, {
			periodType: "daily",
			periodStart: "2026-02-15",
			title: "Ship API docs",
		});

		const updated = await updateGoal(db, goal.id, { done: true });

		expect(updated?.done).toBe(true);
		expect(await listGoals(db, { periodType: "daily" })).toHaveLength(1);
	});

	it("creates and retrieves tasks", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "Personal" });
		const task = await createTask(db, {
			projectId: project.id,
			title: "Book dentist",
		});

		expect((await getTask(db, task.id))?.title).toBe("Book dentist");
	});

	it("parks tasks in someday and excludes them from default queries", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "Personal" });
		const active = await createTask(db, {
			projectId: project.id,
			title: "Active",
		});
		const parked = await createTask(db, {
			projectId: project.id,
			title: "Parked",
		});
		await updateTask(db, parked.id, { someday: true });

		// Default open query hides someday tasks.
		const openIds = (await listTasks(db, { status: "open" })).map((t) => t.id);
		expect(openIds).toContain(active.id);
		expect(openIds).not.toContain(parked.id);

		// Opting in with someday: true returns only parked tasks.
		const somedayTasks = await listTasks(db, { status: "open", someday: true });
		expect(somedayTasks.map((t) => t.id)).toEqual([parked.id]);
		expect(somedayTasks[0]?.someday).toBe(true);

		// Completing a parked task unparks it so it appears in Completed.
		await completeTask(db, parked.id);
		const completed = await listTasks(db, { status: "completed" });
		expect(completed.map((t) => t.id)).toContain(parked.id);
		expect((await getTask(db, parked.id))?.someday).toBe(false);
	});

	it("throws clear error when creating task with non-existent project", async () => {
		const db = getDb();
		(
			await expect(createTask(db, { projectId: 99999, title: "Orphan task" }))
		).rejects.toThrow("Project not found: 99999");
	});

	it("supports parent + subtask and filtering", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "Work" });
		const parent = await createTask(db, {
			projectId: project.id,
			title: "Launch v2",
		});
		const subtask = await createTask(db, {
			projectId: project.id,
			title: "Write changelog",
			parentTaskId: parent.id,
		});

		expect(subtask.parentTaskId).toBe(parent.id);
		expect(
			(await listTasks(db, { rootsOnly: true })).some(
				(task) => task.id === parent.id,
			),
		).toBe(true);
		expect(
			(await listTasks(db, { parentTaskId: parent.id })).some(
				(task) => task.id === subtask.id,
			),
		).toBe(true);
	});

	it("rejects assigning a subtask as a parent task", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "Ops" });
		const parent = await createTask(db, {
			projectId: project.id,
			title: "Parent",
		});
		const child = await createTask(db, {
			projectId: project.id,
			title: "Child",
			parentTaskId: parent.id,
		});

		(
			await expect(
				createTask(db, {
					projectId: project.id,
					title: "Grandchild",
					parentTaskId: child.id,
				}),
			)
		).rejects.toThrow("Parent task cannot be a subtask");
	});

	it("rejects assigning parent task across projects", async () => {
		const db = getDb();
		const projectA = await createProject(db, { name: "A" });
		const projectB = await createProject(db, { name: "B" });
		const parent = await createTask(db, {
			projectId: projectA.id,
			title: "Parent A",
		});

		(
			await expect(
				createTask(db, {
					projectId: projectB.id,
					title: "Task B",
					parentTaskId: parent.id,
				}),
			)
		).rejects.toThrow("Parent task must belong to the same project");
	});

	it("rejects setting task parent to itself", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "Self-check" });
		const task = await createTask(db, { projectId: project.id, title: "Task" });

		(
			await expect(updateTask(db, task.id, { parentTaskId: task.id }))
		).rejects.toThrow("Task cannot be its own parent");
	});

	it("soft-deletes parent task and cascades to subtasks", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "Cascade" });
		const parent = await createTask(db, {
			projectId: project.id,
			title: "Parent",
		});
		const subtask = await createTask(db, {
			projectId: project.id,
			title: "Child",
			parentTaskId: parent.id,
		});

		expect(await deleteTask(db, parent.id)).toBe(true);

		// getTask still returns soft-deleted tasks (rows are preserved)
		const deletedParent = await getTask(db, parent.id);
		expect(deletedParent).not.toBeNull();
		expect(deletedParent?.deletedAt).not.toBeNull();

		const deletedSubtask = await getTask(db, subtask.id);
		expect(deletedSubtask).not.toBeNull();
		expect(deletedSubtask?.deletedAt).not.toBeNull();

		// listTasks excludes soft-deleted tasks
		const visibleTasks = await listTasks(db, { projectId: project.id });
		expect(visibleTasks).toHaveLength(0);
	});

	it("rejects assigning parent when task already has subtasks", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "Hierarchy" });
		const parent = await createTask(db, {
			projectId: project.id,
			title: "Parent",
		});
		const child = await createTask(db, {
			projectId: project.id,
			title: "Child",
			parentTaskId: parent.id,
		});
		const anotherRoot = await createTask(db, {
			projectId: project.id,
			title: "Another root",
		});

		(
			await expect(updateTask(db, parent.id, { parentTaskId: anotherRoot.id }))
		).rejects.toThrow("A task with subtasks cannot be assigned as a subtask");
		expect(child.parentTaskId).toBe(parent.id);
	});

	it("listDeletedTasks returns only soft-deleted tasks ordered by deleted_at desc", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "Trash" });
		const t1 = await createTask(db, { projectId: project.id, title: "First" });
		const t2 = await createTask(db, { projectId: project.id, title: "Second" });
		await createTask(db, { projectId: project.id, title: "Alive" });

		await deleteTask(db, t1.id);
		await deleteTask(db, t2.id);

		const deleted = await listDeletedTasks(db);
		expect(deleted.length).toBeGreaterThanOrEqual(2);
		const ids = deleted.map((t) => t.id);
		expect(ids).toContain(t1.id);
		expect(ids).toContain(t2.id);
		for (const t of deleted) {
			expect(t.deletedAt).not.toBeNull();
		}
		// Most recently deleted first
		const t1Idx = ids.indexOf(t1.id);
		const t2Idx = ids.indexOf(t2.id);
		expect(t2Idx).toBeLessThan(t1Idx);
	});

	it("undeleteTask restores a soft-deleted task and its subtasks", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "Restore" });
		const parent = await createTask(db, {
			projectId: project.id,
			title: "Parent",
		});
		const child = await createTask(db, {
			projectId: project.id,
			title: "Child",
			parentTaskId: parent.id,
		});

		await deleteTask(db, parent.id);
		expect((await getTask(db, parent.id))?.deletedAt).not.toBeNull();
		expect((await getTask(db, child.id))?.deletedAt).not.toBeNull();

		const restored = await undeleteTask(db, parent.id);
		expect(restored).not.toBeNull();
		expect(restored?.deletedAt).toBeNull();
		expect((await getTask(db, child.id))?.deletedAt).toBeNull();

		const visible = await listTasks(db, { projectId: project.id });
		const ids = visible.map((t) => t.id);
		expect(ids).toContain(parent.id);
		expect(ids).toContain(child.id);
	});

	it("undeleteTask also restores parent when undeleting a subtask with a deleted parent", async () => {
		const db = getDb();
		const project = await createProject(db, { name: "OrphanRestore" });
		const parent = await createTask(db, {
			projectId: project.id,
			title: "Parent",
		});
		const child = await createTask(db, {
			projectId: project.id,
			title: "Child",
			parentTaskId: parent.id,
		});

		await deleteTask(db, parent.id);
		expect((await getTask(db, parent.id))?.deletedAt).not.toBeNull();
		expect((await getTask(db, child.id))?.deletedAt).not.toBeNull();

		const restored = await undeleteTask(db, child.id);
		expect(restored).not.toBeNull();
		expect(restored?.deletedAt).toBeNull();
		expect((await getTask(db, parent.id))?.deletedAt).toBeNull();
	});
});
