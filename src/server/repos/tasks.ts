import { nowIso } from "@/lib/datetime";
import type { BatchOp, Db } from "@/server/db/types";
import { getEventByUid } from "@/server/repos/calendar";
import { mapTaskRow } from "@/server/repos/mappers";
import { getProject } from "@/server/repos/projects";
import {
	deleteLatestCompletion,
	logCompletion,
} from "@/server/repos/task-completion-log";
import {
	getNextOccurrence,
	validateRRuleSubset,
} from "@/server/services/recurrence";

import type { Priority, Task, TaskFilters, TaskStatus } from "@/server/types";

function buildFilterClause(filters: TaskFilters) {
	const clauses: string[] = [];
	const values: Array<number | string> = [];

	if (filters.projectId) {
		clauses.push("project_id = ?");
		values.push(filters.projectId);
	}

	if (filters.status) {
		clauses.push("status = ?");
		values.push(filters.status);
	}

	if (filters.priority) {
		clauses.push("priority = ?");
		values.push(filters.priority);
	}

	if (filters.parentTaskId !== undefined) {
		if (filters.parentTaskId === null) {
			clauses.push("parent_task_id IS NULL");
		} else {
			clauses.push("parent_task_id = ?");
			values.push(filters.parentTaskId);
		}
	} else if (filters.rootsOnly) {
		clauses.push("parent_task_id IS NULL");
	}

	if (filters.noDueDate) {
		clauses.push("due_at IS NULL");
	}

	if (!filters.noDueDate && filters.from) {
		clauses.push("(due_at IS NOT NULL AND due_at >= ?)");
		values.push(filters.from);
	}

	if (!filters.noDueDate && filters.to) {
		clauses.push("(due_at IS NOT NULL AND due_at <= ?)");
		values.push(filters.to);
	}

	// Someday tasks are parked: hidden from every view unless explicitly requested.
	if (filters.someday === true) {
		clauses.push("someday = 1");
	} else {
		clauses.push("someday = 0");
	}

	if (filters.recurring === true) {
		clauses.push(
			"(recurrence_preset IS NOT NULL OR recurrence_rrule IS NOT NULL)",
		);
	}

	if (filters.staleBefore) {
		clauses.push("updated_at < ?");
		values.push(filters.staleBefore);
	}

	// scheduledFrom/scheduledTo filter the commitment ("doing it this day"),
	// where from/to above filter the deadline. A task can be in today's plan
	// and due next week, or overdue and not planned at all.
	if (filters.scheduledFrom) {
		clauses.push("scheduled_at >= ?");
		values.push(filters.scheduledFrom);
	}

	if (filters.scheduledTo) {
		clauses.push("scheduled_at <= ?");
		values.push(filters.scheduledTo);
	}

	if (filters.unplanned === true) {
		clauses.push("scheduled_at IS NULL");
	}

	// Always exclude soft-deleted tasks from regular queries
	clauses.push("deleted_at IS NULL");

	return {
		clause: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
		values,
	};
}

async function taskHasChildren(db: Db, taskId: number) {
	const row = await db
		.prepare("SELECT COUNT(*) AS count FROM tasks WHERE parent_task_id = ?")
		.get<{ count: number }>(taskId);
	return Number(row?.count ?? 0) > 0;
}

async function validateParentTaskId(
	db: Db,
	input: {
		taskId?: number;
		projectId: number;
		parentTaskId: number | null;
	},
) {
	if (input.parentTaskId === null) {
		return null;
	}

	const parent = await getTask(db, input.parentTaskId);
	if (!parent) {
		throw new Error("Parent task not found");
	}

	if (input.taskId !== undefined && parent.id === input.taskId) {
		throw new Error("Task cannot be its own parent");
	}

	if (parent.parentTaskId !== null) {
		throw new Error("Parent task cannot be a subtask");
	}

	if (parent.projectId !== input.projectId) {
		throw new Error("Parent task must belong to the same project");
	}

	return parent.id;
}

export async function listTasks(
	db: Db,
	filters: TaskFilters = {},
): Promise<Task[]> {
	const { clause, values } = buildFilterClause(filters);

	const rows = await db
		.prepare(
			`SELECT * FROM tasks ${clause} ORDER BY status ASC, due_at IS NULL ASC, due_at ASC, priority ASC, created_at DESC`,
		)
		.all<Record<string, unknown>>(...values);

	return rows.map(mapTaskRow);
}

export async function getTask(db: Db, taskId: number): Promise<Task | null> {
	const row = await db
		.prepare("SELECT * FROM tasks WHERE id = ?")
		.get<Record<string, unknown>>(taskId);

	return row ? mapTaskRow(row) : null;
}

export async function createTask(
	db: Db,
	input: {
		projectId: number;
		parentTaskId?: number | null;
		title: string;
		notes?: string;
		priority?: Priority;
		scheduledAt?: string | null;
		dueAt?: string | null;
		dueTimezone?: string | null;
		recurrencePreset?: string | null;
		recurrenceRRule?: string | null;
		someday?: boolean;
	},
): Promise<Task> {
	const project = await getProject(db, input.projectId);
	if (!project) {
		throw new Error(
			`Project not found: ${input.projectId}. Use the projects list to see valid project IDs.`,
		);
	}

	const now = nowIso();
	const parentTaskId = await validateParentTaskId(db, {
		projectId: input.projectId,
		parentTaskId: input.parentTaskId ?? null,
	});

	if (input.recurrenceRRule && !validateRRuleSubset(input.recurrenceRRule)) {
		throw new Error("Invalid RRULE subset");
	}

	const uuid = crypto.randomUUID();
	const row = await db
		.prepare(
			`INSERT INTO tasks (
        uuid, project_id, parent_task_id, title, notes, priority, scheduled_at, due_at, due_timezone,
        recurrence_preset, recurrence_rrule, status, someday, completed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, NULL, ?, ?)
      RETURNING *`,
		)
		.get<Record<string, unknown>>(
			uuid,
			input.projectId,
			parentTaskId,
			input.title,
			input.notes ?? "",
			input.priority ?? 4,
			input.scheduledAt ?? null,
			input.dueAt ?? null,
			input.dueTimezone ?? null,
			input.recurrencePreset ?? null,
			input.recurrenceRRule ?? null,
			input.someday ? 1 : 0,
			now,
			now,
		);

	return mapTaskRow(row as Record<string, unknown>);
}

export async function updateTask(
	db: Db,
	taskId: number,
	patch: Partial<{
		projectId: number;
		parentTaskId: number | null;
		title: string;
		notes: string;
		priority: Priority;
		scheduledAt: string | null;
		dueAt: string | null;
		dueTimezone: string | null;
		recurrencePreset: string | null;
		recurrenceRRule: string | null;
		status: TaskStatus;
		someday: boolean;
	}>,
): Promise<Task | null> {
	const existing = await getTask(db, taskId);

	if (!existing) {
		return null;
	}

	if (patch.recurrenceRRule && !validateRRuleSubset(patch.recurrenceRRule)) {
		throw new Error("Invalid RRULE subset");
	}

	const nextProjectId = patch.projectId ?? existing.projectId;
	const nextParentTaskId =
		patch.parentTaskId === undefined
			? existing.parentTaskId
			: patch.parentTaskId;
	const nextStatus = patch.status ?? existing.status;
	const nextScheduledAt =
		patch.scheduledAt === undefined ? existing.scheduledAt : patch.scheduledAt;

	if (nextParentTaskId !== null && (await taskHasChildren(db, taskId))) {
		throw new Error("A task with subtasks cannot be assigned as a subtask");
	}

	const validatedParentTaskId = await validateParentTaskId(db, {
		taskId,
		projectId: nextProjectId,
		parentTaskId: nextParentTaskId,
	});

	const now = nowIso();
	const row = await db
		.prepare(
			`UPDATE tasks SET
      project_id = ?,
      parent_task_id = ?,
      title = ?,
      notes = ?,
      priority = ?,
      scheduled_at = ?,
      due_at = ?,
      due_timezone = ?,
      recurrence_preset = ?,
      recurrence_rrule = ?,
      status = ?,
      someday = ?,
      plan_order = ?,
      started_at = ?,
      updated_at = ?
    WHERE id = ?
    RETURNING *`,
		)
		.get<Record<string, unknown>>(
			nextProjectId,
			validatedParentTaskId,
			patch.title ?? existing.title,
			patch.notes ?? existing.notes,
			patch.priority ?? existing.priority,
			nextScheduledAt,
			patch.dueAt === undefined ? existing.dueAt : patch.dueAt,
			patch.dueTimezone === undefined
				? existing.dueTimezone
				: patch.dueTimezone,
			patch.recurrencePreset === undefined
				? existing.recurrencePreset
				: patch.recurrencePreset,
			patch.recurrenceRRule === undefined
				? existing.recurrenceRRule
				: patch.recurrenceRRule,
			nextStatus,
			(patch.someday === undefined ? existing.someday : patch.someday) ? 1 : 0,
			// A task pushed back to the backlog must not keep a stale rank, or it
			// jumps to that position the next time it is planned.
			nextScheduledAt === null ? 0 : existing.planOrder,
			// Nothing can still be "in progress" once it is done.
			nextStatus === "completed" ? null : existing.startedAt,
			now,
			taskId,
		);

	return row ? mapTaskRow(row) : null;
}

/**
 * Link (or unlink) a task to a cached calendar event. Linking pins the task's
 * due date to the event's start time so "finish before this meeting" is
 * represented directly; passing null clears the link and leaves dueAt as-is.
 */
export async function linkTaskToEvent(
	db: Db,
	taskId: number,
	eventUid: string | null,
): Promise<Task | null> {
	const existing = await getTask(db, taskId);
	if (!existing) {
		return null;
	}

	const now = nowIso();

	if (eventUid === null) {
		const row = await db
			.prepare(
				"UPDATE tasks SET calendar_event_uid = NULL, updated_at = ? WHERE id = ? RETURNING *",
			)
			.get<Record<string, unknown>>(now, taskId);
		return row ? mapTaskRow(row) : null;
	}

	const event = await getEventByUid(db, eventUid);
	if (!event) {
		throw new Error(`Calendar event not found: ${eventUid}`);
	}

	const row = await db
		.prepare(
			"UPDATE tasks SET calendar_event_uid = ?, due_at = ?, updated_at = ? WHERE id = ? RETURNING *",
		)
		.get<Record<string, unknown>>(eventUid, event.startAt, now, taskId);

	return row ? mapTaskRow(row) : null;
}

/**
 * Re-pin the due date of every task linked to a calendar event to that event's
 * current start time. Run after a calendar sync so that when a meeting moves
 * (earlier or later), the linked task's deadline follows it. Tasks whose event
 * is no longer cached (cancelled, or out of the sync window) are left untouched.
 * Returns the number of tasks whose due date changed.
 */
export async function repinLinkedTaskDueDates(db: Db): Promise<number> {
	const rows = await db
		.prepare(
			`SELECT t.id AS id, t.uuid AS uuid, t.due_at AS due_at,
        (SELECT MIN(c.start_at) FROM calendar_events c WHERE c.uid = t.calendar_event_uid) AS event_start
       FROM tasks t
       WHERE t.calendar_event_uid IS NOT NULL AND t.deleted_at IS NULL`,
		)
		.all<{
			id: number;
			uuid: string | null;
			due_at: string | null;
			event_start: string | null;
		}>();

	const now = nowIso();
	// One batch instead of one UPDATE per row: this runs after every calendar
	// sync, so on D1 the loop would be a round trip per linked task.
	const ops: BatchOp[] = rows
		.filter((row) => row.event_start && row.due_at !== row.event_start)
		.map((row) => ({
			sql: "UPDATE tasks SET due_at = ?, updated_at = ? WHERE id = ?",
			params: [row.event_start, now, row.id],
		}));

	await db.batch(ops);
	return ops.length;
}

export async function deleteTask(db: Db, taskId: number): Promise<boolean> {
	// Mirrors the old `changes > 0` result: only report success when the task
	// exists and was not already soft-deleted.
	const target = await db
		.prepare("SELECT id FROM tasks WHERE id = ? AND deleted_at IS NULL")
		.get<{ id: number }>(taskId);

	if (!target) {
		return false;
	}

	const now = nowIso();
	// Soft-delete the task and all its subtasks, atomically, so a task can never
	// be left deleted while its subtasks stay visible.
	await db.batch([
		{
			sql: "UPDATE tasks SET deleted_at = ?, updated_at = ? WHERE parent_task_id = ? AND deleted_at IS NULL",
			params: [now, now, taskId],
		},
		{
			sql: "UPDATE tasks SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL",
			params: [now, now, taskId],
		},
	]);

	return true;
}

export async function listDeletedTasks(db: Db): Promise<Task[]> {
	const rows = await db
		.prepare(
			"SELECT * FROM tasks WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC",
		)
		.all<Record<string, unknown>>();
	return rows.map(mapTaskRow);
}

export async function undeleteTask(
	db: Db,
	taskId: number,
): Promise<Task | null> {
	const now = nowIso();
	const existing = await db
		.prepare("SELECT * FROM tasks WHERE id = ?")
		.get<Record<string, unknown>>(taskId);

	if (!existing) {
		return null;
	}

	const task = mapTaskRow(existing);
	const ops: BatchOp[] = [];

	// If this task has a soft-deleted parent, undelete the parent first
	if (task.parentTaskId !== null) {
		const parent = await db
			.prepare("SELECT id FROM tasks WHERE id = ? AND deleted_at IS NOT NULL")
			.get<{ id: number }>(task.parentTaskId);
		if (parent) {
			ops.push({
				sql: "UPDATE tasks SET deleted_at = NULL, updated_at = ? WHERE id = ?",
				params: [now, task.parentTaskId],
			});
		}
	}

	// Undelete soft-deleted subtasks of this task
	ops.push({
		sql: "UPDATE tasks SET deleted_at = NULL, updated_at = ? WHERE parent_task_id = ? AND deleted_at IS NOT NULL",
		params: [now, taskId],
	});

	// Undelete the task itself
	ops.push({
		sql: "UPDATE tasks SET deleted_at = NULL, updated_at = ? WHERE id = ?",
		params: [now, taskId],
	});

	await db.batch(ops);

	return getTask(db, taskId);
}

/**
 * Move a commitment date forward by the same span the deadline moved. Returns
 * null when there was no commitment to move.
 */
export function shiftScheduledAt(
	scheduledAt: string | null,
	fromDueAt: string,
	toDueAt: string,
): string | null {
	if (!scheduledAt) return null;
	const delta = Date.parse(toDueAt) - Date.parse(fromDueAt);
	if (!Number.isFinite(delta)) return scheduledAt;
	const shifted = Date.parse(scheduledAt) + delta;
	if (!Number.isFinite(shifted)) return scheduledAt;
	return new Date(shifted).toISOString();
}

export async function completeTask(
	db: Db,
	taskId: number,
): Promise<{
	task: Task | null;
	nextTask: Task | null;
}> {
	const existing = await getTask(db, taskId);

	if (!existing) {
		return { task: null, nextTask: null };
	}

	const now = nowIso();
	// Completing a task unparks it, so it appears in the Completed view (which is
	// subject to the default someday exclusion) rather than vanishing.
	await db
		.prepare(
			"UPDATE tasks SET status = ?, someday = 0, started_at = NULL, plan_order = 0, completed_at = ?, updated_at = ? WHERE id = ?",
		)
		.run("completed", now, now, taskId);

	let nextTask: Task | null = null;

	const isRecurring = Boolean(
		existing.recurrencePreset || existing.recurrenceRRule,
	);

	if (isRecurring && existing.dueAt) {
		const nextDueAt = getNextOccurrence({
			baseIso: existing.dueAt,
			recurrencePreset: existing.recurrencePreset,
			recurrenceRRule: existing.recurrenceRRule,
		});

		if (nextDueAt) {
			nextTask = await createTask(db, {
				projectId: existing.projectId,
				parentTaskId: existing.parentTaskId,
				title: existing.title,
				notes: existing.notes,
				priority: existing.priority,
				// Copying scheduledAt verbatim would recreate the occurrence still
				// committed to today, so a recurring task in today's plan would
				// reappear there the instant it is ticked off and never leave. Shift
				// the commitment by however far the deadline moved instead.
				scheduledAt: shiftScheduledAt(
					existing.scheduledAt,
					existing.dueAt,
					nextDueAt,
				),
				dueAt: nextDueAt,
				dueTimezone: existing.dueTimezone,
				recurrencePreset: existing.recurrencePreset,
				recurrenceRRule: existing.recurrenceRRule,
			});
		}
	}

	// Record each completed occurrence of a recurring task so its history
	// survives the roll-forward to the next occurrence.
	if (isRecurring) {
		await logCompletion(db, taskId, existing.title, now);
	}

	return { task: await getTask(db, taskId), nextTask };
}

export async function uncompleteTask(
	db: Db,
	taskId: number,
): Promise<Task | null> {
	const existing = await getTask(db, taskId);

	if (!existing) {
		return null;
	}

	await db
		.prepare(
			"UPDATE tasks SET status = ?, completed_at = NULL, updated_at = ? WHERE id = ?",
		)
		.run("open", nowIso(), taskId);

	// Keep the completion log in step with the task's actual state.
	if (existing.recurrencePreset || existing.recurrenceRRule) {
		await deleteLatestCompletion(db, taskId);
	}

	return getTask(db, taskId);
}

/**
 * Commit an ordered list of tasks to one day. `plan_order` is 1-based so that
 * planned tasks are always distinguishable from the 0 default carried by
 * everything that has never been planned.
 */
export async function planDay(
	db: Db,
	day: string,
	orderedIds: number[],
): Promise<Task[]> {
	const now = nowIso();
	const ops: BatchOp[] = orderedIds.map((id, index) => ({
		sql: "UPDATE tasks SET scheduled_at = ?, plan_order = ?, someday = 0, updated_at = ? WHERE id = ? AND status = 'open' AND deleted_at IS NULL",
		params: [day, index + 1, now, id],
	}));
	await db.batch(ops);

	const rows = await db
		.prepare(
			"SELECT * FROM tasks WHERE scheduled_at = ? AND status = 'open' AND deleted_at IS NULL ORDER BY plan_order ASC",
		)
		.all<Record<string, unknown>>(day);
	return rows.map(mapTaskRow);
}

/**
 * Mark a task as the one being worked on. Single focus is enforced here rather
 * than in the UI so the web app, the macOS wrapper and Raycast cannot disagree
 * about what "now" is.
 */
export async function startTask(db: Db, taskId: number): Promise<Task | null> {
	const existing = await getTask(db, taskId);
	if (!existing || existing.status !== "open") {
		return null;
	}

	const now = nowIso();
	await db.batch([
		{
			sql: "UPDATE tasks SET started_at = NULL, updated_at = ? WHERE started_at IS NOT NULL AND id != ?",
			params: [now, taskId],
		},
		{
			sql: "UPDATE tasks SET started_at = ?, updated_at = ? WHERE id = ?",
			params: [now, now, taskId],
		},
	]);

	return getTask(db, taskId);
}

export async function stopTask(db: Db, taskId: number): Promise<Task | null> {
	const existing = await getTask(db, taskId);
	if (!existing) {
		return null;
	}

	await db
		.prepare("UPDATE tasks SET started_at = NULL, updated_at = ? WHERE id = ?")
		.run(nowIso(), taskId);

	return getTask(db, taskId);
}

/** The task currently being worked on, if any. */
export async function getStartedTask(db: Db): Promise<Task | null> {
	const row = await db
		.prepare(
			"SELECT * FROM tasks WHERE started_at IS NOT NULL AND status = 'open' AND deleted_at IS NULL LIMIT 1",
		)
		.get<Record<string, unknown>>();
	return row ? mapTaskRow(row) : null;
}
