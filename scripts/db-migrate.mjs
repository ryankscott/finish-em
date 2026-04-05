import fs from 'node:fs'
import path from 'node:path'
import { Database } from 'bun:sqlite'

const cwd = process.cwd()
const dbPath = path.resolve(process.env.TODO_DB_PATH ?? './data/todo.db')
const migrationsDir = path.resolve(cwd, 'src/server/db/migrations')

if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
}

if (!fs.existsSync(migrationsDir)) {
  console.log(`No migrations directory found at ${migrationsDir}`)
  process.exit(0)
}

const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((entry) => entry.endsWith('.sql'))
  .sort((a, b) => a.localeCompare(b))

const db = new Database(dbPath)

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    );
  `)

  const appliedRows = db
    .prepare('SELECT filename FROM schema_migrations ORDER BY filename')
    .all()
  const applied = new Set(appliedRows.map((row) => String(row.filename)))

  // Backfill schema_migrations for migrations that were applied via client.ts
  // schema guards before the migration runner tracked everything.
  const now = new Date().toISOString()
  const projectCols = new Set(
    db.prepare('PRAGMA table_info(projects)').all().map((r) => r.name),
  )
  const taskCols = new Set(
    db.prepare('PRAGMA table_info(tasks)').all().map((r) => r.name),
  )
  const backfills = [
    { file: '002_project_enhancements.sql', check: () => projectCols.has('emoji') },
    { file: '003_subtasks.sql', check: () => taskCols.has('parent_task_id') },
    { file: '004_soft_delete_tasks.sql', check: () => taskCols.has('deleted_at') },
    { file: '005_project_external_links.sql', check: () => projectCols.has('jira_discovery_url') },
    { file: '006_blocked_tasks.sql', check: () => taskCols.has('blocked_at') },
  ]
  for (const { file, check } of backfills) {
    if (!applied.has(file) && check()) {
      db.prepare(
        'INSERT INTO schema_migrations (filename, applied_at) VALUES (?, ?)',
      ).run(file, now)
      applied.add(file)
      console.log(`Backfilled already-applied migration: ${file}`)
    }
  }

  for (const file of migrationFiles) {
    if (applied.has(file)) {
      console.log(`Skipping already-applied migration: ${file}`)
      continue
    }

    const sql = await Bun.file(path.join(migrationsDir, file)).text()
    const now = new Date().toISOString()

    db.exec('BEGIN')
    try {
      db.exec(sql)
      db.prepare(
        'INSERT INTO schema_migrations (filename, applied_at) VALUES (?, ?)',
      ).run(file, now)
      db.exec('COMMIT')
      console.log(`Applied migration: ${file}`)
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }

  if (migrationFiles.length === 0) {
    console.log('No SQL migrations found.')
  }
} finally {
  db.close()
}
