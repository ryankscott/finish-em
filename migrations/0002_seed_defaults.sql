-- Replaces seedDefaults() from src/server/db/client.ts.
--
-- The timezone is hardcoded rather than derived. The old code used
--   Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
-- which resolves to the host's zone on a Mac (Pacific/Auckland) but to UTC on
-- Cloudflare workerd, because a Worker has no host timezone. Every "today",
-- "overdue", and digest boundary in the app is computed against this value, so
-- letting it silently become UTC would shift all of them by up to 13 hours.
-- It stays editable at runtime via PATCH /api/settings.
--
-- INSERT OR IGNORE so re-running against a database that already has rows (for
-- example the production import in Phase 5) is a no-op rather than a conflict.

INSERT OR IGNORE INTO settings (id, timezone, created_at, updated_at)
VALUES (
  1,
  'Pacific/Auckland',
  '2026-07-27T00:00:00.000Z',
  '2026-07-27T00:00:00.000Z'
);

INSERT OR IGNORE INTO projects (id, name, color, is_inbox, sort_order, created_at, updated_at)
VALUES (
  1,
  'Inbox',
  '#ef4444',
  1,
  0,
  '2026-07-27T00:00:00.000Z',
  '2026-07-27T00:00:00.000Z'
);
