-- Day plan and focus.
--
-- `scheduled_at` becomes the commitment ("I am doing this on this day") while
-- `due_at` stays the deadline. Before this migration `scheduled_at` was written
-- by quick-add and shown on the row, but no query filter ever read it.
--
-- `plan_order` ranks the tasks committed to a day. It is only meaningful for
-- rows with a `scheduled_at`; planDay() assigns 1..n, everything else keeps 0.
-- Note the shared ORDER BY in listTasks() deliberately does NOT use it -- the
-- default of 0 would sort every unplanned task ahead of every planned one.
--
-- `started_at` is the focus marker: "now" is the single open task with a
-- non-null value, and elapsed time is derived from it. Deliberately not a
-- session table -- accumulated time tracking is out of scope.

ALTER TABLE tasks ADD COLUMN plan_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tasks ADD COLUMN started_at TEXT;

CREATE INDEX idx_tasks_scheduled_at ON tasks(scheduled_at);

CREATE TABLE day_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day TEXT NOT NULL UNIQUE,
  planned_at TEXT,
  closed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
