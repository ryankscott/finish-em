## Context

Tasks are currently hard-deleted via `DELETE FROM tasks WHERE id = ?` in `src/server/repos/tasks.ts`. There is no recovery path. The TUI has a `d` keybinding that calls `deleteSelectedTask`, which permanently removes the task and its children (via `ON DELETE CASCADE`). Users have no way to undo accidental deletions.

The app uses a SQLite database accessed via a custom repo layer (no ORM for mutations). Navigation is managed via a `View` union type (`"inbox" | "today" | "upcoming" | "completed" | "project" | "settings"`). The sidebar is built from a static `NAV_ITEMS` array plus projects.

## Goals / Non-Goals

**Goals:**
- Convert hard-delete to soft-delete by adding `deleted_at TEXT` column to tasks
- Add a "Deleted" view in the sidebar showing soft-deleted tasks
- Add `u` keybinding to restore a selected deleted task
- Preserve all existing queries by excluding soft-deleted tasks automatically
- Support cascading soft-delete: deleting a parent task soft-deletes its subtasks too

**Non-Goals:**
- Permanent purge UI (no "empty trash" feature in this change)
- Soft-delete for projects or reminders
- Automatic expiry / retention policy for deleted tasks
- Undo stack / ctrl-z style undo

## Decisions

### Decision 1: Soft-delete via `deleted_at` column (not a status value)

**Chosen:** Add `deleted_at TEXT` to the tasks table. NULL = not deleted, ISO timestamp = deleted.

**Alternative considered:** Add `"deleted"` to the `status` column enum.

**Rationale:** The `status` field (`open`/`completed`) is used throughout filter queries and business logic. Mixing deletion state into status would require touching many more query clauses and break the semantic meaning. A separate `deleted_at` column is a standard soft-delete pattern, keeps concerns separate, and is easy to filter with `WHERE deleted_at IS NULL` added to all existing queries.

### Decision 2: Cascade soft-delete to subtasks in the repo layer

**Chosen:** When soft-deleting a task, also set `deleted_at` on all direct children in the same operation.

**Alternative considered:** Rely on `ON DELETE CASCADE` (only works for hard deletes).

**Rationale:** `ON DELETE CASCADE` won't fire on UPDATE. We need explicit cascade in `deleteTask()`. This is simple since tasks only support one level of nesting (subtasks cannot themselves have children, per existing validation).

### Decision 3: Restore moves task back to its original project

**Chosen:** `undeleteTask` simply clears `deleted_at` and `deleted_at` on any soft-deleted subtasks. The task returns to its original project/state.

**Alternative considered:** Prompt user to choose a project on restore.

**Rationale:** All task metadata (projectId, title, etc.) is preserved during soft-delete. Restoring to original location is the least-surprise behavior.

### Decision 4: Deleted view shows all deleted tasks, sorted by `deleted_at DESC`

**Chosen:** Simple flat list of all soft-deleted tasks (both root tasks and subtasks), newest-deleted first.

**Alternative considered:** Only show root tasks in deleted view (suppress subtasks).

**Rationale:** A subtask may be deleted independently. Showing all deleted tasks gives complete visibility. Displaying newest-deleted first helps users find recently-deleted tasks quickly.

### Decision 5: `u` keybinding only active in "deleted" view

**Chosen:** `u` triggers undelete only when `view === "deleted"`. In other views, `u` is a no-op (or available for future use).

**Rationale:** Avoids ambiguity. The deleted view is the natural context for restore. Keeps keybinding surface small.

## Risks / Trade-offs

- **Deleted tasks accumulate forever** → Mitigation: Out of scope for this change; a future purge feature can be added. The deleted view count badge signals to users when trash is accumulating.
- **Subtask restoration complexity** → If a subtask's parent was also deleted, restoring just the subtask leaves it orphaned under a deleted parent. Mitigation: When undeleting a subtask, also undelete its parent (chain up). This is handled in `undeleteTask`.
- **Count badge noise** → The sidebar "Deleted [N]" count could grow large. Mitigation: Acceptable UX tradeoff; users can visit the view and clean up.
- **Migration on existing databases** → Adding a nullable column with `ALTER TABLE` is backward compatible in SQLite.

## Migration Plan

1. Add migration `004_soft_delete_tasks.sql`:
   ```sql
   ALTER TABLE tasks ADD COLUMN deleted_at TEXT;
   CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks(deleted_at);
   ```
2. The migration runner in `src/server/db/client.ts` applies migrations in order on startup — no manual steps needed.
3. **Rollback**: No schema rollback available in SQLite (columns cannot be dropped). If rolled back, `deleted_at` stays as an ignored column. The hard-delete code path can be restored in the repo layer without affecting existing data.

## Open Questions

- Should restoring a task that belonged to a now-deleted project navigate the user somewhere? (For now: just restore and stay in deleted view; the task will appear in "inbox" or its project view if the project exists.)
