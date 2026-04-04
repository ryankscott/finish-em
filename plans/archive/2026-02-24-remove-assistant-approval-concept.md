# Remove Assistant Approval Concept

_Archived change: `2026-02-24-remove-assistant-approval-concept`_

## Summary

Assistant action approval currently exists as a user-facing concept in API surfaces, TUI shortcuts, and specs, but runtime behavior already auto-executes assistant actions during chat. Keeping both models creates confusion, duplicated pathways, and inconsistent contracts.

## Scope

- Remove the explicit approval/decision model for assistant actions from user-facing behavior and contracts.
- **BREAKING** Remove assistant action decision interfaces (`decide_assistant_action` / decision endpoint) from MCP and app API surfaces.
- Align assistant outcomes and messaging around immediate execution results (`executed` / `failed`) instead of pending review.
- Update TUI assistant UX/help text to remove confirm/cancel shortcuts and pending-action selection semantics.
- Update the planning requirements to describe deterministic immediate outcomes rather than confirmation flows.
- Remove the approval/decision concept from assistant-facing contracts and UX.
- Standardize assistant mutations on immediate execution with deterministic per-action outcomes.
- Remove decision-specific MCP and HTTP/OpenAPI surfaces.
- Keep action allowlist/validation and structured success/failure outcomes intact.
- Changing which mutation action types are supported.
- Expanding or reducing metadata coverage for task/project actions.
- Introducing new safety gates beyond existing validation/allowlist checks.
- Impact: Affected code: assistant service action-state transitions and summaries, TUI assistant panel/input handling, help modal shortcuts, API client contracts, MCP tool registration, OpenAPI path definitions, and assistant tests.
- Impact: Affected APIs: removal of decision endpoint and MCP tool; changed assistant interaction contract for clients relying on pending/confirm flow.
- Impact: Dependencies/systems: planning specs for assistant safety/action behavior and TUI/MCP surface definitions.
- Related capabilities: `assistant-action-safety`, `assistant-project-actions`, `assistant-task-actions`, `mcp-complete-tui-surface`

## Notes

- 1) Make immediate execution the only supported model: - Decision: Assistant chat execution remains single-turn and executes actions immediately; there is no user-approval state transition in product semantics. - Rationale: Runtime already follows this path and it is simpler, less error-prone, and easier for users. - Alternative considered: Keep both immediate and manual approval modes. Rejected due to duplicated behavior and conflicting UX.
- 2) Remove decision APIs and tools rather than keeping deprecated no-ops: - Decision: Remove `decide_assistant_action` from MCP tooling and remove `/api/assistant/actions/decision` from OpenAPI/client contracts. - Rationale: Hard removal prevents stale integrations from depending on obsolete semantics and keeps the contract crisp. - Alternative considered: Leave deprecated endpoint/tool returning fixed errors. Rejected because it preserves conceptual debt and maintenance overhead.
- 3) Remove pending/confirm UI affordances in TUI assistant panel: - Decision: Remove pending-action selection behavior and `y/n` confirmation UX/help text. - Rationale: UI must reflect immediate execution semantics and avoid suggesting a review queue that no longer exists. - Alternative considered: Keep UI hints but disable actions. Rejected as confusing and unnecessary.
- 4) Keep structured outcomes, but reframe summary language: - Decision: Preserve deterministic per-action and summary results; eliminate “pending review”/“confirmed” language in favor of immediate execution wording. - Rationale: Outcome structures remain valuable for explainability and debugging while avoiding approval framing. - Alternative considered: Collapse to text-only assistant messages. Rejected because typed outcomes support stable rendering and tests.
- [External callers still invoke removed decision surfaces] → Mitigation: mark as **BREAKING** in proposal/specs and update OpenAPI + MCP docs in the same change.
- [Residual pending-state assumptions in tests/UI] → Mitigation: migrate tests to assert immediate execution and remove pending-specific shortcuts/selectors.
- [Behavioral ambiguity when actions fail partially] → Mitigation: keep explicit per-action outcomes and summary statuses (`success`, `failure`, `partial_success`).
- Open questions: - Should `AssistantActionStatus` keep a `pending` enum value internally for transient processing, or be removed entirely from persisted/returned message actions? - If a future safety mode reintroduces approvals, should it be a separate capability flag rather than part of default assistant behavior?

## Implementation Phases

1. Remove approval contracts
   - [done] Remove `decide_assistant_action` MCP tool definition/registration and related handler wiring.
   - [done] Remove assistant decision endpoint contract from OpenAPI output and any endpoint-specific schema usage.
   - [done] Update API adapter interfaces (`api.ts`, `mcp-api.ts`, `direct-api.ts`) to remove `decideAssistantAction` method and dependent types.
2. Align assistant service semantics
   - [done] Refactor assistant action summary/state messaging to remove "pending review" and "confirmed" semantics.
   - [done] Remove or simplify assistant decision entrypoints/state transitions that are no longer reachable under immediate execution.
   - [done] Ensure assistant chat execution path returns deterministic per-action outcomes for success/failure/partial success.
3. Remove TUI approval UX
   - [done] Remove `y/n` assistant action confirmation keyboard handling and pending-action selection logic from TUI app state.
   - [done] Update assistant panel footer/help copy to reflect chat + immediate execution behavior.
   - [done] Keep assistant chat/history actions functional after approval UX removal.
4. Update tests and validation
   - [done] Replace decision-oriented assistant service tests with immediate-execution behavior tests.
   - [done] Update MCP/OpenAPI tests to assert absence of assistant decision surface.
   - [done] Run targeted assistant + TUI + MCP test suites covering modified behavior.
5. Final verification
   - [done] Confirm no remaining references to confirm/cancel assistant approval semantics in shipped contracts or help text.
   - [done] Confirm the planning artifacts and implementation remain aligned for modified capabilities (`assistant-action-safety`, `assistant-task-actions`, `assistant-project-actions`, `mcp-complete-tui-surface`).
