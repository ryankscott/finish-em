import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

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

  for (const file of migrationFiles) {
    if (applied.has(file)) {
      console.log(`Skipping already-applied migration: ${file}`)
      continue
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
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
