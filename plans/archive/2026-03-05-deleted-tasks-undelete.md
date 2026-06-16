# Deleted Tasks Undelete

_Archived change: `2026-03-05-deleted-tasks-undelete`_

## Summary

Deleted tasks are currently permanently removed with no way to recover them. Adding soft-delete support gives users a safety net — they can browse deleted tasks and restore any task they deleted by mistake using the `u` hotkey.

## Scope

- Add `deleted_at` column to the `tasks` table (soft-delete instead of hard-delete)
- Tasks with `deleted_at` set are excluded from all existing list queries
- New "Deleted" view in the sidebar showing soft-deleted tasks
- New `u` keybinding to undelete (restore) the selected task from the Deleted view
- `d` key now soft-deletes (sets `deleted_at`) instead of hard-deleting
- New `api.listDeletedTasks()` and `api.undeleteTask()` API client methods
- Sidebar and view counts include a "Deleted" entry with count badge
- Convert hard-delete to soft-delete by adding `deleted_at TEXT` column to tasks
- Add a "Deleted" view in the sidebar showing soft-deleted tasks
- Add `u` keybinding to restore a selected deleted task
- Preserve all existing queries by excluding soft-deleted tasks automatically
- Support cascading soft-delete: deleting a parent task soft-deletes its subtasks too
- Permanent purge UI (no "empty trash" feature in this change)
- Soft-delete for projects or reminders
- Automatic expiry / retention policy for deleted tasks
- Undo stack / ctrl-z style undo
- Impact: **Database**: Migration needed to add `deleted_at TEXT` column to `tasks` table
- Impact: **`src/server/db/schema.ts`**: Add `deleted_at` column
- Impact: **`src/server/db/migrations/`**: New migration file
- Impact: **`src/server/repos/tasks.ts`**: `deleteTask` sets `deleted_at` instead of `DELETE`; new `listDeletedTasks` and `undeleteTask` functions; all existing `listTasks` queries exclude `deleted_at IS NOT NULL`
- Impact: **`src/server/types.ts`**: Add `deletedAt: string | null` to `Task` type; add `"deleted"` to `TaskStatus` or keep as separate field
- Impact: **`src/tui/api-client.ts`**: Add `listDeletedTasks` and `undeleteTask` methods
- Impact: **`src/tui/hooks/useNavigation.ts`**: Add `"deleted"` to `View` union
- Impact: **`src/tui/hooks/useAppData.ts`**: Handle `"deleted"` view; include deleted count in `viewCounts`
- Impact: **`src/tui/hooks/useTaskActions.ts`**: Add `undeleteSelectedTask` action
- Impact: **`src/tui/hooks/useMainKeys.ts`**: Add `u` keybinding for undelete when in deleted view
- Impact: **`src/tui/Sidebar.tsx`**: Add "Deleted" nav item
- Impact: **`src/tui/HelpModal.tsx`**: Document `u` keybinding
- Related capabilities: `tui-deleted-tasks-view`, `tui-task-metadata-entry`

## Notes

- Decision 1: Soft-delete via `deleted_at` column (not a status value): **Chosen:** Add `deleted_at TEXT` to the tasks table. NULL = not deleted, ISO timestamp = deleted.
- Decision 2: Cascade soft-delete to subtasks in the repo layer: **Chosen:** When soft-deleting a task, also set `deleted_at` on all direct children in the same operation.
- Decision 3: Restore moves task back to its original project: **Chosen:** `undeleteTask` simply clears `deleted_at` and `deleted_at` on any soft-deleted subtasks. The task returns to its original project/state.
- Decision 4: Deleted view shows all deleted tasks, sorted by `deleted_at DESC`: **Chosen:** Simple flat list of all soft-deleted tasks (both root tasks and subtasks), newest-deleted first.
- Decision 5: `u` keybinding only active in "deleted" view: **Chosen:** `u` triggers undelete only when `view === "deleted"`. In other views, `u` is a no-op (or available for future use).
- **Deleted tasks accumulate forever** → Mitigation: Out of scope for this change; a future purge feature can be added. The deleted view count badge signals to users when trash is accumulating.
- **Subtask restoration complexity** → If a subtask's parent was also deleted, restoring just the subtask leaves it orphaned under a deleted parent. Mitigation: When undeleting a subtask, also undelete its parent (chain up). This is handled in `undeleteTask`.
- **Count badge noise** → The sidebar "Deleted [N]" count could grow large. Mitigation: Acceptable UX tradeoff; users can visit the view and clean up.
- **Migration on existing databases** → Adding a nullable column with `ALTER TABLE` is backward compatible in SQLite.
- Open questions: - Should restoring a task that belonged to a now-deleted project navigate the user somewhere? (For now: just restore and stay in deleted view; the task will appear in "inbox" or its project view if the project exists.)

## Implementation Phases

1. Database Migration
   - [done] Create `src/server/db/migrations/004_soft_delete_tasks.sql` with `ALTER TABLE tasks ADD COLUMN deleted_at TEXT` and an index on `deleted_at`
   - [done] Verify the migration runner in `src/server/db/client.ts` picks up and applies the new migration on startup
2. Server Types & Repo Layer
   - [done] Add `deletedAt: string | null` field to the `Task` type in `src/server/types.ts`
   - [done] Update `mapTaskRow` mapper in `src/server/repos/mappers.ts` to include `deletedAt`
   - [done] Add `deleted_at IS NULL` filter to `buildFilterClause` in `src/server/repos/tasks.ts` so all existing `listTasks` queries exclude soft-deleted tasks
   - [done] Update `deleteTask` in `src/server/repos/tasks.ts` to soft-delete: set `deleted_at = NOW()` on the task and all its subtasks (cascade via UPDATE with `parent_task_id = ?`)
   - [done] Add `listDeletedTasks(): Task[]` function to `src/server/repos/tasks.ts` returning tasks WHERE `deleted_at IS NOT NULL`, ordered by `deleted_at DESC`
   - [done] Add `undeleteTask(taskId: number): Task | null` function that clears `deleted_at` on the task, its soft-deleted subtasks, and (if it is a subtask) its soft-deleted parent
3. API Routes & Client
   - [done] Add `GET /tasks/deleted` route (or extend existing tasks route with `?deleted=true` param) in the server API layer
   - [done] Add `POST /tasks/:id/undelete` route to the server API layer
   - [done] Add `listDeletedTasks(): Promise<Task[]>` to the `ApiClient` type in `src/tui/api-client.ts`
   - [done] Add `undeleteTask(taskId: number): Promise<Task>` to the `ApiClient` type in `src/tui/api-client.ts`
   - [done] Implement both methods in the concrete API client (HTTP client or local client, whichever is used)
4. Navigation & Data Layer
   - [done] Add `"deleted"` to the `View` union type in `src/tui/hooks/useNavigation.ts`
   - [done] Handle `view === "deleted"` in `useAppData` (`src/tui/hooks/useAppData.ts`): call `api.listDeletedTasks()`, set tasks and status text
   - [done] Add `deleted` count to `ViewCounts` in `useAppData` and fetch count alongside other view counts
   - [done] Update `EMPTY_VIEW_COUNTS` to include `deleted: 0`
5. Task Actions
   - [done] Add `undeleteSelectedTask(): Promise<void>` to `useTaskActions` (`src/tui/hooks/useTaskActions.ts`) that calls `api.undeleteTask`, shows toast "Task restored", and reloads data
   - [done] Wire `undeleteSelectedTask` through `App.tsx` to `useKeybindings` (add to params list)
6. Keybinding
   - [done] Add `undeleteSelectedTask` to the `UseMainKeysParams` type in `src/tui/hooks/useMainKeys.ts`
   - [done] Add `u` key handler in `useMainKeys`: call `undeleteSelectedTask()` only when `view === "deleted"` and a task is selected
   - [done] Add `undeleteSelectedTask` to `useKeybindings` params and pass through in `src/tui/hooks/useKeybindings.ts`
7. Sidebar
   - [done] Add `"deleted"` to the `NavItem` `view` union and `countKey` union in `src/tui/Sidebar.tsx`
   - [done] Add a "Deleted" `NavItem` to `NAV_ITEMS` in `src/tui/Sidebar.tsx` with `countKey: "deleted"`
   - [done] Update `SidebarProps` `viewCounts` type to include `deleted?: number`
8. Help Modal
   - [done] Add `u Restore deleted task (Deleted view)` entry to the keybindings section in `src/tui/HelpModal.tsx`
9. Tests
   - [done] Add unit tests for `deleteTask` soft-delete behavior (task and subtask cascade) in the repo test file
   - [done] Add unit tests for `listDeletedTasks` and `undeleteTask` in the repo test file
   - [done] Add/update TUI keybinding tests for `d` (soft-delete) and `u` (undelete in deleted view) in `src/tui/App.keybindings.test.ts`
   - [done] Add unit tests for `undeleteSelectedTask` action in task actions test coverage
