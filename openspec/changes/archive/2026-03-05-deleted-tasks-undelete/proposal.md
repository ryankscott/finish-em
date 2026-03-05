## Why

Deleted tasks are currently permanently removed with no way to recover them. Adding soft-delete support gives users a safety net — they can browse deleted tasks and restore any task they deleted by mistake using the `u` hotkey.

## What Changes

- Add `deleted_at` column to the `tasks` table (soft-delete instead of hard-delete)
- Tasks with `deleted_at` set are excluded from all existing list queries
- New "Deleted" view in the sidebar showing soft-deleted tasks
- New `u` keybinding to undelete (restore) the selected task from the Deleted view
- `d` key now soft-deletes (sets `deleted_at`) instead of hard-deleting
- New `api.listDeletedTasks()` and `api.undeleteTask()` API client methods
- Sidebar and view counts include a "Deleted" entry with count badge

## Capabilities

### New Capabilities
- `tui-deleted-tasks-view`: A new sidebar view showing soft-deleted tasks with the ability to restore them via `u` hotkey

### Modified Capabilities
- `tui-task-metadata-entry`: Delete key (`d`) now performs a soft-delete; new `u` keybinding performs undelete in the deleted view

## Impact

- **Database**: Migration needed to add `deleted_at TEXT` column to `tasks` table
- **`src/server/db/schema.ts`**: Add `deleted_at` column
- **`src/server/db/migrations/`**: New migration file
- **`src/server/repos/tasks.ts`**: `deleteTask` sets `deleted_at` instead of `DELETE`; new `listDeletedTasks` and `undeleteTask` functions; all existing `listTasks` queries exclude `deleted_at IS NOT NULL`
- **`src/server/types.ts`**: Add `deletedAt: string | null` to `Task` type; add `"deleted"` to `TaskStatus` or keep as separate field
- **`src/tui/api-client.ts`**: Add `listDeletedTasks` and `undeleteTask` methods
- **`src/tui/hooks/useNavigation.ts`**: Add `"deleted"` to `View` union
- **`src/tui/hooks/useAppData.ts`**: Handle `"deleted"` view; include deleted count in `viewCounts`
- **`src/tui/hooks/useTaskActions.ts`**: Add `undeleteSelectedTask` action
- **`src/tui/hooks/useMainKeys.ts`**: Add `u` keybinding for undelete when in deleted view
- **`src/tui/Sidebar.tsx`**: Add "Deleted" nav item
- **`src/tui/HelpModal.tsx`**: Document `u` keybinding
