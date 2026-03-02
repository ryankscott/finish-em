import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Database } from 'bun:sqlite'

import { SCHEMA_STATEMENTS } from './schema'

// Minimal interface used by repos/services on top of bun:sqlite
type StatementRunResult = {
  changes: number
  lastInsertRowid: number | bigint
}

type DbStatement = {
  all(...params: unknown[]): unknown[]
  get(...params: unknown[]): unknown
  run(...params: unknown[]): StatementRunResult
}

type DbLike = {
  prepare(sql: string): DbStatement
  exec(sql: string): void
  close(): void
}

function openSqliteDb(filePath: string): DbLike {
  const raw = new Database(filePath)
  return {
    prepare(sql: string): DbStatement {
      const stmt = raw.prepare(sql)
      return {
        all(...params) { return stmt.all(...params) },
        get(...params) { return stmt.get(...params) },
        run(...params) {
          stmt.run(...params)
          const meta = raw.query('SELECT last_insert_rowid() AS lid, changes() AS ch').get() as { lid: number; ch: number } | null
          return { changes: meta?.ch ?? 0, lastInsertRowid: meta?.lid ?? 0 }
        },
      }
    },
    exec(sql) { raw.exec(sql) },
    close() { raw.close() },
  }
}

let dbInstance: DbLike | null = null

function isCompiledExecutable() {
  const basename = path.basename(process.execPath).toLowerCase()
  return basename !== 'bun' && basename !== 'bun.exe'
}

function getDbPath() {
  const override = process.env.TODO_DB_PATH
  if (override && override.trim().length > 0) {
    return path.resolve(override)
  }

  if (isCompiledExecutable()) {
    // Bun compiled executable: default to ~/.finish-em/todo.db
    return path.join(os.homedir(), '.finish-em', 'todo.db')
  }

  // Bun source mode: keep cwd-relative path
  const dbDir = path.resolve(process.cwd(), 'data')
  return path.join(dbDir, 'todo.db')
}

function seedDefaults(db: DbLike) {
  const now = new Date().toISOString()

  const settingsCount = db
    .prepare('SELECT COUNT(*) as count FROM settings')
    .get() as { count: number }

  if (settingsCount.count === 0) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    db.prepare(
      'INSERT INTO settings (id, timezone, created_at, updated_at) VALUES (1, ?, ?, ?)',
    ).run(timezone, now, now)
  }

  const inboxCount = db
    .prepare('SELECT COUNT(*) as count FROM projects WHERE is_inbox = 1')
    .get() as { count: number }

  if (inboxCount.count === 0) {
    db.prepare(
      'INSERT INTO projects (name, color, is_inbox, created_at, updated_at) VALUES (?, ?, 1, ?, ?)',
    ).run('Inbox', '#ef4444', now, now)
  }
}

function ensureTaskSubtaskSchema(db: DbLike) {
  const tasksTable = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tasks'")
    .get() as { name?: string } | undefined

  if (!tasksTable?.name) {
    return
  }

  const columns = db.prepare('PRAGMA table_info(tasks)').all() as Array<{
    name: unknown
  }>
  const hasParentTaskId = columns.some(
    (column) => String(column.name) === 'parent_task_id',
  )

  if (!hasParentTaskId) {
    db.exec(
      'ALTER TABLE tasks ADD COLUMN parent_task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE',
    )
  }

  db.exec(
    'CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id)',
  )
}

function ensureProjectEnhancementsSchema(db: DbLike) {
  const projectsTable = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'projects'")
    .get() as { name?: string } | undefined

  if (!projectsTable?.name) {
    return
  }

  const columns = db.prepare('PRAGMA table_info(projects)').all() as Array<{
    name: unknown
  }>

  const hasEmoji = columns.some((column) => String(column.name) === 'emoji')
  const hasDescription = columns.some(
    (column) => String(column.name) === 'description',
  )
  const hasStartAt = columns.some((column) => String(column.name) === 'start_at')
  const hasEndAt = columns.some((column) => String(column.name) === 'end_at')

  if (!hasEmoji) {
    db.exec('ALTER TABLE projects ADD COLUMN emoji TEXT')
  }
  if (!hasDescription) {
    db.exec("ALTER TABLE projects ADD COLUMN description TEXT NOT NULL DEFAULT ''")
  }
  if (!hasStartAt) {
    db.exec('ALTER TABLE projects ADD COLUMN start_at TEXT')
  }
  if (!hasEndAt) {
    db.exec('ALTER TABLE projects ADD COLUMN end_at TEXT')
  }
}

function initialize(db: DbLike) {
  db.exec('PRAGMA foreign_keys = ON')
  for (const statement of SCHEMA_STATEMENTS) {
    db.exec(statement)
  }
  ensureTaskSubtaskSchema(db)
  ensureProjectEnhancementsSchema(db)
  seedDefaults(db)
}

export function getDb() {
  if (dbInstance) {
    return dbInstance
  }

  const dbPath = getDbPath()
  const dir = path.dirname(dbPath)

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  dbInstance = openSqliteDb(dbPath)
  initialize(dbInstance)

  return dbInstance
}

export function nowIso() {
  return new Date().toISOString()
}

export function resetDbForTests() {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
