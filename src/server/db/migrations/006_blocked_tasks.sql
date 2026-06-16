ALTER TABLE tasks ADD COLUMN blocked_at TEXT;
ALTER TABLE tasks ADD COLUMN blocked_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_tasks_blocked_at ON tasks(blocked_at);
