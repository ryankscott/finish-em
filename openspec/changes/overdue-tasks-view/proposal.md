## Why

Tasks with past due dates are currently only visible in the "Upcoming" view, where they appear mixed with future tasks. There is no dedicated, scannable place to see everything that's overdue — making it easy to miss or ignore tasks that are already late.

## What Changes

- Add an "Overdue" nav item to the sidebar, below "Today"
- Add an `overdue` view to the navigation state and routing logic
- Query open tasks where `due_at < startOfDay(today)` (past due, not completed, not deleted)
- Render the overdue list in the existing `TaskPanel` component (no new panel needed)
- Show task count badge on the sidebar item (same as Today)

## Capabilities

### New Capabilities
- `tui-overdue-view`: A dedicated sidebar view showing all open tasks whose due date is strictly before today, sorted by due date ascending (most overdue first)

### Modified Capabilities
- (none — no existing spec-level behavior changes)

## Impact

- `src/tui/Sidebar.tsx` — add "Overdue" nav item with badge
- `src/tui/hooks/useNavigation.ts` — add `"overdue"` to the `View` union type
- `src/tui/hooks/useAppData.ts` — add overdue query branch (`to: startOfDay(now)`, exclusive)
- `src/server/repos/tasks.ts` — no changes needed; existing `from`/`to` filter covers this
- `src/tui/App.tsx` — route `overdue` view to `TaskPanel`
- No DB migration required
- No new dependencies
