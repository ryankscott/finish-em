ALTER TABLE tasks ADD COLUMN deleted_at TEXT;

CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks(deleted_at);
