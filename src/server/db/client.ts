import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

import { SCHEMA_STATEMENTS } from './schema'

let dbInstance: Database | null = null

function getDbPath() {
  const override = process.env.TODO_DB_PATH
  if (override && override.trim().length > 0) {
    return path.resolve(override)
  }

  const dbDir = path.resolve(process.cwd(), 'data')
  return path.join(dbDir, 'todo.db')
}

function seedDefaults(db: Database) {
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

function initialize(db: Database) {
  db.exec('PRAGMA foreign_keys = ON')
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

  dbInstance = new Database(dbPath)
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
