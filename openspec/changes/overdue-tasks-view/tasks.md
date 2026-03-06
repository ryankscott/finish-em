## 1. Navigation Types

- [x] 1.1 Add `"overdue"` to the `View` union type in `src/tui/hooks/useNavigation.ts`
- [x] 1.2 Add `overdue` to the `countKey` union in `Sidebar.tsx` (NavItem type)
- [x] 1.3 Add `overdue` field to `EMPTY_VIEW_COUNTS` and `ViewCounts` type in `useAppData.ts`

## 2. Sidebar

- [x] 2.1 Add the "Overdue" `NavItem` to `NAV_ITEMS` in `Sidebar.tsx` (after "Today", before "Inbox"), with `countKey: "overdue"` and `view: "overdue"`
- [x] 2.2 Add `overdue` to the `viewCounts` prop type in `SidebarProps`

## 3. Data Loading

- [x] 3.1 In `useAppData.ts`, set `viewCounts.overdue` from the already-fetched `upcomingOverdueTasks` (filter: `t.dueAt && parseISO(t.dueAt) < startOfDay(now)`)
- [x] 3.2 Add `else if (view === "overdue")` branch in the view routing block: set tasks to the filtered overdue list, set status text to `"Overdue"`

## 4. App Routing

- [x] 4.1 Verify `App.tsx` routes `"overdue"` to `TaskPanel` (it should fall through naturally as a non-special view, but confirm and adjust if needed)

## 5. Tests

- [x] 5.1 Add a unit test for the overdue filter logic (tasks with `due_at < startOfDay(now)` are included; tasks due today or later are excluded; completed/deleted tasks are excluded)
- [x] 5.2 Add a test asserting that the "Overdue" nav item appears in the sidebar items built by `buildSidebarItems`
