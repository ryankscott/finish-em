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

## Risks / Trade-offs

- [Model emits an incorrect target entity] → Mitigation: require explicit IDs when present, perform preflight lookup/validation, and return no-op failure when entity mismatch is detected.
- [Partial completion in multi-action requests] → Mitigation: execute actions independently with per-action status reporting and clear summary messaging.
- [Schema drift between assistant actions and API endpoints] → Mitigation: centralize action schema definitions and keep OpenAPI + action type tests in sync.
- [Increased mutation surface area] → Mitigation: allowlist only requested operations and keep destructive actions out of scope for this change.

## Migration Plan

1. Introduce assistant action schema/types and mapping layer for task/project mutations.
2. Wire assistant action executor to existing backend task/project services.
3. Add structured mutation result payloads and assistant response formatting.
4. Update OpenAPI contracts for assistant action request/response where applicable.
5. Add tests for happy-path mutations, validation failures, unsupported actions, and partial success scenarios.
6. Roll out with feature verification in existing assistant integration tests.

Rollback strategy:
- Disable mutation-capable assistant actions behind the executor entrypoint (or revert route wiring) while preserving read-only assistant behavior.
- Since persistence schema is unchanged, rollback does not require database migration.

## Open Questions

- Should project rename/color updates require an explicit confirmation turn in assistant UX, or is single-turn execution sufficient?
- Should due-date updates support natural-language relative times only, or also strict ISO timestamps in action payloads?
- Should multi-action requests preserve original order strictly, or allow internal reordering for dependency-safe execution?
