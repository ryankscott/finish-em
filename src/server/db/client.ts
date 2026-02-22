import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'

import { SCHEMA_STATEMENTS } from './schema'

const _require = createRequire(import.meta.url)
const isBun = 'Bun' in (globalThis as Record<string, unknown>)
const DEFAULT_ASSISTANT_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'
const DEFAULT_AI_PROVIDER = 'gemini'

// Minimal interface compatible with both better-sqlite3 and bun:sqlite
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
  if (isBun) {
    // bun:sqlite is a Bun runtime built-in — no bundling needed, always available.
    type BunRawDb = {
      prepare(sql: string): { all(...p: unknown[]): unknown[]; get(...p: unknown[]): unknown; run(...p: unknown[]): void }
      exec(sql: string): void
      close(): void
      query(sql: string): { get(...p: unknown[]): unknown }
    }
    const { Database } = _require('bun:sqlite') as { Database: new (path: string) => BunRawDb }
    const raw = new Database(filePath)

    // Wrap to provide better-sqlite3-compatible Statement.run() return shape.
    // bun:sqlite's run() returns void; we use SQLite built-in functions to retrieve metadata.
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

  // Node.js dev mode: use better-sqlite3.
  // The module name is built at runtime so Bun's static bundler does not attempt
  // to include this native addon when compiling the standalone binary.
  const nodeModule = `${'better'}-${'sqlite3'}`
  const NodeDb = _require(nodeModule) as new (path: string) => DbLike
  return new NodeDb(filePath)
}

let dbInstance: DbLike | null = null

function getDbPath() {
  const override = process.env.TODO_DB_PATH
  if (override && override.trim().length > 0) {
    return path.resolve(override)
  }

  if (isBun) {
    // Standalone binary: default to ~/.finish-em/todo.db
    return path.join(os.homedir(), '.finish-em', 'todo.db')
  }

  // Node.js dev mode: keep cwd-relative path
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
      'INSERT INTO settings (id, timezone, ai_base_url, ai_model, ai_api_key, created_at, updated_at) VALUES (1, ?, ?, NULL, NULL, ?, ?)',
    ).run(timezone, DEFAULT_ASSISTANT_BASE_URL, now, now)
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

function ensureSettingsAiSchema(db: DbLike) {
  const settingsTable = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'settings'")
    .get() as { name?: string } | undefined

  if (!settingsTable?.name) {
    return
  }

  const columns = db.prepare('PRAGMA table_info(settings)').all() as Array<{
    name: unknown
  }>
  const hasAiBaseUrl = columns.some((column) => String(column.name) === 'ai_base_url')
  const hasAiModel = columns.some((column) => String(column.name) === 'ai_model')
  const hasAiApiKey = columns.some((column) => String(column.name) === 'ai_api_key')
  const hasAiProvider = columns.some((column) => String(column.name) === 'ai_provider')

  if (!hasAiBaseUrl) {
    db.exec('ALTER TABLE settings ADD COLUMN ai_base_url TEXT')
  }
  if (!hasAiModel) {
    db.exec('ALTER TABLE settings ADD COLUMN ai_model TEXT')
  }
  if (!hasAiApiKey) {
    db.exec('ALTER TABLE settings ADD COLUMN ai_api_key TEXT')
  }
  if (!hasAiProvider) {
    db.exec(`ALTER TABLE settings ADD COLUMN ai_provider TEXT NOT NULL DEFAULT '${DEFAULT_AI_PROVIDER}'`)
  }

  db.prepare(
    `UPDATE settings SET ai_provider = ? WHERE id = 1 AND (ai_provider IS NULL OR ai_provider NOT IN ('gemini', 'openai', 'lmstudio'))`,
  ).run(DEFAULT_AI_PROVIDER)

  db.prepare('UPDATE settings SET ai_base_url = ? WHERE id = 1 AND ai_base_url IS NULL')
    .run(DEFAULT_ASSISTANT_BASE_URL)
}

function ensureAssistantMessagesSchema(db: DbLike) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS assistant_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      surface TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      actions_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)
  db.exec(
    'CREATE INDEX IF NOT EXISTS idx_assistant_messages_surface_created_at ON assistant_messages(surface, created_at)',
  )
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

function initialize(db: DbLike) {
  db.exec('PRAGMA foreign_keys = ON')
  ensureTaskSubtaskSchema(db)
  ensureSettingsAiSchema(db)
  ensureAssistantMessagesSchema(db)
  for (const statement of SCHEMA_STATEMENTS) {
    db.exec(statement)
  }
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
