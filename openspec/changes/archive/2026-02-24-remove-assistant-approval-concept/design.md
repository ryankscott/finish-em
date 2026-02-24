## Context

Assistant mutation handling currently mixes two models:
1) explicit approval semantics (pending actions, confirm/cancel APIs, TUI shortcuts), and
2) immediate execution semantics already used by `sendAssistantChat` via auto-execution of pending actions.

This dual model increases surface area and makes assistant contracts harder to reason about across TUI, MCP tools, and OpenAPI. The change is cross-cutting because behavior and contracts span assistant service logic, UI interaction patterns, transport APIs, and test suites.

## Goals / Non-Goals

**Goals:**
- Remove the approval/decision concept from assistant-facing contracts and UX.
- Standardize assistant mutations on immediate execution with deterministic per-action outcomes.
- Remove decision-specific MCP and HTTP/OpenAPI surfaces.
- Keep action allowlist/validation and structured success/failure outcomes intact.

**Non-Goals:**
- Changing which mutation action types are supported.
- Expanding or reducing metadata coverage for task/project actions.
- Introducing new safety gates beyond existing validation/allowlist checks.

## Decisions

### 1) Make immediate execution the only supported model
- Decision: Assistant chat execution remains single-turn and executes actions immediately; there is no user-approval state transition in product semantics.
- Rationale: Runtime already follows this path and it is simpler, less error-prone, and easier for users.
- Alternative considered: Keep both immediate and manual approval modes. Rejected due to duplicated behavior and conflicting UX.

### 2) Remove decision APIs and tools rather than keeping deprecated no-ops
- Decision: Remove `decide_assistant_action` from MCP tooling and remove `/api/assistant/actions/decision` from OpenAPI/client contracts.
- Rationale: Hard removal prevents stale integrations from depending on obsolete semantics and keeps the contract crisp.
- Alternative considered: Leave deprecated endpoint/tool returning fixed errors. Rejected because it preserves conceptual debt and maintenance overhead.

### 3) Remove pending/confirm UI affordances in TUI assistant panel
- Decision: Remove pending-action selection behavior and `y/n` confirmation UX/help text.
- Rationale: UI must reflect immediate execution semantics and avoid suggesting a review queue that no longer exists.
- Alternative considered: Keep UI hints but disable actions. Rejected as confusing and unnecessary.

### 4) Keep structured outcomes, but reframe summary language
- Decision: Preserve deterministic per-action and summary results; eliminate “pending review”/“confirmed” language in favor of immediate execution wording.
- Rationale: Outcome structures remain valuable for explainability and debugging while avoiding approval framing.
- Alternative considered: Collapse to text-only assistant messages. Rejected because typed outcomes support stable rendering and tests.

## Risks / Trade-offs

- [External callers still invoke removed decision surfaces] → Mitigation: mark as **BREAKING** in proposal/specs and update OpenAPI + MCP docs in the same change.
- [Residual pending-state assumptions in tests/UI] → Mitigation: migrate tests to assert immediate execution and remove pending-specific shortcuts/selectors.
- [Behavioral ambiguity when actions fail partially] → Mitigation: keep explicit per-action outcomes and summary statuses (`success`, `failure`, `partial_success`).

## Migration Plan

1. Update OpenSpec delta specs to remove approval semantics and encode immediate execution semantics.
2. Remove decision surface definitions from MCP tools and OpenAPI.
3. Update client contracts (HTTP/MCP/direct API adapters) to drop `decideAssistantAction`.
4. Update TUI assistant UX/help to remove confirm/cancel affordances and pending-action navigation.
5. Refactor assistant service summary language and state transitions to avoid pending-review framing.
6. Update assistant-focused tests to validate immediate execution behavior only.

Rollback strategy:
- Re-introduce decision surface and TUI affordances by reverting this change set; no database migration is involved.

## Open Questions

- Should `AssistantActionStatus` keep a `pending` enum value internally for transient processing, or be removed entirely from persisted/returned message actions?
- If a future safety mode reintroduces approvals, should it be a separate capability flag rather than part of default assistant behavior?
