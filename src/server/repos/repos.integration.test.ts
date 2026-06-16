import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { resetDbForTests } from "@/server/db/client";
import { createGoal, listGoals, updateGoal } from "@/server/repos/goals";
import { createProject } from "@/server/repos/projects";
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
	it("creates recurring next task on complete", () => {
		const project = createProject({ name: "Work" });
		const task = createTask({
			projectId: project.id,
			title: "Daily standup notes",
			priority: 2,
			dueAt: "2026-02-15T09:00:00.000Z",
			recurrencePreset: "daily",
		});

		const completion = completeTask(task.id);

		expect(completion.task?.status).toBe("completed");
		expect(completion.nextTask).toBeTruthy();
		expect(completion.nextTask?.dueAt).toBe("2026-02-16T09:00:00.000Z");
	});

	it("supports reminders with snoozing", () => {
		const project = createProject({ name: "Ops" });
		const task = createTask({ projectId: project.id, title: "Rotate keys" });

		const reminder = createReminder({
			taskId: task.id,
			remindAt: "2026-02-15T12:00:00.000Z",
		});

		expect(listTaskReminders(task.id)).toHaveLength(1);

		const snoozed = snoozeReminder({
			reminderId: reminder.id,
			preset: "this_evening",
		});

		expect(snoozed?.status).toBe("snoozed");
		expect(snoozed?.snoozedUntil).toBeTruthy();
	});

	it("supports goal creation and completion state", () => {
		const goal = createGoal({
			periodType: "daily",
			periodStart: "2026-02-15",
			title: "Ship API docs",
		});

		const updated = updateGoal(goal.id, { done: true });

		expect(updated?.done).toBe(true);
		expect(listGoals({ periodType: "daily" })).toHaveLength(1);
	});

	it("creates and retrieves tasks", () => {
		const project = createProject({ name: "Personal" });
		const task = createTask({ projectId: project.id, title: "Book dentist" });

		expect(getTask(task.id)?.title).toBe("Book dentist");
	});

	it("parks tasks in someday and excludes them from default queries", () => {
		const project = createProject({ name: "Personal" });
		const active = createTask({ projectId: project.id, title: "Active" });
		const parked = createTask({ projectId: project.id, title: "Parked" });
		updateTask(parked.id, { someday: true });

		// Default open query hides someday tasks.
		const openIds = listTasks({ status: "open" }).map((t) => t.id);
		expect(openIds).toContain(active.id);
		expect(openIds).not.toContain(parked.id);

		// Opting in with someday: true returns only parked tasks.
		const somedayTasks = listTasks({ status: "open", someday: true });
		expect(somedayTasks.map((t) => t.id)).toEqual([parked.id]);
		expect(somedayTasks[0]?.someday).toBe(true);

		// Completing a parked task unparks it so it appears in Completed.
		completeTask(parked.id);
		const completed = listTasks({ status: "completed" });
		expect(completed.map((t) => t.id)).toContain(parked.id);
		expect(getTask(parked.id)?.someday).toBe(false);
	});

	it("throws clear error when creating task with non-existent project", () => {
		expect(() =>
			createTask({ projectId: 99999, title: "Orphan task" }),
		).toThrow("Project not found: 99999");
	});

	it("supports parent + subtask and filtering", () => {
		const project = createProject({ name: "Work" });
		const parent = createTask({ projectId: project.id, title: "Launch v2" });
		const subtask = createTask({
			projectId: project.id,
			title: "Write changelog",
			parentTaskId: parent.id,
		});

		expect(subtask.parentTaskId).toBe(parent.id);
		expect(
			listTasks({ rootsOnly: true }).some((task) => task.id === parent.id),
		).toBe(true);
		expect(
			listTasks({ parentTaskId: parent.id }).some(
				(task) => task.id === subtask.id,
			),
		).toBe(true);
	});

	it("rejects assigning a subtask as a parent task", () => {
		const project = createProject({ name: "Ops" });
		const parent = createTask({ projectId: project.id, title: "Parent" });
		const child = createTask({
			projectId: project.id,
			title: "Child",
			parentTaskId: parent.id,
		});

		expect(() =>
			createTask({
				projectId: project.id,
				title: "Grandchild",
				parentTaskId: child.id,
			}),
		).toThrow("Parent task cannot be a subtask");
	});

	it("rejects assigning parent task across projects", () => {
		const projectA = createProject({ name: "A" });
		const projectB = createProject({ name: "B" });
		const parent = createTask({ projectId: projectA.id, title: "Parent A" });

		expect(() =>
			createTask({
				projectId: projectB.id,
				title: "Task B",
				parentTaskId: parent.id,
			}),
		).toThrow("Parent task must belong to the same project");
	});

	it("rejects setting task parent to itself", () => {
		const project = createProject({ name: "Self-check" });
		const task = createTask({ projectId: project.id, title: "Task" });

		expect(() => updateTask(task.id, { parentTaskId: task.id })).toThrow(
			"Task cannot be its own parent",
		);
	});

	it("soft-deletes parent task and cascades to subtasks", () => {
		const project = createProject({ name: "Cascade" });
		const parent = createTask({ projectId: project.id, title: "Parent" });
		const subtask = createTask({
			projectId: project.id,
			title: "Child",
			parentTaskId: parent.id,
		});

		expect(deleteTask(parent.id)).toBe(true);

		// getTask still returns soft-deleted tasks (rows are preserved)
		const deletedParent = getTask(parent.id);
		expect(deletedParent).not.toBeNull();
		expect(deletedParent?.deletedAt).not.toBeNull();

		const deletedSubtask = getTask(subtask.id);
		expect(deletedSubtask).not.toBeNull();
		expect(deletedSubtask?.deletedAt).not.toBeNull();

		// listTasks excludes soft-deleted tasks
		const visibleTasks = listTasks({ projectId: project.id });
		expect(visibleTasks).toHaveLength(0);
	});

	it("rejects assigning parent when task already has subtasks", () => {
		const project = createProject({ name: "Hierarchy" });
		const parent = createTask({ projectId: project.id, title: "Parent" });
		const child = createTask({
			projectId: project.id,
			title: "Child",
			parentTaskId: parent.id,
		});
		const anotherRoot = createTask({
			projectId: project.id,
			title: "Another root",
		});

		expect(() =>
			updateTask(parent.id, { parentTaskId: anotherRoot.id }),
		).toThrow("A task with subtasks cannot be assigned as a subtask");
		expect(child.parentTaskId).toBe(parent.id);
	});

	it("listDeletedTasks returns only soft-deleted tasks ordered by deleted_at desc", () => {
		const project = createProject({ name: "Trash" });
		const t1 = createTask({ projectId: project.id, title: "First" });
		const t2 = createTask({ projectId: project.id, title: "Second" });
		createTask({ projectId: project.id, title: "Alive" });

		deleteTask(t1.id);
		deleteTask(t2.id);

		const deleted = listDeletedTasks();
		expect(deleted.length).toBeGreaterThanOrEqual(2);
		const ids = deleted.map((t) => t.id);
		expect(ids).toContain(t1.id);
		expect(ids).toContain(t2.id);
		deleted.forEach((t) => expect(t.deletedAt).not.toBeNull());
		// Most recently deleted first
		const t1Idx = ids.indexOf(t1.id);
		const t2Idx = ids.indexOf(t2.id);
		expect(t2Idx).toBeLessThan(t1Idx);
	});

	it("undeleteTask restores a soft-deleted task and its subtasks", () => {
		const project = createProject({ name: "Restore" });
		const parent = createTask({ projectId: project.id, title: "Parent" });
		const child = createTask({
			projectId: project.id,
			title: "Child",
			parentTaskId: parent.id,
		});

		deleteTask(parent.id);
		expect(getTask(parent.id)?.deletedAt).not.toBeNull();
		expect(getTask(child.id)?.deletedAt).not.toBeNull();

		const restored = undeleteTask(parent.id);
		expect(restored).not.toBeNull();
		expect(restored?.deletedAt).toBeNull();
		expect(getTask(child.id)?.deletedAt).toBeNull();

		const visible = listTasks({ projectId: project.id });
		const ids = visible.map((t) => t.id);
		expect(ids).toContain(parent.id);
		expect(ids).toContain(child.id);
	});

	it("undeleteTask also restores parent when undeleting a subtask with a deleted parent", () => {
		const project = createProject({ name: "OrphanRestore" });
		const parent = createTask({ projectId: project.id, title: "Parent" });
		const child = createTask({
			projectId: project.id,
			title: "Child",
			parentTaskId: parent.id,
		});

		deleteTask(parent.id);
		expect(getTask(parent.id)?.deletedAt).not.toBeNull();
		expect(getTask(child.id)?.deletedAt).not.toBeNull();

		const restored = undeleteTask(child.id);
		expect(restored).not.toBeNull();
		expect(restored?.deletedAt).toBeNull();
		expect(getTask(parent.id)?.deletedAt).toBeNull();
	});
});
