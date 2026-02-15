import { getDb, nowIso } from '@/server/db/client'
import { mapTaskRow } from '@/server/repos/mappers'
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

  return {
    clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
  }
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
  title: string
  notes?: string
  priority?: Priority
  scheduledAt?: string | null
  dueAt?: string | null
  dueTimezone?: string | null
  recurrencePreset?: string | null
  recurrenceRRule?: string | null
}): Task {
  const db = getDb()
  const now = nowIso()

  if (input.recurrenceRRule && !validateRRuleSubset(input.recurrenceRRule)) {
    throw new Error('Invalid RRULE subset')
  }

  const result = db
    .prepare(
      `INSERT INTO tasks (
        project_id, title, notes, priority, scheduled_at, due_at, due_timezone,
        recurrence_preset, recurrence_rrule, status, completed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', NULL, ?, ?)`,
    )
    .run(
      input.projectId,
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

  const now = nowIso()
  db.prepare(
    `UPDATE tasks SET
      project_id = ?,
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
    patch.projectId ?? existing.projectId,
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
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId)
  return result.changes > 0
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
