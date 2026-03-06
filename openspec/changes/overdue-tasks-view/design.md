## Context

The TUI has a fixed set of named views (`"today"`, `"inbox"`, `"upcoming"`, `"completed"`, `"deleted"`, `"project"`, `"settings"`) defined in `useNavigation.ts`. The sidebar renders nav items from `NAV_ITEMS` in `Sidebar.tsx`, each with a `countKey` that maps to a field in `ViewCounts`. Data loading is centralized in `useAppData.ts`, which already fetches overdue tasks as `upcomingOverdueTasks` (open tasks with `to: startOfDay(now)`) for the Upcoming view — that query result can be reused for the Overdue view at zero extra cost.

## Goals / Non-Goals

**Goals:**
- Add an `"overdue"` view showing all open tasks with `due_at < startOfDay(today)`, sorted by due date ascending (most overdue first)
- Display a count badge in the sidebar (consistent with Today/Inbox)
- Route `"overdue"` to the existing `TaskPanel` (no new panel component)
- Reuse the already-fetched `upcomingOverdueTasks` data — no additional API call

**Non-Goals:**
- Changing the Upcoming panel or its overdue display
- Adding recurring-task awareness or snooze behavior
- Distinguishing "overdue today" from "overdue by N days"

## Decisions

### Reuse existing `upcomingOverdueTasks` fetch
`useAppData` already calls `api.listTasks({ status: "open", to: upcomingFrom })` where `upcomingFrom = startOfDay(now)`. This is exactly the overdue query. The result is reused for the Overdue view count and task list — no extra API call.

**Alternative considered**: Separate `api.listTasks` call in the overdue branch. Rejected because it adds latency and network round-trips for data already in memory.

### Insert "Overdue" between "Today" and "Inbox" in sidebar
Overdue tasks are higher urgency than inbox tasks; placing Overdue directly after Today groups urgent/date-driven views together.

**Alternative considered**: Below "Upcoming". Rejected — would separate the two most urgent date-based views.

### Extend `ViewCounts` with `overdue` field
`ViewCounts` already has `today`, `inbox`, `upcoming`, `completed`, `deleted`. Adding `overdue` follows the exact same pattern, allowing the sidebar badge to render without any structural changes.

### Filter `upcomingOverdueTasks` consistently
The Upcoming panel filters overdue tasks with `t.dueAt && parseISO(t.dueAt) < startOfDay(colStart)` where `colStart` may be offset from today. The Overdue view uses `startOfDay(now)` consistently so it always reflects the current day regardless of Upcoming anchor.

## Risks / Trade-offs

- **Risk**: A task due exactly at midnight could appear in both Today and Overdue for a brief window if clocks drift. → Mitigation: Use strict `<` (not `<=`) boundary; `to: startOfDay(now)` excludes today's start, which matches the `<` semantics of the API filter.
- **Trade-off**: Reusing `upcomingOverdueTasks` couples the Overdue count to the Upcoming fetch path. If the Upcoming fetch is ever made lazy/conditional, the Overdue count must be independently maintained. Low risk given current architecture.
