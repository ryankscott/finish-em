# Auto Add Task To Selected Project

_Archived change: `2026-03-05-auto-add-task-to-selected-project`_

## Summary

When a project is selected in the sidebar, users expect new tasks added via Quick Add to belong to that project. Today, tasks without an explicit project in the input default to Inbox, forcing an extra step to move them. Defaulting to the selected project reduces friction and matches user intent.

## Scope

- When the user adds a task via Quick Add (input bar) and a project is currently selected in the sidebar, the new task is assigned to that project by default when the user does not specify a project in the input (e.g. no `project:` token).
- Explicit project in the input (e.g. `project: Other`) continues to win over the selected project.
- When no project is selected (e.g. Inbox or another view), behavior is unchanged: default remains Inbox (or existing fallback).
- Use the currently selected project as the default project for Quick Add when the user does not specify a project in the input.
- Preserve explicit input: if the user types `project: X`, that project wins.
- Keep existing behavior when no project is selected (e.g. Inbox or other views): default to Inbox.
- Changing how project selection works or adding new UI.
- Changing `parseTaskCreateInput` (no new tokens; defaulting is submit-time only).
- Extending the plain-text Quick Add API in this change (can be done later if desired).
- Impact: **TUI**: `useSubmitInput` (Quick Add branch) and its call site in `App.tsx` already receive `activeProjectId` / `activeProject`; projectId fallback chain will add selected project before Inbox.
- Impact: **Parsing**: `parseTaskCreateInput` remains unchanged; defaulting is applied at submit time when `parsed.input.projectId` is absent.
- Impact: **API**: Optional: if plain-text Quick Add (`createQuickAdd`) should also respect selected project, the API may need an optional `defaultProjectId` (or the server could accept context from the client). Otherwise only the parsed-token create path is affected.
- Related capabilities: `tui-quick-add-default-project`

## Notes

- 1. **Where to apply the default** Apply in `useSubmitInput` in the Quick Add branch when building `projectId` for `api.createTask()`. Use: `parsed.input.projectId ?? activeProjectId ?? inboxId ?? 1`. *Alternative:* Pass default from App and let a lower layer decide; rejected to keep the single place that already has both `parsed` and `activeProjectId`.
- **Risk:** User forgets they have a project selected and creates "Inbox" tasks in that project.
- **Trade-off:** Plain-text Quick Add (no tokens) still goes to Inbox. Acceptable for a minimal first step; can be revisited with an API change.
- Open questions: - None. Optional follow-up: add `defaultProjectId` to `createQuickAdd` so plain-text Quick Add also respects the selected project.

## Implementation Phases

1. Quick Add default project
   - [done] In `useSubmitInput` Quick Add branch (parsed-token path), set projectId fallback to `parsed.input.projectId ?? activeProjectId ?? inboxId ?? 1` so selected project is used when user does not specify a project in input
   - [done] Add or extend tests for Quick Add project default: selected project used when no project in input; explicit project in input wins; no project selected uses Inbox/default
