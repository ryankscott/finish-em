import type { Goal, Task } from "../server/types";
import type { ApiClient } from "./api-client";

/** Fields of a task that an undo can restore via `updateTask`. */
export type TaskFieldSnapshot = Parameters<ApiClient["updateTask"]>[1];

/**
 * A reversible action captured in application state. Undo is applied purely
 * through the existing `ApiClient` methods — there is no server-side undo
 * stack or dedicated endpoint.
 */
export type UndoRecord =
	| { kind: "task_create"; taskId: number; label: string }
	| { kind: "task_complete"; taskId: number; label: string }
	| { kind: "task_reopen"; taskId: number; label: string }
	| { kind: "task_delete"; taskId: number; label: string }
	| {
			kind: "task_update";
			taskId: number;
			label: string;
			before: TaskFieldSnapshot;
	  }
	| { kind: "goal_create"; goalId: number; label: string }
	| {
			kind: "goal_update";
			goalId: number;
			label: string;
			before: { title?: string; done?: boolean };
	  }
	| {
			kind: "goal_delete";
			label: string;
			snapshot: {
				periodType: "daily" | "weekly";
				periodStart: string;
				title: string;
				done: boolean;
			};
	  }
	| { kind: "reminder_create"; reminderId: number; label: string }
	| {
			kind: "reminder_delete";
			label: string;
			taskId: number;
			remindAt: string;
	  };

/** Capture the editable fields of a task so a later update can be reverted. */
export function snapshotTaskFields(task: Task): TaskFieldSnapshot {
	return {
		title: task.title,
		notes: task.notes,
		priority: task.priority,
		projectId: task.projectId,
		parentTaskId: task.parentTaskId,
		scheduledAt: task.scheduledAt,
		dueAt: task.dueAt,
		dueTimezone: task.dueTimezone ?? undefined,
		recurrencePreset: task.recurrencePreset,
		recurrenceRRule: task.recurrenceRRule,
		someday: task.someday,
	};
}

/** Build the snapshot used to restore a deleted goal. */
export function snapshotGoal(
	goal: Goal,
): Extract<UndoRecord, { kind: "goal_delete" }>["snapshot"] {
	return {
		periodType: goal.periodType,
		periodStart: goal.periodStart,
		title: goal.title,
		done: goal.done,
	};
}

/**
 * Reverse a recorded action through the API client and return a short,
 * human-readable description of what was undone.
 */
export async function executeUndo(
	api: ApiClient,
	record: UndoRecord,
): Promise<string> {
	switch (record.kind) {
		case "task_create":
			await api.deleteTask(record.taskId);
			return `Removed "${record.label}"`;
		case "task_complete":
			await api.uncompleteTask(record.taskId);
			return `Reopened "${record.label}"`;
		case "task_reopen":
			await api.completeTask(record.taskId);
			return `Completed "${record.label}"`;
		case "task_delete":
			await api.undeleteTask(record.taskId);
			return `Restored "${record.label}"`;
		case "task_update":
			await api.updateTask(record.taskId, record.before);
			return `Reverted "${record.label}"`;
		case "goal_create":
			await api.deleteGoal(record.goalId);
			return `Removed goal "${record.label}"`;
		case "goal_update":
			await api.updateGoal(record.goalId, record.before);
			return `Reverted goal "${record.label}"`;
		case "goal_delete":
			await api.createGoal(record.snapshot);
			return `Restored goal "${record.label}"`;
		case "reminder_create":
			await api.deleteReminder(record.reminderId);
			return "Removed reminder";
		case "reminder_delete":
			await api.createReminder(record.taskId, { remindAt: record.remindAt });
			return "Restored reminder";
	}
}
