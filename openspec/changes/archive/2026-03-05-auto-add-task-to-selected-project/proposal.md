## Why

When a project is selected in the sidebar, users expect new tasks added via Quick Add to belong to that project. Today, tasks without an explicit project in the input default to Inbox, forcing an extra step to move them. Defaulting to the selected project reduces friction and matches user intent.

## What Changes

- When the user adds a task via Quick Add (input bar) and a project is currently selected in the sidebar, the new task is assigned to that project by default when the user does not specify a project in the input (e.g. no `project:` token).
- Explicit project in the input (e.g. `project: Other`) continues to win over the selected project.
- When no project is selected (e.g. Inbox or another view), behavior is unchanged: default remains Inbox (or existing fallback).

## Capabilities

### New Capabilities

- `tui-quick-add-default-project`: When a project is selected in the TUI, Quick Add uses that project as the default for new tasks when the user does not specify a project in the input. Covers both the parsed-token create path and, if applicable, the plain-text Quick Add path (e.g. API default).

### Modified Capabilities

- (None. No existing spec in `openspec/specs/` defines Quick Add project defaulting; this is a new behavioral contract.)

## Impact

- **TUI**: `useSubmitInput` (Quick Add branch) and its call site in `App.tsx` already receive `activeProjectId` / `activeProject`; projectId fallback chain will add selected project before Inbox.
- **Parsing**: `parseTaskCreateInput` remains unchanged; defaulting is applied at submit time when `parsed.input.projectId` is absent.
- **API**: Optional: if plain-text Quick Add (`createQuickAdd`) should also respect selected project, the API may need an optional `defaultProjectId` (or the server could accept context from the client). Otherwise only the parsed-token create path is affected.
