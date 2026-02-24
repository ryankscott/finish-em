## 1. Define assistant mutation contracts

- [x] 1.1 Add typed assistant action schemas for supported task operations (`create_task`, `update_task`, `complete_task`, `uncomplete_task`, `set_task_due_date`)
- [x] 1.2 Add typed assistant action schemas for supported project operations (`create_project`, `update_project`)
- [x] 1.3 Add shared validation and normalized outcome types for assistant mutation execution (`success`/`failure`, action metadata, user-facing message)

## 2. Implement mutation executor wiring

- [x] 2.1 Implement assistant action dispatch that routes allowlisted action types to existing task/project backend service operations
- [x] 2.2 Enforce action allowlist and fail-fast validation before invoking any mutation service
- [x] 2.3 Implement due-date payload handling and validation path for assistant-driven task scheduling updates

## 3. Integrate assistant API responses

- [x] 3.1 Update assistant action orchestration route/service to execute mutation actions and collect per-action outcomes
- [x] 3.2 Return deterministic structured action results in assistant API responses for both single and multi-action turns
- [x] 3.3 Add user-visible summary formatting for success, partial success, and failure outcomes in assistant response payloads

## 4. Keep API contract and docs aligned

- [x] 4.1 Update assistant-related OpenAPI schemas/endpoints to reflect mutation action request/response structures
- [x] 4.2 Ensure task/project API integration points used by assistant match existing domain behavior and constraints

## 5. Verify behavior with tests

- [x] 5.1 Add/extend assistant integration tests for successful task and project mutation actions
- [x] 5.2 Add/extend tests for unsupported action types and invalid payload validation failures
- [x] 5.3 Add/extend tests for multi-action partial success with per-action outcome reporting
- [x] 5.4 Run targeted assistant tests and confirm no regression in existing read-only assistant behavior

## 6. Expand project metadata parity and TUI metadata entry

- [x] 6.1 Extend assistant `create_project` action schema + execution path to support canonical project metadata fields (`startAt`, `endAt`, `isInbox`, in addition to existing fields)
- [x] 6.2 Align assistant prompt/tooling guidance so `create_project` advertised payload fields match executable schema support
- [x] 6.3 Add/extend assistant tests for metadata-complete project creation and date validation failures
- [x] 6.4 Add TUI project metadata parser for tokenized input (e.g., `name:`, `color:`, `emoji:`, `description:`, `start:`, `end:`, `inbox:`)
- [x] 6.5 Add TUI autocomplete behavior for project metadata tokens and known value hints where deterministic
- [x] 6.6 Add TUI tests for autocomplete suggestions, token parsing, and required metadata validation feedback
- [x] 6.7 Run targeted TUI + assistant tests to confirm no regressions in existing quick project creation flow

## 7. Expand task metadata parity and TUI metadata entry

- [x] 7.1 Extend assistant `create_task` action schema + execution path to support canonical task metadata fields used by task repo create flows
- [x] 7.2 Align assistant prompt/tooling guidance so `create_task` advertised payload fields match executable schema support
- [x] 7.3 Add/extend assistant tests for metadata-complete task creation and task-date validation failures
- [x] 7.4 Add TUI task metadata parser for tokenized input (e.g., `title:`, `project:`, `priority:`, `due:`, `scheduled:`, `notes:`, `parent:`, `recurs:`)
- [x] 7.5 Add TUI autocomplete behavior for task metadata tokens and deterministic value hints (project names, priority values, recurrence presets)
- [x] 7.6 Add TUI tests for task-create autocomplete suggestions, token parsing, and required metadata validation feedback
- [x] 7.7 Run targeted TUI + assistant tests to confirm no regressions in existing quick-add and task-edit flows
