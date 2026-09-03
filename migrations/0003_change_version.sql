-- Single-row counter bumped on every write, so clients can poll one integer
-- instead of re-reading every table on a timer.
--
-- Before this, src/web/main.tsx set refetchInterval: 30_000 as a global React
-- Query default, so all ~9 queries mounted on a screen re-read their tables
-- every 30 seconds whether or not anything had changed (~1.3M D1 rows read per
-- day per open client). Clients now poll GET /api/changes and only refetch data
-- when this version moves.
--
-- A counter rather than MAX(updated_at) across tables for two reasons: this is
-- a single integer-PK lookup (always exactly one row read), and it catches hard
-- deletes. projects, goals, reminders and project_resources are hard-deleted,
-- so a max-timestamp scheme would never notice a deleted row.
--
-- INSERT OR IGNORE so re-running against a database that already has the row is
-- a no-op rather than a conflict, matching 0002_seed_defaults.sql.

CREATE TABLE change_version (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  version INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO change_version (id, version, updated_at)
VALUES (1, 1, '2026-09-03T00:00:00.000Z');
