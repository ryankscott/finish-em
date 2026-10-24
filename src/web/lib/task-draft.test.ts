import { describe, expect, test } from "bun:test";
import { format } from "date-fns";

import type { Project, Task } from "@/server/types";
import { newTaskDraft, resolveTaskDraft, taskToDraft } from "./task-draft";

const project: Project = {
	id: 1,
	name: "Inbox",
	emoji: null,
	description: "",
	startAt: null,
	endAt: null,
	color: "",
	isInbox: true,
	sortOrder: 0,
	resources: [],
	createdAt: "",
	updatedAt: "",
};
const task: Task = {
	id: 7,
	projectId: 1,
	parentTaskId: 4,
	title: "Review p1 results",
	notes: "Context",
	priority: 3,
	scheduledAt: "2026-10-24T03:15:00.000Z",
	dueAt: "2026-10-28T02:30:00.000Z",
	dueTimezone: "Pacific/Auckland",
	recurrencePreset: "weekly",
	recurrenceRRule: null,
	status: "open",
	someday: false,
	planOrder: 2,
	startedAt: null,
	estimateMinutes: 30,
	plannedStartAt: null,
	completedAt: null,
	deletedAt: null,
	calendarEventUid: null,
	createdAt: "",
	updatedAt: "",
};

describe("task editor drafts", () => {
	test("Today capture is scheduled; Inbox capture is unscheduled", () => {
		expect(newTaskDraft(1, true).scheduled).toBe(
			format(new Date(), "yyyy-MM-dd"),
		);
		expect(newTaskDraft(1).scheduled).toBe("");
	});
	test("editing preserves exact timestamps, parent, literal title, and recurrence", () => {
		const result = resolveTaskDraft(taskToDraft(task), [project], task);
		expect(result.error).toBeUndefined();
		expect(result.input).toMatchObject({
			title: task.title,
			parentTaskId: task.parentTaskId,
			scheduledAt: task.scheduledAt,
			dueAt: task.dueAt,
			priority: task.priority,
			recurrencePreset: task.recurrencePreset,
			estimateMinutes: task.estimateMinutes,
		});
	});
	test("clearing a deadline or estimate emits null", () => {
		const result = resolveTaskDraft(
			{ ...taskToDraft(task), due: "", estimate: "" },
			[project],
			task,
		);
		expect(result.input?.dueAt).toBeNull();
		expect(result.input?.estimateMinutes).toBeNull();
	});
	test("rejects missing titles and invalid date or duration without writing", () => {
		expect(resolveTaskDraft(newTaskDraft(1), [project]).error).toBeDefined();
		expect(
			resolveTaskDraft(
				{ ...taskToDraft(task), due: "nonsense" },
				[project],
				task,
			).error,
		).toBeDefined();
		expect(
			resolveTaskDraft(
				{ ...taskToDraft(task), estimate: "nonsense" },
				[project],
				task,
			).error,
		).toBeDefined();
	});
	test("new task syntax still resolves dates, priority, estimates, notes, and projects", () => {
		const result = resolveTaskDraft(
			{
				...newTaskDraft(1),
				title: "Ship design p1 due:tomorrow est:45m notes:Check mobile",
			},
			[project],
		);
		expect(result.error).toBeUndefined();
		expect(result.input).toMatchObject({
			title: "Ship design",
			priority: 1,
			estimateMinutes: 45,
			notes: "Check mobile",
		});
		expect(result.input?.dueAt).toBeTruthy();
	});
	test("subtasks inherit their parent's project", () => {
		const result = resolveTaskDraft(
			{ ...newTaskDraft(1), title: "Subtask" },
			[project],
			undefined,
			{ ...task, projectId: 8 },
		);
		expect(result.input).toMatchObject({ projectId: 8, parentTaskId: 7 });
	});
});
