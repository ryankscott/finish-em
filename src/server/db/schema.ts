export const SCHEMA_STATEMENTS = [
	`
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    timezone TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`,
	`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    emoji TEXT,
    description TEXT NOT NULL DEFAULT '',
    start_at TEXT,
    end_at TEXT,
    color TEXT NOT NULL DEFAULT '#ef4444',
    is_inbox INTEGER NOT NULL DEFAULT 0,
    jira_discovery_url TEXT,
    jira_delivery_url TEXT,
    confluence_url TEXT,
    jira_discovery_status TEXT,
    jira_docs_url TEXT,
    jira_docs_status TEXT,
    jira_delivery_status TEXT,
    jira_release_note_url TEXT,
    jira_release_note_status TEXT,
    teams_release_note_url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`,
	`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    completed_at TEXT,
    blocked_at TEXT,
    blocked_reason TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY(parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
  )
`,
	`
  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    remind_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    snoozed_until TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
  )
`,
	`
  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period_type TEXT NOT NULL,
    period_start TEXT NOT NULL,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`,
	"CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id)",
	"CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at)",
	"CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)",
	"CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id)",
	"CREATE INDEX IF NOT EXISTS idx_reminders_task_id ON reminders(task_id)",
	"CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(remind_at)",
	"CREATE INDEX IF NOT EXISTS idx_goals_period ON goals(period_type, period_start)",
	`
  CREATE TABLE IF NOT EXISTS sync_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`,
	`
  CREATE TABLE IF NOT EXISTS sync_changelog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_uuid TEXT NOT NULL,
    field_name TEXT NOT NULL,
    new_value TEXT,
    updated_at TEXT NOT NULL,
    device_id TEXT NOT NULL,
    synced INTEGER NOT NULL DEFAULT 0
  )
`,
	"CREATE INDEX IF NOT EXISTS idx_sync_changelog_synced ON sync_changelog(synced)",
	"CREATE INDEX IF NOT EXISTS idx_sync_changelog_entity ON sync_changelog(entity_type, entity_uuid)",
];
