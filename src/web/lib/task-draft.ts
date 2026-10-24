import { format, startOfDay } from "date-fns";

import { parseDurationMinutes } from "@/lib/parsing/parse-duration";
import { parseTaskCreateInput } from "@/lib/parsing/parse-task-create-input";
import type { Priority, Project, RecurrencePreset, Task } from "@/server/types";
import type { ApiClient } from "@/shared/api-client";
import { formatDateField, resolveDateField } from "./date-field";

export type TaskDraft = {
	title: string;
	notes: string;
	projectId: number;
	priority: Priority;
	due: string;
	scheduled: string;
	estimate: string;
	recurrencePreset: RecurrencePreset;
	recurrenceRRule: string | null;
	someday: boolean;
};

type CreateInput = Parameters<ApiClient["createTask"]>[0];
export type DraftResult =
	| { input: CreateInput; error?: never }
	| { error: string; input?: never };

export function newTaskDraft(
	projectId: number,
	scheduleToday = false,
): TaskDraft {
	return {
		title: "",
		notes: "",
		projectId,
		priority: 4,
		due: "",
		scheduled: scheduleToday
			? format(startOfDay(new Date()), "yyyy-MM-dd")
			: "",
		estimate: "",
		recurrencePreset: null,
		recurrenceRRule: null,
		someday: false,
	};
}

export function taskToDraft(task: Task): TaskDraft {
	return {
		title: task.title,
		notes: task.notes,
		projectId: task.projectId,
		priority: task.priority,
		due: formatDateField(task.dueAt),
		scheduled: formatDateField(task.scheduledAt),
		estimate: task.estimateMinutes === null ? "" : String(task.estimateMinutes),
		recurrencePreset: task.recurrencePreset,
		recurrenceRRule: task.recurrenceRRule,
		someday: task.someday,
	};
}

export function resolveTaskDraft(
	draft: TaskDraft,
	projects: Project[],
	original?: Task,
	parent?: Task,
): DraftResult {
	const parsed = original ? null : parseTaskCreateInput(draft.title, projects);
	if (parsed?.errors.length) return { error: parsed.errors[0] };
	const title = (parsed?.input.title ?? draft.title).trim();
	if (!title) return { error: "Add a task title." };
	const projectId =
		parent?.projectId ?? parsed?.input.projectId ?? draft.projectId;
	if (!projectId) return { error: "Choose a project for this task." };
	const dueAt = resolveDateField(draft.due, original?.dueAt ?? null);
	const scheduledAt = resolveDateField(
		draft.scheduled,
		original?.scheduledAt ?? null,
	);
	if (dueAt === "invalid" || scheduledAt === "invalid")
		return { error: "Choose a valid scheduled date and deadline." };
	const estimateMinutes = draft.estimate.trim()
		? parseDurationMinutes(draft.estimate)
		: null;
	if (estimateMinutes === undefined)
		return { error: "Estimate accepts 45m, 1h, 1h30, or minutes." };
	return {
		input: {
			title,
			projectId,
			parentTaskId: parent?.id ?? original?.parentTaskId ?? null,
			notes: draft.notes || parsed?.input.notes || "",
			priority: parsed?.input.priority ?? draft.priority,
			dueAt: parsed?.input.dueAt !== undefined ? parsed.input.dueAt : dueAt,
			scheduledAt:
				parsed?.input.scheduledAt !== undefined
					? parsed.input.scheduledAt
					: scheduledAt,
			estimateMinutes: parsed?.input.estimateMinutes ?? estimateMinutes,
			recurrencePreset:
				parsed?.input.recurrencePreset ?? draft.recurrencePreset,
			recurrenceRRule: parsed?.input.recurrenceRRule ?? draft.recurrenceRRule,
			someday: draft.someday,
		},
	};
}
