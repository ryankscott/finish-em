-- Web Push (iPhone home-screen app, desktop browsers). One row per browser
-- install. Endpoints the push service reports as gone (404/410) are deleted.
CREATE TABLE push_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TEXT NOT NULL,
  last_success_at TEXT
);

-- pushed_at is separate from fired_at: an open tab can deliver a reminder
-- (fired_at) before the cron runs, and the phone must still get its push.
ALTER TABLE reminders ADD COLUMN pushed_at TEXT;

-- Everything delivered before push existed counts as pushed, so subscribing
-- does not replay old reminders.
UPDATE reminders SET pushed_at = fired_at WHERE fired_at IS NOT NULL;

-- The every-minute cron reads this.
CREATE INDEX idx_reminders_push_due ON reminders(pushed_at, status);
