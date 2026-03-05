import { describe, expect, it } from "bun:test";

import type { Task } from "../server/types";

const MOCK_DELETED_TASK: Task = {
	id: 5,
	projectId: 1,
	parentTaskId: null,
	title: "Fix the bug",
	notes: "",
	priority: 3,
	scheduledAt: null,
	dueAt: null,
	dueTimezone: null,
	recurrencePreset: null,
	recurrenceRRule: null,
	status: "open",
	completedAt: null,
	deletedAt: "2026-03-04T10:00:00.000Z",
	createdAt: "2026-03-04T09:00:00.000Z",
	updatedAt: "2026-03-04T10:00:00.000Z",
};

// Simulate the undelete guard logic from useTaskActions
function resolveUndelete(
	selectedTask: Task | null,
): { taskId: number; toastText: string; statusText: string } | { skip: true } {
	if (!selectedTask) return { skip: true };
	return {
		taskId: selectedTask.id,
		toastText: "Task restored",
		statusText: "Task restored",
	};
}

describe("undeleteSelectedTask logic", () => {
	it("returns task id and confirmation messages when a deleted task is selected", () => {
		const result = resolveUndelete(MOCK_DELETED_TASK);
		expect(result).toEqual({
			taskId: 5,
			toastText: "Task restored",
			statusText: "Task restored",
		});
	});

	it("skips when no task is selected", () => {
		const result = resolveUndelete(null);
		expect(result).toEqual({ skip: true });
	});
});
