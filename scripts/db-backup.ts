/**
 * Manual on-demand backup of the finish-em database.
 *
 * Produces a consistent, point-in-time snapshot (via SQLite `VACUUM INTO`) at
 *   <dbDir>/backups/manual-<timestamp>.db
 *
 * Respects TODO_DB_PATH (defaults to ~/.finish-em/todo.db). Safe to run while
 * the app is open; it only reads the source database.
 *
 * Usage: bun scripts/db-backup.ts
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Database } from 'bun:sqlite'

function resolveDbPath(): string {
  const override = process.env.TODO_DB_PATH
  if (override && override.trim().length > 0) return path.resolve(override)
  return path.join(os.homedir(), '.finish-em', 'todo.db')
}

const dbPath = resolveDbPath()
if (!fs.existsSync(dbPath)) {
  console.error(`No database found at ${dbPath}`)
  process.exit(1)
}

const backupsDir = path.join(path.dirname(dbPath), 'backups')
fs.mkdirSync(backupsDir, { recursive: true })

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const target = path.join(backupsDir, `manual-${stamp}.db`)

const db = new Database(dbPath)
try {
  db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`)
} finally {
  db.close()
}

const tasks = (() => {
  try {
    const snap = new Database(target, { readonly: true })
    const row = snap.query('SELECT COUNT(*) AS n FROM tasks WHERE deleted_at IS NULL').get() as {
      n: number
    }
    snap.close()
    return row.n
  } catch {
    return null
  }
})()

console.log(`Backup written: ${target}`)
if (tasks !== null) console.log(`Live tasks in snapshot: ${tasks}`)
