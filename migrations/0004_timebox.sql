-- Time estimates and timeboxing.
--
-- `estimate_minutes` is the intended size of a task, not tracked time. NULL
-- means "never estimated". The UI shows a dim 30m default and still counts it
-- in the day's capacity -- treating unestimated work as free is how a day gets
-- overcommitted, which is the whole problem this migration exists to fix.
--
-- `planned_start_at` is a full ISO instant: the slot the task was dragged onto.
-- Deliberately NOT folded into `scheduled_at`, which stays a day key --
-- planDay() re-reads the plan with `scheduled_at = ?` equality, so a wall-clock
-- time there would make that read return nothing, and committing to a day must
-- stay possible without committing to a time. The day a block belongs to is
-- derived from planned_start_at itself, so the only invariant is:
-- scheduled_at IS NULL implies planned_start_at IS NULL.
--
-- One block per task, height derived from the estimate. No block table, for the
-- same reason 0003 has no session table: multiple sessions per task is out of
-- scope, and a table would add a join to every planning query for no present
-- capability.
--
-- Blocks live here, never in the ICS cache. That feed is read-only input.

ALTER TABLE tasks ADD COLUMN estimate_minutes INTEGER;
ALTER TABLE tasks ADD COLUMN planned_start_at TEXT;

CREATE INDEX idx_tasks_planned_start_at ON tasks(planned_start_at);
