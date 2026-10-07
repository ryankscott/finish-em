-- fired_at records when a reminder was first delivered, so a delivered
-- reminder is not delivered again on every reload or on every device. A
-- reminder with status 'fired' stays "missed" until it is completed, snoozed
-- or dismissed.
ALTER TABLE reminders ADD COLUMN fired_at TEXT;

-- Reminders that were due before this column existed have already been shown
-- (as toasts). Mark them fired so they appear as missed instead of raising a
-- burst of notifications on first load.
UPDATE reminders
SET status = 'fired',
    fired_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE status IN ('pending', 'snoozed')
  AND COALESCE(snoozed_until, remind_at) <= strftime('%Y-%m-%dT%H:%M:%fZ', 'now');
