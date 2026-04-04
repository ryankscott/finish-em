# Assistant Can Manage Tasks Projects

_Archived change: `2026-02-24-assistant-can-manage-tasks-projects`_

## Summary

The assistant can currently discuss and suggest todo changes, but users still have to switch context and manually perform many task/project operations. Enabling the assistant to execute authorized task and project actions directly reduces friction and makes conversational planning actually actionable.

## Scope

- Add assistant action execution for core task operations (create, update, complete, uncomplete, reschedule/due date updates).
- Add assistant action execution for core project operations (create project, update project metadata).
- Expand assistant `create_project` metadata support to match canonical project fields used by backend repos/services.
- Expand assistant `create_task` metadata support to match canonical task fields used by backend repos/services.
- Add TUI project creation metadata entry with token autocomplete so users can populate the right metadata without leaving keyboard flow.
- Add TUI task creation metadata entry with token autocomplete so users can populate task metadata without leaving keyboard flow.
- Define a safe action contract so assistant decisions map to explicit, validated API operations.
- Add confirmation/error handling behavior so users get clear feedback when actions succeed, partially succeed, or fail.
- Ensure assistant action calls operate on the same underlying todo data as the app’s task and project views.
- Enable assistant-triggered task actions: create, update fields, complete, uncomplete, and due-date/reschedule updates.
- Enable assistant-triggered project actions: create and update project metadata.
- Ensure assistant project creation supports canonical metadata fields already handled by backend project repositories.
- Add a keyboard-first TUI project-entry flow with autocomplete hints to reduce metadata omission.
- Ensure assistant task creation supports canonical task metadata fields already handled by backend task repositories.
- Add a keyboard-first TUI task-entry flow with autocomplete hints to reduce task metadata omission.
- Route assistant mutations through validated server APIs/services that operate on canonical todo data.
- Return structured action execution results that can be rendered consistently in assistant UI surfaces.
- Apply safety checks (input validation, supported action allowlist, clear error handling).
- Adding destructive operations outside the requested scope (e.g., delete project/task) unless explicitly approved in a later change.
- Introducing a new persistence model or bypass channel for assistant writes.
- Building fully autonomous background workflows beyond user-initiated assistant requests.
- Redesigning assistant UX beyond mutation confirmation/error messaging.
- Impact: Affected code:
- Impact: Assistant API routes and action orchestration under `src/routes/api.assistant*`.
- Impact: Assistant service/tool wiring in `src/server/services/` and related assistant command handling.
- Impact: Task/project API integration paths (`src/routes/api.tasks*`, `src/routes/api.projects*`, and `src/lib/api-client.ts`).
- Impact: TUI and/or web assistant UI feedback surfaces for action results.
- Impact: Affected behavior:
- Impact: Assistant responses can cause real state mutations in tasks/projects.
- Impact: Error and confirmation messaging becomes part of assistant action UX.
- Impact: TUI project creation can collect metadata via tokenized input with autocomplete hints and validation feedback.
- Impact: TUI task creation can collect metadata via tokenized input with autocomplete hints and validation feedback.
- Impact: Dependencies/systems:
- Impact: Existing backend repos/services for tasks and projects; no new persistence system required.
- Impact: OpenAPI contract updates for assistant action payloads and outcomes.
- Related capabilities: `assistant-action-safety`, `assistant-project-actions`, `assistant-task-actions`, `tui-project-metadata-entry`, `tui-task-metadata-entry`

## Notes

- 1) Use a typed action contract between assistant decisions and mutation executor: - Decision: Define a closed set of assistant action types and validated payload schemas for task/project operations. - Rationale: Prevents arbitrary tool execution, improves safety, and keeps behavior testable. - Alternatives considered: - Free-form command strings interpreted at runtime: rejected due to ambiguity and injection risk. - Direct model-to-repo calls: rejected because it bypasses API/service constraints and auditing points.
- 2) Reuse existing task/project API and service layer as the execution backend: - Decision: Assistant mutation actions call the same domain services/routes used by the app’s normal task/project operations. - Rationale: Ensures consistent business rules, avoids data divergence, and minimizes duplicate logic. - Alternatives considered: - Separate assistant-only mutation service: rejected to avoid rule drift and duplicated validation.
- 3) Return structured per-action execution results: - Decision: Mutation execution returns normalized result objects containing action type, target entity, outcome (`success` | `failure`), and message/error details. - Rationale: Enables clear conversational summaries and deterministic UI rendering in web and TUI. - Alternatives considered: - Plain text-only assistant responses: rejected because downstream UIs cannot reliably parse and display action outcomes.
- 4) Apply action-level safety gates before execution: - Decision: Validate action type, required identifiers/fields, and date payload shape before calling mutation services; reject unsupported actions with explicit errors. - Rationale: Fails fast, reduces accidental writes, and makes behavior predictable. - Alternatives considered: - Best-effort coercion of malformed action payloads: rejected because silent coercion can mutate wrong entities.
- 5) Maintain metadata parity for project creation: - Decision: Keep assistant `create_project` payload support aligned with canonical project metadata fields (`name`, `emoji`, `description`, `startAt`, `endAt`, `color`, `isInbox`) used by project repos and MCP tools. - Rationale: Avoids drift where one write surface can set fields that another cannot, which leads to partial project records and inconsistent UX. - Alternatives considered: - Keep minimal create payload and require follow-up update: rejected because it increases turns and invites missing metadata.
- 6) Use token autocomplete for TUI project metadata entry: - Decision: Extend TUI project-creation input from free-text name to tokenized metadata input with inline autocomplete suggestions and warning/status feedback. - Rationale: Preserves keyboard speed while making valid metadata discoverable and reducing syntax mistakes. - Alternatives considered: - Multi-step modal-like prompt flow in TUI: rejected for extra navigation friction. - Keep raw free text with docs-only guidance: rejected because omission/error rates remain high.
- 7) Maintain metadata parity for task creation: - Decision: Keep assistant `create_task` payload support aligned with canonical task create metadata fields (`title`, `projectId`, `parentTaskId`, `notes`, `priority`, `scheduledAt`, `dueAt`, `dueTimezone`, `recurrencePreset`, `recurrenceRRule`) used by task repos and MCP tools. - Rationale: Avoids drift where assistant task creation can set fewer fields than other write surfaces, causing avoidable follow-up edits. - Alternatives considered: - Keep minimal `create_task` payload and rely on `update_task`: rejected due to extra turns and state churn.
- 8) Use token autocomplete for TUI task metadata entry: - Decision: Extend TUI task-creation input from plain quick text to tokenized metadata input with inline autocomplete suggestions and warning/status feedback. - Rationale: Enables metadata-complete task creation while preserving single-line keyboard workflow. - Alternatives considered: - Separate dedicated task-create wizard: rejected for interaction overhead. - Keep quick add only and rely on later edit: rejected due to metadata omissions at capture time.
- [Model emits an incorrect target entity] → Mitigation: require explicit IDs when present, perform preflight lookup/validation, and return no-op failure when entity mismatch is detected.
- [Partial completion in multi-action requests] → Mitigation: execute actions independently with per-action status reporting and clear summary messaging.
- [Schema drift between assistant actions and API endpoints] → Mitigation: centralize action schema definitions and keep OpenAPI + action type tests in sync.
- [Increased mutation surface area] → Mitigation: allowlist only requested operations and keep destructive actions out of scope for this change.
- [Autocomplete complexity in terminal constraints] → Mitigation: use deterministic token suggestions and explicit fallback to manual entry.
- [Required-vs-optional metadata ambiguity] → Mitigation: codify required fields in spec and emit clear validation errors before mutation.
- [Task token ambiguity between title and metadata] → Mitigation: use explicit token prefixes and preserve plain-text fast path.
- Open questions: - Should project rename/color updates require an explicit confirmation turn in assistant UX, or is single-turn execution sufficient? - Should due-date updates support natural-language relative times only, or also strict ISO timestamps in action payloads? - Should multi-action requests preserve original order strictly, or allow internal reordering for dependency-safe execution?

## Implementation Phases

1. Define assistant mutation contracts
   - [done] Add typed assistant action schemas for supported task operations (`create_task`, `update_task`, `complete_task`, `uncomplete_task`, `set_task_due_date`)
   - [done] Add typed assistant action schemas for supported project operations (`create_project`, `update_project`)
   - [done] Add shared validation and normalized outcome types for assistant mutation execution (`success`/`failure`, action metadata, user-facing message)
2. Implement mutation executor wiring
   - [done] Implement assistant action dispatch that routes allowlisted action types to existing task/project backend service operations
   - [done] Enforce action allowlist and fail-fast validation before invoking any mutation service
   - [done] Implement due-date payload handling and validation path for assistant-driven task scheduling updates
3. Integrate assistant API responses
   - [done] Update assistant action orchestration route/service to execute mutation actions and collect per-action outcomes
   - [done] Return deterministic structured action results in assistant API responses for both single and multi-action turns
   - [done] Add user-visible summary formatting for success, partial success, and failure outcomes in assistant response payloads
4. Keep API contract and docs aligned
   - [done] Update assistant-related OpenAPI schemas/endpoints to reflect mutation action request/response structures
   - [done] Ensure task/project API integration points used by assistant match existing domain behavior and constraints
5. Verify behavior with tests
   - [done] Add/extend assistant integration tests for successful task and project mutation actions
   - [done] Add/extend tests for unsupported action types and invalid payload validation failures
   - [done] Add/extend tests for multi-action partial success with per-action outcome reporting
   - [done] Run targeted assistant tests and confirm no regression in existing read-only assistant behavior
6. Expand project metadata parity and TUI metadata entry
   - [done] Extend assistant `create_project` action schema + execution path to support canonical project metadata fields (`startAt`, `endAt`, `isInbox`, in addition to existing fields)
   - [done] Align assistant prompt/tooling guidance so `create_project` advertised payload fields match executable schema support
   - [done] Add/extend assistant tests for metadata-complete project creation and date validation failures
   - [done] Add TUI project metadata parser for tokenized input (e.g., `name:`, `color:`, `emoji:`, `description:`, `start:`, `end:`, `inbox:`)
   - [done] Add TUI autocomplete behavior for project metadata tokens and known value hints where deterministic
   - [done] Add TUI tests for autocomplete suggestions, token parsing, and required metadata validation feedback
   - [done] Run targeted TUI + assistant tests to confirm no regressions in existing quick project creation flow
7. Expand task metadata parity and TUI metadata entry
   - [done] Extend assistant `create_task` action schema + execution path to support canonical task metadata fields used by task repo create flows
   - [done] Align assistant prompt/tooling guidance so `create_task` advertised payload fields match executable schema support
   - [done] Add/extend assistant tests for metadata-complete task creation and task-date validation failures
   - [done] Add TUI task metadata parser for tokenized input (e.g., `title:`, `project:`, `priority:`, `due:`, `scheduled:`, `notes:`, `parent:`, `recurs:`)
   - [done] Add TUI autocomplete behavior for task metadata tokens and deterministic value hints (project names, priority values, recurrence presets)
   - [done] Add TUI tests for task-create autocomplete suggestions, token parsing, and required metadata validation feedback
   - [done] Run targeted TUI + assistant tests to confirm no regressions in existing quick-add and task-edit flows
