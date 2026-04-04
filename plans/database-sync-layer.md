# Database Sync Layer

## Why not just point `TODO_DB_PATH` at iCloud Drive?

SQLite databases are multi-file on disk (main db + WAL/journal/shm files). Cloud sync services like iCloud Drive can:

1. Sync files independently, delivering a WAL without its matching db (or vice versa), corrupting the database
2. Silently duplicate files when two machines edit simultaneously ("file.db" vs "file 2.db")
3. Evict files to save space, breaking the app

**The safe pattern**: keep the working database local, and sync changes via an export/import mechanism.

## Architecture: CRDT-style Soft-State Sync

### Core idea

Every row already has `created_at` and `updated_at` timestamps. We add a globally unique `uuid` column to each entity table (tasks, projects, goals, reminders). The sync layer:

1. **Exports** changed rows (since last sync) to a JSON changeset file
2. **Pushes** that file to the sync backend (iCloud Drive folder initially)
3. **Pulls** changeset files from other devices
4. **Merges** using last-write-wins on `updated_at` per field, with tombstones for deletes

This gives you safe, conflict-resilient syncing without risking database corruption.

### Why last-write-wins per field (recommended)

- Pure last-write-wins per row is simple but loses edits (e.g., you change a title on device A and a due date on device B -- one gets dropped)
- Full CRDT merge is very complex for this use case
- **Per-field last-write-wins** is the sweet spot: each field carries its own `updated_at`, so independent edits to different fields on different devices both survive. Only truly conflicting edits to the *same* field use the latest timestamp. This is the same strategy Todoist and similar apps use.

## Schema Changes

### New migration: `006_sync.sql`

Add to each entity table:
- `uuid TEXT UNIQUE` -- globally unique ID for cross-device identity (generated via `crypto.randomUUID()`)
- Backfill existing rows with generated UUIDs

Add a new `sync_meta` table:

```sql
CREATE TABLE IF NOT EXISTS sync_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

This stores: `device_id`, `last_sync_at`, `last_push_at`.

Add a new `sync_changelog` table:

```sql
CREATE TABLE IF NOT EXISTS sync_changelog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,  -- 'task', 'project', 'goal', 'reminder'
  entity_uuid TEXT NOT NULL,
  field_name TEXT NOT NULL,   -- '*' for creates/deletes, field name for updates
  new_value TEXT,
  updated_at TEXT NOT NULL,
  device_id TEXT NOT NULL,
  synced INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_sync_changelog_synced ON sync_changelog(synced);
```

### Schema guard

Add `ensureSyncSchema(db)` in `src/server/db/client.ts` following the existing pattern.

## New Files

### `src/server/sync/types.ts`

```typescript
interface SyncBackend {
  push(deviceId: string, changeset: Changeset): Promise<void>
  pull(deviceId: string, since: string): Promise<Changeset[]>
  listDevices(): Promise<string[]>
}

interface Changeset {
  deviceId: string
  timestamp: string
  changes: FieldChange[]
}

interface FieldChange {
  entityType: 'task' | 'project' | 'goal' | 'reminder'
  entityUuid: string
  field: string       // '*' = create/delete, otherwise field name
  value: string | null
  updatedAt: string
}
```

### `src/server/sync/changelog.ts`

A `trackChange(db, entityType, entityUuid, field, value, updatedAt, deviceId)` function repos call after each mutation.

### `src/server/sync/engine.ts`

- `pushChanges(db, backend)` -- reads unsynced changelog entries, bundles into a Changeset, calls `backend.push()`, marks as synced
- `pullAndMerge(db, backend)` -- calls `backend.pull()`, applies per-field last-write-wins
- `fullSync(db, backend)` -- push then pull

### `src/server/sync/backends/icloud.ts`

Uses `~/Library/Mobile Documents/com~apple~CloudDocs/finish-em-sync/` as the sync folder:
- Each device writes changesets as `{deviceId}/{timestamp}.json`
- Pull reads all other devices' files newer than `last_sync_at`

### `src/server/sync/sync-service.ts`

- Initializes device ID on first run
- `startAutoSync(interval)` for periodic background sync (default 30s)
- `syncNow()` for manual trigger
- Emits events for TUI sync status

## Repo Integration

Each repo calls `trackChange()` after mutations:
- `src/server/repos/tasks.ts` -- `createTask`, `updateTask`, `deleteTask`, `completeTask`
- `src/server/repos/projects.ts` -- `createProject`, `updateProject`, `deleteProject`
- Goals and reminders repos similarly

## CLI / TUI Integration

- `finish-em sync` subcommand: `status`, `now`, `enable`, `disable`
- Sync status indicator in the TUI header
- Auto-sync runs in background when enabled

## Settings (in `sync_meta`)

- `sync_enabled` (boolean)
- `sync_backend` ('icloud' initially)
- `sync_interval_ms` (default: 30000)
- `sync_path` (override for testing)

## Test Strategy

- Unit tests for merge logic (most critical)
- Unit tests for changelog tracking
- Integration test: two in-memory DBs as two devices, bidirectional sync
- Integration test: conflict scenarios

## Future Backend Extensibility

The `SyncBackend` interface makes it straightforward to add:
- **Dropbox/Google Drive** -- same file-based pattern, different path
- **S3/R2** -- object storage
- **Custom server** -- HTTP API
- **Git** -- changesets in a git repo
