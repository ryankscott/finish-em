## Why

The assistant can currently discuss and suggest todo changes, but users still have to switch context and manually perform many task/project operations. Enabling the assistant to execute authorized task and project actions directly reduces friction and makes conversational planning actually actionable.

## What Changes

- Add assistant action execution for core task operations (create, update, complete, uncomplete, reschedule/due date updates).
- Add assistant action execution for core project operations (create project, update project metadata).
- Expand assistant `create_project` metadata support to match canonical project fields used by backend repos/services.
- Expand assistant `create_task` metadata support to match canonical task fields used by backend repos/services.
- Add TUI project creation metadata entry with token autocomplete so users can populate the right metadata without leaving keyboard flow.
- Add TUI task creation metadata entry with token autocomplete so users can populate task metadata without leaving keyboard flow.
- Define a safe action contract so assistant decisions map to explicit, validated API operations.
- Add confirmation/error handling behavior so users get clear feedback when actions succeed, partially succeed, or fail.
- Ensure assistant action calls operate on the same underlying todo data as the app’s task and project views.

## Capabilities

### New Capabilities
- `assistant-task-actions`: Allow assistant-initiated execution of task CRUD/state/date operations through validated backend APIs.
- `assistant-project-actions`: Allow assistant-initiated execution of project create/update operations through validated backend APIs.
- `assistant-action-safety`: Define authorization, validation, and user-facing confirmation/error semantics for assistant-executed mutations.
- `tui-project-metadata-entry`: Provide a guided, autocomplete-assisted TUI flow for creating projects with complete metadata.
- `tui-task-metadata-entry`: Provide a guided, autocomplete-assisted TUI flow for creating tasks with complete metadata.

### Modified Capabilities
- None.

## Impact

- Affected code:
  - Assistant API routes and action orchestration under `src/routes/api.assistant*`.
  - Assistant service/tool wiring in `src/server/services/` and related assistant command handling.
  - Task/project API integration paths (`src/routes/api.tasks*`, `src/routes/api.projects*`, and `src/lib/api-client.ts`).
  - TUI and/or web assistant UI feedback surfaces for action results.
- Affected behavior:
  - Assistant responses can cause real state mutations in tasks/projects.
  - Error and confirmation messaging becomes part of assistant action UX.
  - TUI project creation can collect metadata via tokenized input with autocomplete hints and validation feedback.
  - TUI task creation can collect metadata via tokenized input with autocomplete hints and validation feedback.
- Dependencies/systems:
  - Existing backend repos/services for tasks and projects; no new persistence system required.
  - OpenAPI contract updates for assistant action payloads and outcomes.
