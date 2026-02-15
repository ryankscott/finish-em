import { getDb, nowIso } from '@/server/db/client'
import { mapGoalRow } from '@/server/repos/mappers'

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

  const result = db
    .prepare(
      'INSERT INTO goals (period_type, period_start, title, done, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .run(
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

  return getGoal(goalId)
}

export function deleteGoal(goalId: number): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM goals WHERE id = ?').run(goalId)
  return result.changes > 0
}
