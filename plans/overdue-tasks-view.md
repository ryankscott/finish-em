# Overdue Tasks View

## Summary

Tasks with past due dates are currently only visible in the "Upcoming" view, where they appear mixed with future tasks. There is no dedicated, scannable place to see everything that's overdue — making it easy to miss or ignore tasks that are already late.

## Scope

- Add an "Overdue" nav item to the sidebar, below "Today"
- Add an `overdue` view to the navigation state and routing logic
- Query open tasks where `due_at < startOfDay(today)` (past due, not completed, not deleted)
- Render the overdue list in the existing `TaskPanel` component (no new panel needed)
- Show task count badge on the sidebar item (same as Today)
- Add an `"overdue"` view showing all open tasks with `due_at < startOfDay(today)`, sorted by due date ascending (most overdue first)
- Display a count badge in the sidebar (consistent with Today/Inbox)
- Route `"overdue"` to the existing `TaskPanel` (no new panel component)
- Reuse the already-fetched `upcomingOverdueTasks` data — no additional API call
- Changing the Upcoming panel or its overdue display
- Adding recurring-task awareness or snooze behavior
- Distinguishing "overdue today" from "overdue by N days"
- Impact: `src/tui/Sidebar.tsx` — add "Overdue" nav item with badge
- Impact: `src/tui/hooks/useNavigation.ts` — add `"overdue"` to the `View` union type
- Impact: `src/tui/hooks/useAppData.ts` — add overdue query branch (`to: startOfDay(now)`, exclusive)
- Impact: `src/server/repos/tasks.ts` — no changes needed; existing `from`/`to` filter covers this
- Impact: `src/tui/App.tsx` — route `overdue` view to `TaskPanel`
- Impact: No DB migration required
- Impact: No new dependencies
- Related capabilities: `tui-overdue-view`

## Notes

- Reuse existing `upcomingOverdueTasks` fetch: `useAppData` already calls `api.listTasks({ status: "open", to: upcomingFrom })` where `upcomingFrom = startOfDay(now)`. This is exactly the overdue query. The result is reused for the Overdue view count and task list — no extra API call.
- Insert "Overdue" between "Today" and "Inbox" in sidebar: Overdue tasks are higher urgency than inbox tasks; placing Overdue directly after Today groups urgent/date-driven views together.
- Extend `ViewCounts` with `overdue` field: `ViewCounts` already has `today`, `inbox`, `upcoming`, `completed`, `deleted`. Adding `overdue` follows the exact same pattern, allowing the sidebar badge to render without any structural changes.
- Filter `upcomingOverdueTasks` consistently: The Upcoming panel filters overdue tasks with `t.dueAt && parseISO(t.dueAt) < startOfDay(colStart)` where `colStart` may be offset from today. The Overdue view uses `startOfDay(now)` consistently so it always reflects the current day regardless of Upcoming anchor.
- **Risk**: A task due exactly at midnight could appear in both Today and Overdue for a brief window if clocks drift. → Mitigation: Use strict `<` (not `<=`) boundary; `to: startOfDay(now)` excludes today's start, which matches the `<` semantics of the API filter.
- **Trade-off**: Reusing `upcomingOverdueTasks` couples the Overdue count to the Upcoming fetch path. If the Upcoming fetch is ever made lazy/conditional, the Overdue count must be independently maintained. Low risk given current architecture.

## Implementation Phases

1. Navigation Types
   - [done] Add `"overdue"` to the `View` union type in `src/tui/hooks/useNavigation.ts`
   - [done] Add `overdue` to the `countKey` union in `Sidebar.tsx` (NavItem type)
   - [done] Add `overdue` field to `EMPTY_VIEW_COUNTS` and `ViewCounts` type in `useAppData.ts`
2. Sidebar
   - [done] Add the "Overdue" `NavItem` to `NAV_ITEMS` in `Sidebar.tsx` (after "Today", before "Inbox"), with `countKey: "overdue"` and `view: "overdue"`
   - [done] Add `overdue` to the `viewCounts` prop type in `SidebarProps`
3. Data Loading
   - [done] In `useAppData.ts`, set `viewCounts.overdue` from the already-fetched `upcomingOverdueTasks` (filter: `t.dueAt && parseISO(t.dueAt) < startOfDay(now)`)
   - [done] Add `else if (view === "overdue")` branch in the view routing block: set tasks to the filtered overdue list, set status text to `"Overdue"`
4. App Routing
   - [done] Verify `App.tsx` routes `"overdue"` to `TaskPanel` (it should fall through naturally as a non-special view, but confirm and adjust if needed)
5. Tests
   - [done] Add a unit test for the overdue filter logic (tasks with `due_at < startOfDay(now)` are included; tasks due today or later are excluded; completed/deleted tasks are excluded)
   - [done] Add a test asserting that the "Overdue" nav item appears in the sidebar items built by `buildSidebarItems`
