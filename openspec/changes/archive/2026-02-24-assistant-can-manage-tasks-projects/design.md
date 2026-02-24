## Context

The existing assistant flow can interpret user intent and return conversational guidance, but task and project mutations are still primarily handled through direct app interactions and API routes outside the assistant execution loop. This change introduces mutation-capable assistant actions that execute against the same backend services and repositories used by standard UI/API flows.

Constraints:
- Mutations must use the existing API/domain boundaries and avoid bypassing repos/services.
- Assistant actions must be explicit, validated, and auditable in request/response payloads.
- User-facing responses must clearly communicate success, partial success, and failure states.

Stakeholders:
- End users who manage tasks/projects conversationally.
- Assistant platform maintainers responsible for safety and correctness.
- API/backend maintainers responsible for task/project consistency.

## Goals / Non-Goals

**Goals:**
- Enable assistant-triggered task actions: create, update fields, complete, uncomplete, and due-date/reschedule updates.
- Enable assistant-triggered project actions: create and update project metadata.
- Ensure assistant project creation supports canonical metadata fields already handled by backend project repositories.
- Add a keyboard-first TUI project-entry flow with autocomplete hints to reduce metadata omission.
- Ensure assistant task creation supports canonical task metadata fields already handled by backend task repositories.
- Add a keyboard-first TUI task-entry flow with autocomplete hints to reduce task metadata omission.
- Route assistant mutations through validated server APIs/services that operate on canonical todo data.
- Return structured action execution results that can be rendered consistently in assistant UI surfaces.
- Apply safety checks (input validation, supported action allowlist, clear error handling).

**Non-Goals:**
- Adding destructive operations outside the requested scope (e.g., delete project/task) unless explicitly approved in a later change.
- Introducing a new persistence model or bypass channel for assistant writes.
- Building fully autonomous background workflows beyond user-initiated assistant requests.
- Redesigning assistant UX beyond mutation confirmation/error messaging.

## Decisions

### 1) Use a typed action contract between assistant decisions and mutation executor
- Decision: Define a closed set of assistant action types and validated payload schemas for task/project operations.
- Rationale: Prevents arbitrary tool execution, improves safety, and keeps behavior testable.
- Alternatives considered:
  - Free-form command strings interpreted at runtime: rejected due to ambiguity and injection risk.
  - Direct model-to-repo calls: rejected because it bypasses API/service constraints and auditing points.

### 2) Reuse existing task/project API and service layer as the execution backend
- Decision: Assistant mutation actions call the same domain services/routes used by the app’s normal task/project operations.
- Rationale: Ensures consistent business rules, avoids data divergence, and minimizes duplicate logic.
- Alternatives considered:
  - Separate assistant-only mutation service: rejected to avoid rule drift and duplicated validation.

### 3) Return structured per-action execution results
- Decision: Mutation execution returns normalized result objects containing action type, target entity, outcome (`success` | `failure`), and message/error details.
- Rationale: Enables clear conversational summaries and deterministic UI rendering in web and TUI.
- Alternatives considered:
  - Plain text-only assistant responses: rejected because downstream UIs cannot reliably parse and display action outcomes.

### 4) Apply action-level safety gates before execution
- Decision: Validate action type, required identifiers/fields, and date payload shape before calling mutation services; reject unsupported actions with explicit errors.
- Rationale: Fails fast, reduces accidental writes, and makes behavior predictable.
- Alternatives considered:
  - Best-effort coercion of malformed action payloads: rejected because silent coercion can mutate wrong entities.

### 5) Maintain metadata parity for project creation
- Decision: Keep assistant `create_project` payload support aligned with canonical project metadata fields (`name`, `emoji`, `description`, `startAt`, `endAt`, `color`, `isInbox`) used by project repos and MCP tools.
- Rationale: Avoids drift where one write surface can set fields that another cannot, which leads to partial project records and inconsistent UX.
- Alternatives considered:
  - Keep minimal create payload and require follow-up update: rejected because it increases turns and invites missing metadata.

### 6) Use token autocomplete for TUI project metadata entry
- Decision: Extend TUI project-creation input from free-text name to tokenized metadata input with inline autocomplete suggestions and warning/status feedback.
- Rationale: Preserves keyboard speed while making valid metadata discoverable and reducing syntax mistakes.
- Alternatives considered:
  - Multi-step modal-like prompt flow in TUI: rejected for extra navigation friction.
  - Keep raw free text with docs-only guidance: rejected because omission/error rates remain high.

### 7) Maintain metadata parity for task creation
- Decision: Keep assistant `create_task` payload support aligned with canonical task create metadata fields (`title`, `projectId`, `parentTaskId`, `notes`, `priority`, `scheduledAt`, `dueAt`, `dueTimezone`, `recurrencePreset`, `recurrenceRRule`) used by task repos and MCP tools.
- Rationale: Avoids drift where assistant task creation can set fewer fields than other write surfaces, causing avoidable follow-up edits.
- Alternatives considered:
  - Keep minimal `create_task` payload and rely on `update_task`: rejected due to extra turns and state churn.

### 8) Use token autocomplete for TUI task metadata entry
- Decision: Extend TUI task-creation input from plain quick text to tokenized metadata input with inline autocomplete suggestions and warning/status feedback.
- Rationale: Enables metadata-complete task creation while preserving single-line keyboard workflow.
- Alternatives considered:
  - Separate dedicated task-create wizard: rejected for interaction overhead.
  - Keep quick add only and rely on later edit: rejected due to metadata omissions at capture time.

## Risks / Trade-offs

- [Model emits an incorrect target entity] → Mitigation: require explicit IDs when present, perform preflight lookup/validation, and return no-op failure when entity mismatch is detected.
- [Partial completion in multi-action requests] → Mitigation: execute actions independently with per-action status reporting and clear summary messaging.
- [Schema drift between assistant actions and API endpoints] → Mitigation: centralize action schema definitions and keep OpenAPI + action type tests in sync.
- [Increased mutation surface area] → Mitigation: allowlist only requested operations and keep destructive actions out of scope for this change.
- [Autocomplete complexity in terminal constraints] → Mitigation: use deterministic token suggestions and explicit fallback to manual entry.
- [Required-vs-optional metadata ambiguity] → Mitigation: codify required fields in spec and emit clear validation errors before mutation.
- [Task token ambiguity between title and metadata] → Mitigation: use explicit token prefixes and preserve plain-text fast path.

## Migration Plan

1. Introduce assistant action schema/types and mapping layer for task/project mutations.
2. Wire assistant action executor to existing backend task/project services.
3. Add structured mutation result payloads and assistant response formatting.
4. Update OpenAPI contracts for assistant action request/response where applicable.
5. Add tests for happy-path mutations, validation failures, unsupported actions, and partial success scenarios.
6. Add TUI project metadata parser/autocomplete behavior and tests for token completion + validation errors.
7. Add TUI task metadata parser/autocomplete behavior and tests for token completion + validation errors.
8. Roll out with feature verification in existing assistant integration tests.

Rollback strategy:
- Disable mutation-capable assistant actions behind the executor entrypoint (or revert route wiring) while preserving read-only assistant behavior.
- Since persistence schema is unchanged, rollback does not require database migration.

## Open Questions

- Should project rename/color updates require an explicit confirmation turn in assistant UX, or is single-turn execution sufficient?
- Should due-date updates support natural-language relative times only, or also strict ISO timestamps in action payloads?
- Should multi-action requests preserve original order strictly, or allow internal reordering for dependency-safe execution?
