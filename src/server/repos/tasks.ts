import { getDb, nowIso } from '@/server/db/client'
import { mapTaskRow } from '@/server/repos/mappers'
import { getProject } from '@/server/repos/projects'
import { getNextOccurrence, validateRRuleSubset } from '@/server/services/recurrence'

import type { Priority, Task, TaskFilters, TaskStatus } from '@/server/types'

function buildFilterClause(filters: TaskFilters) {
  const clauses: string[] = []
  const values: Array<number | string> = []

  if (filters.projectId) {
    clauses.push('project_id = ?')
    values.push(filters.projectId)
  }

  if (filters.status) {
    clauses.push('status = ?')
    values.push(filters.status)
  }

  if (filters.priority) {
    clauses.push('priority = ?')
    values.push(filters.priority)
  }

  if (filters.parentTaskId !== undefined) {
    if (filters.parentTaskId === null) {
      clauses.push('parent_task_id IS NULL')
    } else {
      clauses.push('parent_task_id = ?')
      values.push(filters.parentTaskId)
    }
  } else if (filters.rootsOnly) {
    clauses.push('parent_task_id IS NULL')
  }

  if (filters.noDueDate) {
    clauses.push('due_at IS NULL')
  }

  if (!filters.noDueDate && filters.from) {
    clauses.push('(due_at IS NOT NULL AND due_at >= ?)')
    values.push(filters.from)
  }

  if (!filters.noDueDate && filters.to) {
    clauses.push('(due_at IS NOT NULL AND due_at <= ?)')
    values.push(filters.to)
  }

  // Always exclude soft-deleted tasks from regular queries
  clauses.push('deleted_at IS NULL')

  return {
    clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
  }
}

function taskHasChildren(taskId: number) {
  const db = getDb()
  const row = db
    .prepare('SELECT COUNT(*) AS count FROM tasks WHERE parent_task_id = ?')
    .get(taskId) as { count: number }
  return Number(row.count) > 0
}

function validateParentTaskId(input: {
  taskId?: number
  projectId: number
  parentTaskId: number | null
}) {
  if (input.parentTaskId === null) {
    return null
  }

  const parent = getTask(input.parentTaskId)
  if (!parent) {
    throw new Error('Parent task not found')
  }

  if (input.taskId !== undefined && parent.id === input.taskId) {
    throw new Error('Task cannot be its own parent')
  }

  if (parent.parentTaskId !== null) {
    throw new Error('Parent task cannot be a subtask')
  }

  if (parent.projectId !== input.projectId) {
    throw new Error('Parent task must belong to the same project')
  }

  return parent.id
}

export function listTasks(filters: TaskFilters = {}): Task[] {
  const db = getDb()
  const { clause, values } = buildFilterClause(filters)

  const rows = db
    .prepare(
      `SELECT * FROM tasks ${clause} ORDER BY status ASC, due_at IS NULL ASC, due_at ASC, priority ASC, created_at DESC`,
    )
    .all(...values) as Record<string, unknown>[]

  return rows.map(mapTaskRow)
}

export function getTask(taskId: number): Task | null {
  const db = getDb()
  const row = db
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .get(taskId) as Record<string, unknown> | undefined

  return row ? mapTaskRow(row) : null
}

export function createTask(input: {
  projectId: number
  parentTaskId?: number | null
  title: string
  notes?: string
  priority?: Priority
  scheduledAt?: string | null
  dueAt?: string | null
  dueTimezone?: string | null
  recurrencePreset?: string | null
  recurrenceRRule?: string | null
}): Task {
  const project = getProject(input.projectId)
  if (!project) {
    throw new Error(`Project not found: ${input.projectId}. Use "finish-em project list" to see valid project IDs.`)
  }

  const db = getDb()
  const now = nowIso()
  const parentTaskId = validateParentTaskId({
    projectId: input.projectId,
    parentTaskId: input.parentTaskId ?? null,
  })

  if (input.recurrenceRRule && !validateRRuleSubset(input.recurrenceRRule)) {
    throw new Error('Invalid RRULE subset')
  }

  const result = db
    .prepare(
      `INSERT INTO tasks (
        project_id, parent_task_id, title, notes, priority, scheduled_at, due_at, due_timezone,
        recurrence_preset, recurrence_rrule, status, completed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', NULL, ?, ?)`,
    )
    .run(
      input.projectId,
      parentTaskId,
      input.title,
      input.notes ?? '',
      input.priority ?? 4,
      input.scheduledAt ?? null,
      input.dueAt ?? null,
      input.dueTimezone ?? null,
      input.recurrencePreset ?? null,
      input.recurrenceRRule ?? null,
      now,
      now,
    )

  const id = Number(result.lastInsertRowid)
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Record<
    string,
    unknown
  >
  return mapTaskRow(row)
}

export function updateTask(
  taskId: number,
  patch: Partial<{
    projectId: number
    parentTaskId: number | null
    title: string
    notes: string
    priority: Priority
    scheduledAt: string | null
    dueAt: string | null
    dueTimezone: string | null
    recurrencePreset: string | null
    recurrenceRRule: string | null
    status: TaskStatus
  }>,
): Task | null {
  const db = getDb()
  const existing = getTask(taskId)

  if (!existing) {
    return null
  }

  if (patch.recurrenceRRule && !validateRRuleSubset(patch.recurrenceRRule)) {
    throw new Error('Invalid RRULE subset')
  }

  const nextProjectId = patch.projectId ?? existing.projectId
  const nextParentTaskId =
    patch.parentTaskId === undefined ? existing.parentTaskId : patch.parentTaskId

  if (nextParentTaskId !== null && taskHasChildren(taskId)) {
    throw new Error('A task with subtasks cannot be assigned as a subtask')
  }

  const validatedParentTaskId = validateParentTaskId({
    taskId,
    projectId: nextProjectId,
    parentTaskId: nextParentTaskId,
  })

  const now = nowIso()
  db.prepare(
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
      updated_at = ?
    WHERE id = ?`,
  ).run(
    nextProjectId,
    validatedParentTaskId,
    patch.title ?? existing.title,
    patch.notes ?? existing.notes,
    patch.priority ?? existing.priority,
    patch.scheduledAt === undefined ? existing.scheduledAt : patch.scheduledAt,
    patch.dueAt === undefined ? existing.dueAt : patch.dueAt,
    patch.dueTimezone === undefined ? existing.dueTimezone : patch.dueTimezone,
    patch.recurrencePreset === undefined
      ? existing.recurrencePreset
      : patch.recurrencePreset,
    patch.recurrenceRRule === undefined
      ? existing.recurrenceRRule
      : patch.recurrenceRRule,
    patch.status ?? existing.status,
    now,
    taskId,
  )

  return getTask(taskId)
}

export function deleteTask(taskId: number): boolean {
  const db = getDb()
  const now = nowIso()
  // Soft-delete the task and all its subtasks
  db.prepare(
    'UPDATE tasks SET deleted_at = ?, updated_at = ? WHERE parent_task_id = ? AND deleted_at IS NULL',
  ).run(now, now, taskId)
  const result = db
    .prepare('UPDATE tasks SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL')
    .run(now, now, taskId)
  return result.changes > 0
}

export function listDeletedTasks(): Task[] {
  const db = getDb()
  const rows = db
    .prepare(
      'SELECT * FROM tasks WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC',
    )
    .all() as Record<string, unknown>[]
  return rows.map(mapTaskRow)
}

export function undeleteTask(taskId: number): Task | null {
  const db = getDb()
  const now = nowIso()
  const existing = db
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .get(taskId) as Record<string, unknown> | undefined

  if (!existing) {
    return null
  }

  const task = mapTaskRow(existing)

  // If this task has a soft-deleted parent, undelete the parent first
  if (task.parentTaskId !== null) {
    const parent = db
      .prepare('SELECT * FROM tasks WHERE id = ? AND deleted_at IS NOT NULL')
      .get(task.parentTaskId) as Record<string, unknown> | undefined
    if (parent) {
      db.prepare(
        'UPDATE tasks SET deleted_at = NULL, updated_at = ? WHERE id = ?',
      ).run(now, task.parentTaskId)
    }
  }

  // Undelete soft-deleted subtasks of this task
  db.prepare(
    'UPDATE tasks SET deleted_at = NULL, updated_at = ? WHERE parent_task_id = ? AND deleted_at IS NOT NULL',
  ).run(now, taskId)

  // Undelete the task itself
  db.prepare(
    'UPDATE tasks SET deleted_at = NULL, updated_at = ? WHERE id = ?',
  ).run(now, taskId)

  return getTask(taskId)
}

export function completeTask(taskId: number): {
  task: Task | null
  nextTask: Task | null
} {
  const db = getDb()
  const existing = getTask(taskId)

  if (!existing) {
    return { task: null, nextTask: null }
  }

  const now = nowIso()
  db.prepare(
    'UPDATE tasks SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?',
  ).run('completed', now, now, taskId)

  let nextTask: Task | null = null

  if (existing.dueAt && (existing.recurrencePreset || existing.recurrenceRRule)) {
    const nextDueAt = getNextOccurrence({
      baseIso: existing.dueAt,
      recurrencePreset: existing.recurrencePreset,
      recurrenceRRule: existing.recurrenceRRule,
    })

    if (nextDueAt) {
      nextTask = createTask({
        projectId: existing.projectId,
        parentTaskId: existing.parentTaskId,
        title: existing.title,
        notes: existing.notes,
        priority: existing.priority,
        scheduledAt: existing.scheduledAt,
        dueAt: nextDueAt,
        dueTimezone: existing.dueTimezone,
        recurrencePreset: existing.recurrencePreset,
        recurrenceRRule: existing.recurrenceRRule,
      })
    }
  }

  return { task: getTask(taskId), nextTask }
}

export function uncompleteTask(taskId: number): Task | null {
  const db = getDb()
  const existing = getTask(taskId)

  if (!existing) {
    return null
  }

  db.prepare(
    'UPDATE tasks SET status = ?, completed_at = NULL, updated_at = ? WHERE id = ?',
  ).run('open', nowIso(), taskId)

  return getTask(taskId)
}
