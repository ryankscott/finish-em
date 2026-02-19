ALTER TABLE settings ADD COLUMN ai_base_url TEXT;
ALTER TABLE settings ADD COLUMN ai_model TEXT;
ALTER TABLE settings ADD COLUMN ai_api_key TEXT;

CREATE TABLE IF NOT EXISTS assistant_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  surface TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  actions_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_assistant_messages_surface_created_at
  ON assistant_messages(surface, created_at);
