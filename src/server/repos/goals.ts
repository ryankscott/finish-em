import { getDb, nowIso } from '@/server/db/client'
import { mapGoalRow } from '@/server/repos/mappers'
import { trackCreate, trackDelete, trackFieldChanges } from '@/server/sync/repo-sync'

import type { Goal, GoalPeriod } from '@/server/types'

export function listGoals(filters?: {
  periodType?: GoalPeriod
  periodStart?: string
}): Goal[] {
  const db = getDb()
  const clauses: string[] = []
  const values: string[] = []

  if (filters?.periodType) {
    clauses.push('period_type = ?')
    values.push(filters.periodType)
  }

  if (filters?.periodStart) {
    clauses.push('period_start = ?')
    values.push(filters.periodStart)
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''

  const rows = db
    .prepare(`SELECT * FROM goals ${where} ORDER BY period_start DESC, id DESC`)
    .all(...values) as Record<string, unknown>[]

  return rows.map(mapGoalRow)
}

export function getGoal(goalId: number): Goal | null {
  const db = getDb()
  const row = db
    .prepare('SELECT * FROM goals WHERE id = ?')
    .get(goalId) as Record<string, unknown> | undefined

  return row ? mapGoalRow(row) : null
}

export function createGoal(input: {
  periodType: GoalPeriod
  periodStart: string
  title: string
  done?: boolean
}): Goal {
  const db = getDb()
  const now = nowIso()
  const uuid = crypto.randomUUID()

  const result = db
    .prepare(
      'INSERT INTO goals (uuid, period_type, period_start, title, done, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    .run(
      uuid,
      input.periodType,
      input.periodStart,
      input.title,
      input.done ? 1 : 0,
      now,
      now,
    )

  const id = Number(result.lastInsertRowid)
  const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(id) as Record<
    string,
    unknown
  >
  trackCreate(db, 'goal', uuid, JSON.stringify(row), now)
  return mapGoalRow(row)
}

export function updateGoal(
  goalId: number,
  patch: Partial<{
    periodType: GoalPeriod
    periodStart: string
    title: string
    done: boolean
  }>,
): Goal | null {
  const db = getDb()
  const existing = getGoal(goalId)

  if (!existing) {
    return null
  }

  db.prepare(
    `UPDATE goals SET
      period_type = ?,
      period_start = ?,
      title = ?,
      done = ?,
      updated_at = ?
     WHERE id = ?`,
  ).run(
    patch.periodType ?? existing.periodType,
    patch.periodStart ?? existing.periodStart,
    patch.title ?? existing.title,
    patch.done === undefined ? (existing.done ? 1 : 0) : patch.done ? 1 : 0,
    nowIso(),
    goalId,
  )

  const uuidRow = db.prepare('SELECT uuid FROM goals WHERE id = ?').get(goalId) as { uuid: string | null }
  if (uuidRow?.uuid) {
    const fields: Record<string, string | null> = {}
    if (patch.periodType !== undefined) fields.period_type = patch.periodType
    if (patch.periodStart !== undefined) fields.period_start = patch.periodStart
    if (patch.title !== undefined) fields.title = patch.title
    if (patch.done !== undefined) fields.done = patch.done ? '1' : '0'
    if (Object.keys(fields).length > 0) {
      trackFieldChanges(db, 'goal', uuidRow.uuid, fields, nowIso())
    }
  }

  return getGoal(goalId)
}

export function deleteGoal(goalId: number): boolean {
  const db = getDb()
  const uuidRow = db.prepare('SELECT uuid FROM goals WHERE id = ?').get(goalId) as { uuid: string | null }
  const result = db.prepare('DELETE FROM goals WHERE id = ?').run(goalId)
  if (result.changes > 0 && uuidRow?.uuid) {
    trackDelete(db, 'goal', uuidRow.uuid, nowIso())
  }
  return result.changes > 0
}
