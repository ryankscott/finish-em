## 1. Database Migration

- [x] 1.1 Create `src/server/db/migrations/004_soft_delete_tasks.sql` with `ALTER TABLE tasks ADD COLUMN deleted_at TEXT` and an index on `deleted_at`
- [x] 1.2 Verify the migration runner in `src/server/db/client.ts` picks up and applies the new migration on startup

## 2. Server Types & Repo Layer

- [x] 2.1 Add `deletedAt: string | null` field to the `Task` type in `src/server/types.ts`
- [x] 2.2 Update `mapTaskRow` mapper in `src/server/repos/mappers.ts` to include `deletedAt`
- [x] 2.3 Add `deleted_at IS NULL` filter to `buildFilterClause` in `src/server/repos/tasks.ts` so all existing `listTasks` queries exclude soft-deleted tasks
- [x] 2.4 Update `deleteTask` in `src/server/repos/tasks.ts` to soft-delete: set `deleted_at = NOW()` on the task and all its subtasks (cascade via UPDATE with `parent_task_id = ?`)
- [x] 2.5 Add `listDeletedTasks(): Task[]` function to `src/server/repos/tasks.ts` returning tasks WHERE `deleted_at IS NOT NULL`, ordered by `deleted_at DESC`
- [x] 2.6 Add `undeleteTask(taskId: number): Task | null` function that clears `deleted_at` on the task, its soft-deleted subtasks, and (if it is a subtask) its soft-deleted parent

## 3. API Routes & Client

- [x] 3.1 Add `GET /tasks/deleted` route (or extend existing tasks route with `?deleted=true` param) in the server API layer
- [x] 3.2 Add `POST /tasks/:id/undelete` route to the server API layer
- [x] 3.3 Add `listDeletedTasks(): Promise<Task[]>` to the `ApiClient` type in `src/tui/api-client.ts`
- [x] 3.4 Add `undeleteTask(taskId: number): Promise<Task>` to the `ApiClient` type in `src/tui/api-client.ts`
- [x] 3.5 Implement both methods in the concrete API client (HTTP client or local client, whichever is used)

## 4. Navigation & Data Layer

- [x] 4.1 Add `"deleted"` to the `View` union type in `src/tui/hooks/useNavigation.ts`
- [x] 4.2 Handle `view === "deleted"` in `useAppData` (`src/tui/hooks/useAppData.ts`): call `api.listDeletedTasks()`, set tasks and status text
- [x] 4.3 Add `deleted` count to `ViewCounts` in `useAppData` and fetch count alongside other view counts
- [x] 4.4 Update `EMPTY_VIEW_COUNTS` to include `deleted: 0`

## 5. Task Actions

- [x] 5.1 Add `undeleteSelectedTask(): Promise<void>` to `useTaskActions` (`src/tui/hooks/useTaskActions.ts`) that calls `api.undeleteTask`, shows toast "Task restored", and reloads data
- [x] 5.2 Wire `undeleteSelectedTask` through `App.tsx` to `useKeybindings` (add to params list)

## 6. Keybinding

- [x] 6.1 Add `undeleteSelectedTask` to the `UseMainKeysParams` type in `src/tui/hooks/useMainKeys.ts`
- [x] 6.2 Add `u` key handler in `useMainKeys`: call `undeleteSelectedTask()` only when `view === "deleted"` and a task is selected
- [x] 6.3 Add `undeleteSelectedTask` to `useKeybindings` params and pass through in `src/tui/hooks/useKeybindings.ts`

## 7. Sidebar

- [x] 7.1 Add `"deleted"` to the `NavItem` `view` union and `countKey` union in `src/tui/Sidebar.tsx`
- [x] 7.2 Add a "Deleted" `NavItem` to `NAV_ITEMS` in `src/tui/Sidebar.tsx` with `countKey: "deleted"`
- [x] 7.3 Update `SidebarProps` `viewCounts` type to include `deleted?: number`

## 8. Help Modal

- [x] 8.1 Add `u  Restore deleted task (Deleted view)` entry to the keybindings section in `src/tui/HelpModal.tsx`

## 9. Tests

- [x] 9.1 Add unit tests for `deleteTask` soft-delete behavior (task and subtask cascade) in the repo test file
- [x] 9.2 Add unit tests for `listDeletedTasks` and `undeleteTask` in the repo test file
- [x] 9.3 Add/update TUI keybinding tests for `d` (soft-delete) and `u` (undelete in deleted view) in `src/tui/App.keybindings.test.ts`
- [x] 9.4 Add unit tests for `undeleteSelectedTask` action in task actions test coverage
