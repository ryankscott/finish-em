-- Add uuid columns to all entity tables for cross-device identity
ALTER TABLE tasks ADD COLUMN uuid TEXT;
ALTER TABLE projects ADD COLUMN uuid TEXT;
ALTER TABLE goals ADD COLUMN uuid TEXT;
ALTER TABLE reminders ADD COLUMN uuid TEXT;

-- Unique indexes on uuid (allow NULL for rows not yet backfilled, enforced by app)
CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_uuid ON tasks(uuid) WHERE uuid IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_uuid ON projects(uuid) WHERE uuid IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_goals_uuid ON goals(uuid) WHERE uuid IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_reminders_uuid ON reminders(uuid) WHERE uuid IS NOT NULL;

-- Sync metadata store (device_id, last_sync_at, sync_enabled, etc.)
CREATE TABLE IF NOT EXISTS sync_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Changelog of every mutation, consumed by the sync push phase
CREATE TABLE IF NOT EXISTS sync_changelog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_uuid TEXT NOT NULL,
  field_name TEXT NOT NULL,
  new_value TEXT,
  updated_at TEXT NOT NULL,
  device_id TEXT NOT NULL,
  synced INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sync_changelog_synced ON sync_changelog(synced);
CREATE INDEX IF NOT EXISTS idx_sync_changelog_entity ON sync_changelog(entity_type, entity_uuid);
