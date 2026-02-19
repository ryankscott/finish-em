export const SCHEMA_STATEMENTS = [
  `
  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    timezone TEXT NOT NULL,
    ai_base_url TEXT,
    ai_model TEXT,
    ai_api_key TEXT,
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
  `
  CREATE TABLE IF NOT EXISTS assistant_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    surface TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    actions_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`,
  'CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id)',
  'CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at)',
  'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
  'CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id)',
  'CREATE INDEX IF NOT EXISTS idx_reminders_task_id ON reminders(task_id)',
  'CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(remind_at)',
  'CREATE INDEX IF NOT EXISTS idx_goals_period ON goals(period_type, period_start)',
  'CREATE INDEX IF NOT EXISTS idx_assistant_messages_surface_created_at ON assistant_messages(surface, created_at)',
]
