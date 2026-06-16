#!/usr/bin/env bun
import { getDb } from '@/server/db/client'
import { mapTaskRow } from '@/server/repos/mappers'
import { getProject } from '@/server/repos/projects'

const db = getDb()
const now = new Date().toISOString()

const rows = db
  .prepare(`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE t.status = 'open'
      AND t.due_at IS NOT NULL
      AND t.due_at < ?
      AND t.deleted_at IS NULL
    ORDER BY t.due_at ASC, t.priority ASC
  `)
  .all(now) as Array<Record<string, unknown>>

if (rows.length === 0) {
  console.log('No overdue tasks!')
  process.exit(0)
}

console.log(`You have ${rows.length} overdue task${rows.length === 1 ? '' : 's'}:\n`)

for (const row of rows) {
  const dueAt = new Date(String(row.due_at))
  const daysOverdue = Math.floor((Date.now() - dueAt.getTime()) / (1000 * 60 * 60 * 24))
  const priority = Number(row.priority)
  const priorityLabel = priority === 1 ? 'p1' : priority === 2 ? 'p2' : priority === 3 ? 'p3' : 'p4'
  const projectName = row.project_name ? String(row.project_name) : 'Inbox'

  const dateStr = dueAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: dueAt.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  })

  console.log(`  ${priorityLabel} | ${String(row.title)}`)
  console.log(`      Due: ${dateStr} (${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue) | Project: ${projectName}`)
  if (row.notes && String(row.notes).trim()) {
    const notes = String(row.notes).split('\n')[0].slice(0, 50)
    console.log(`      Notes: ${notes}${String(row.notes).length > 50 ? '...' : ''}`)
  }
  console.log()
}
