import { describe, expect, it } from "bun:test";

import type { Goal, Task } from "../server/types";
import type { ApiClient } from "./api-client";
import {
	executeUndo,
	snapshotGoal,
	snapshotTaskFields,
	type UndoRecord,
} from "./undo";

const TASK: Task = {
	id: 7,
	projectId: 2,
	parentTaskId: null,
	title: "Write the report",
	notes: "first draft",
	priority: 2,
	scheduledAt: null,
	dueAt: "2026-06-20T17:00:00.000Z",
	dueTimezone: "Pacific/Auckland",
	recurrencePreset: "weekly",
	recurrenceRRule: null,
	status: "open",
	someday: false,
	completedAt: null,
	deletedAt: null,
	createdAt: "2026-06-10T00:00:00.000Z",
	updatedAt: "2026-06-12T00:00:00.000Z",
};

const GOAL: Goal = {
	id: 3,
	periodType: "weekly",
	periodStart: "2026-06-08",
	title: "Ship undo",
	done: false,
	createdAt: "2026-06-08T00:00:00.000Z",
	updatedAt: "2026-06-08T00:00:00.000Z",
};

/** Records every call so a test can assert which API method fired. */
function makeRecordingApi() {
	const calls: Array<{ method: string; args: unknown[] }> = [];
	const record = (method: string) => {
		return (...args: unknown[]) => {
			calls.push({ method, args });
			return Promise.resolve(undefined as never);
		};
	};
	const api = {
		deleteTask: record("deleteTask"),
		undeleteTask: record("undeleteTask"),
		completeTask: record("completeTask"),
		uncompleteTask: record("uncompleteTask"),
		updateTask: record("updateTask"),
		createGoal: record("createGoal"),
		updateGoal: record("updateGoal"),
		deleteGoal: record("deleteGoal"),
		createReminder: record("createReminder"),
		deleteReminder: record("deleteReminder"),
	} as unknown as ApiClient;
	return { api, calls };
}

describe("snapshotTaskFields", () => {
	it("captures the editable fields needed to revert an update", () => {
		expect(snapshotTaskFields(TASK)).toEqual({
			title: "Write the report",
			notes: "first draft",
			priority: 2,
			projectId: 2,
			parentTaskId: null,
			scheduledAt: null,
			dueAt: "2026-06-20T17:00:00.000Z",
			dueTimezone: "Pacific/Auckland",
			recurrencePreset: "weekly",
			recurrenceRRule: null,
			someday: false,
		});
	});

	it("normalizes a null due timezone to undefined", () => {
		expect(snapshotTaskFields({ ...TASK, dueTimezone: null }).dueTimezone).toBe(
			undefined,
		);
	});
});

describe("snapshotGoal", () => {
	it("captures the fields needed to recreate a deleted goal", () => {
		expect(snapshotGoal(GOAL)).toEqual({
			periodType: "weekly",
			periodStart: "2026-06-08",
			title: "Ship undo",
			done: false,
		});
	});
});

describe("executeUndo", () => {
	const cases: Array<{
		record: UndoRecord;
		method: string;
		message: string;
	}> = [
		{
			record: { kind: "task_create", taskId: 7, label: "Write the report" },
			method: "deleteTask",
			message: 'Removed "Write the report"',
		},
		{
			record: { kind: "task_complete", taskId: 7, label: "Write the report" },
			method: "uncompleteTask",
			message: 'Reopened "Write the report"',
		},
		{
			record: { kind: "task_reopen", taskId: 7, label: "Write the report" },
			method: "completeTask",
			message: 'Completed "Write the report"',
		},
		{
			record: { kind: "task_delete", taskId: 7, label: "Write the report" },
			method: "undeleteTask",
			message: 'Restored "Write the report"',
		},
		{
			record: {
				kind: "task_update",
				taskId: 7,
				label: "Write the report",
				before: snapshotTaskFields(TASK),
			},
			method: "updateTask",
			message: 'Reverted "Write the report"',
		},
		{
			record: { kind: "goal_create", goalId: 3, label: "Ship undo" },
			method: "deleteGoal",
			message: 'Removed goal "Ship undo"',
		},
		{
			record: {
				kind: "goal_update",
				goalId: 3,
				label: "Ship undo",
				before: { done: false },
			},
			method: "updateGoal",
			message: 'Reverted goal "Ship undo"',
		},
		{
			record: {
				kind: "goal_delete",
				label: "Ship undo",
				snapshot: snapshotGoal(GOAL),
			},
			method: "createGoal",
			message: 'Restored goal "Ship undo"',
		},
		{
			record: { kind: "reminder_create", reminderId: 9, label: "reminder" },
			method: "deleteReminder",
			message: "Removed reminder",
		},
		{
			record: {
				kind: "reminder_delete",
				label: "reminder",
				taskId: 7,
				remindAt: "2026-06-20T17:00:00.000Z",
			},
			method: "createReminder",
			message: "Restored reminder",
		},
	];

	for (const { record, method, message } of cases) {
		it(`reverses ${record.kind} via ${method}`, async () => {
			const { api, calls } = makeRecordingApi();
			const result = await executeUndo(api, record);
			expect(result).toBe(message);
			expect(calls).toHaveLength(1);
			expect(calls[0]?.method).toBe(method);
		});
	}

	it("restores a deleted goal with the captured snapshot", async () => {
		const { api, calls } = makeRecordingApi();
		await executeUndo(api, {
			kind: "goal_delete",
			label: "Ship undo",
			snapshot: snapshotGoal(GOAL),
		});
		expect(calls[0]?.args[0]).toEqual({
			periodType: "weekly",
			periodStart: "2026-06-08",
			title: "Ship undo",
			done: false,
		});
	});

	it("recreates a deleted reminder for the original task and time", async () => {
		const { api, calls } = makeRecordingApi();
		await executeUndo(api, {
			kind: "reminder_delete",
			label: "reminder",
			taskId: 7,
			remindAt: "2026-06-20T17:00:00.000Z",
		});
		expect(calls[0]?.args[0]).toBe(7);
		expect(calls[0]?.args[1]).toEqual({ remindAt: "2026-06-20T17:00:00.000Z" });
	});
});
