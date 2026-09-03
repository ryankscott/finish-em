-- Indexes matched to clauses that actually run, not speculative coverage.
--
-- tasks already carries 8 indexes from 0001_init.sql, so every task INSERT
-- writes 9 rows. D1 bills index rows, so each addition has a cost -- only the
-- clauses below earn one.
--
-- Deliberately absent: a composite for listTasks' full
--   ORDER BY status, due_at IS NULL, due_at, priority, created_at DESC
-- It would need an expression index on (due_at IS NULL) plus mixed collation,
-- and the planner is unlikely to prefer it over a temp b-tree sort at a few
-- hundred rows. Revisit around 10k tasks.
--
-- Also absent: an index on calendar_events.last_seen_at. The calendar sync now
-- diffs the cache instead of stamping last_seen_at and pruning by it, so that
-- column is no longer written or read. It stays in the schema because dropping
-- a column needs a SQLite table rebuild, which is not worth the risk for one
-- dead column.

-- The dominant read path: every open-task view filters
-- status = 'open' AND someday = 0 AND deleted_at IS NULL (see
-- buildFilterClause in src/server/repos/tasks.ts). Partial on deleted_at keeps
-- the index to live rows only.
CREATE INDEX idx_tasks_open_due
  ON tasks(status, someday, due_at)
  WHERE deleted_at IS NULL;

-- listDeletedTasks: WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC, id
-- DESC. The id tiebreak is load-bearing: deleting a batch of tasks stamps them
-- all with the same millisecond.
-- Partial + DESC serves both halves; the existing idx_tasks_deleted_at also
-- indexes the NULLs it will never seek.
CREATE INDEX idx_tasks_deleted_at_desc
  ON tasks(deleted_at DESC, id DESC)
  WHERE deleted_at IS NOT NULL;

-- Both reminder list queries filter on status and order by the COALESCE.
CREATE INDEX idx_reminders_due
  ON reminders(COALESCE(snoozed_until, remind_at))
  WHERE status IN ('pending', 'snoozed');

-- repinLinkedTaskDueDates runs a correlated SELECT MIN(c.start_at) keyed on
-- c.uid once per calendar-linked task, after every sync. This makes it an
-- index-only minimum lookup.
CREATE INDEX idx_calendar_events_uid_start
  ON calendar_events(uid, start_at);
