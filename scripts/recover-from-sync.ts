/**
 * One-off recovery: rebuild a finish-em database's tasks/goals from the iCloud
 * sync changeset history.
 *
 * The target DB must already contain the projects (we open a copy of the stale
 * home DB). getDb() materializes the missing `tasks` table + uuid columns, then
 * pullAndMerge() replays every changeset authored by other device ids.
 *
 * Usage:
 *   bun scripts/recover-from-sync.ts <recoveredDbPath> <syncPath>
 *
 * This script never touches ~/.finish-em/todo.db; it only writes to the path
 * you pass as <recoveredDbPath>.
 */
const recoveredPath = process.argv[2]
const syncPath = process.argv[3]

if (!recoveredPath || !syncPath) {
  console.error('Usage: bun scripts/recover-from-sync.ts <recoveredDbPath> <syncPath>')
  process.exit(1)
}

// Point the shared DB client at the recovered copy BEFORE importing it.
process.env.TODO_DB_PATH = recoveredPath

const { getDb } = await import('@/server/db/client')
const { pullAndMerge, setSyncMeta } = await import('@/server/sync/engine')
const { ICloudSyncBackend } = await import('@/server/sync/backends/icloud')

const db = getDb()

// Use a fresh device id so the engine treats the 20b84137 changesets as remote
// (it skips changes whose device id matches our own), and clear last_sync_at so
// pull replays the full history rather than only changes after the last sync.
setSyncMeta(db, 'device_id', crypto.randomUUID())
db.prepare("DELETE FROM sync_meta WHERE key = 'last_sync_at'").run()

const backend = new ICloudSyncBackend(syncPath)
const applied = await pullAndMerge(db, backend)

const totalTasks = (db.prepare('SELECT COUNT(*) AS n FROM tasks').get() as { n: number }).n
const liveTasks = (
  db.prepare('SELECT COUNT(*) AS n FROM tasks WHERE deleted_at IS NULL').get() as { n: number }
).n
const deletedTasks = totalTasks - liveTasks
const goals = (db.prepare('SELECT COUNT(*) AS n FROM goals').get() as { n: number }).n

const byProject = db
  .prepare(
    `SELECT p.id, p.name, COUNT(t.id) AS n
     FROM projects p
     LEFT JOIN tasks t ON t.project_id = p.id AND t.deleted_at IS NULL
     GROUP BY p.id, p.name
     HAVING n > 0
     ORDER BY n DESC`,
  )
  .all() as Array<{ id: number; name: string; n: number }>

console.log('changes applied:', applied)
console.log('tasks total:', totalTasks, '| live:', liveTasks, '| deleted:', deletedTasks)
console.log('goals:', goals)
console.log('live tasks by project:')
for (const row of byProject) {
  console.log(`  [${row.id}] ${row.name}: ${row.n}`)
}
