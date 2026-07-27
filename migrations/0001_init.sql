-- finish-em initial D1 schema.
--
-- This is the flattened, current-state schema: the equivalent of the old
-- src/server/db/schema.ts SCHEMA_STATEMENTS *after* all 14 ensure*Schema
-- guards in src/server/db/client.ts had run. The guards existed to upgrade
-- long-lived local SQLite files in place, using PRAGMA table_info and
-- sqlite_master introspection that D1 does not support. A fresh D1 database
-- has no history to upgrade, so the guards are replaced by this one file
-- rather than replayed as ~10 historical steps.
--
-- Deliberately NOT carried over from the legacy local database:
--   sync_meta, sync_changelog      removed sync layer (commit 7322936)
--   assistant_messages             0 rows, 0 code references
--   schema_migrations              wrangler tracks migrations itself
--   settings.ai_provider/ai_base_url/ai_model/ai_api_key
--                                  0 code references
--   tasks.blocked_at/blocked_reason
--                                  all NULL; only ever referenced by the
--                                  migration that added them
--
-- The uuid columns ARE kept. They are populated on every existing row and
-- are written on task/goal creation (repos/tasks.ts, repos/goals.ts) and read
-- by repinLinkedTaskDueDates, so they are live, not vestigial.

CREATE TABLE settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  timezone TEXT NOT NULL,
  calendar_ics_url TEXT,
  calendar_last_synced_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  name TEXT NOT NULL,
  emoji TEXT,
  description TEXT NOT NULL DEFAULT '',
  start_at TEXT,
  end_at TEXT,
  color TEXT NOT NULL DEFAULT '#ef4444',
  is_inbox INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  jira_discovery_url TEXT,
  jira_delivery_url TEXT,
  jira_docs_url TEXT,
  jira_release_note_url TEXT,
  teams_release_note_url TEXT,
  confluence_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  project_id INTEGER NOT NULL,
  parent_task_id INTEGER,
  title TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  priority INTEGER NOT NULL DEFAULT 4,
  scheduled_at TEXT,
  due_at TEXT,
  due_timezone TEXT,
  recurrence_preset TEXT,
  recurrence_rrule TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  someday INTEGER NOT NULL DEFAULT 0,
  calendar_event_uid TEXT,
  completed_at TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY(parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  task_id INTEGER NOT NULL,
  remind_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  snoozed_until TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  period_type TEXT NOT NULL,
  period_start TEXT NOT NULL,
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE calendar_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT NOT NULL,
  recurrence_id TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  start_at TEXT NOT NULL,
  end_at TEXT,
  all_day INTEGER NOT NULL DEFAULT 0,
  location TEXT,
  organizer TEXT,
  last_seen_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE project_resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE task_completion_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  completed_at TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_due_at ON tasks(due_at);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at);
CREATE INDEX idx_tasks_updated_at ON tasks(updated_at);
CREATE INDEX idx_tasks_calendar_event_uid ON tasks(calendar_event_uid);
CREATE UNIQUE INDEX idx_tasks_uuid ON tasks(uuid) WHERE uuid IS NOT NULL;

CREATE INDEX idx_reminders_task_id ON reminders(task_id);
CREATE INDEX idx_reminders_remind_at ON reminders(remind_at);
CREATE UNIQUE INDEX idx_reminders_uuid ON reminders(uuid) WHERE uuid IS NOT NULL;

CREATE INDEX idx_goals_period ON goals(period_type, period_start);
CREATE UNIQUE INDEX idx_goals_uuid ON goals(uuid) WHERE uuid IS NOT NULL;

CREATE UNIQUE INDEX idx_projects_uuid ON projects(uuid) WHERE uuid IS NOT NULL;

CREATE UNIQUE INDEX idx_calendar_events_uid ON calendar_events(uid, recurrence_id);
CREATE INDEX idx_calendar_events_start_at ON calendar_events(start_at);

CREATE INDEX idx_project_resources_project ON project_resources(project_id, sort_order);

CREATE INDEX idx_task_completion_log_task_date ON task_completion_log(task_id, completed_at);
CREATE INDEX idx_task_completion_log_completed_at ON task_completion_log(completed_at);
