## 1. Remove approval contracts

- [x] 1.1 Remove `decide_assistant_action` MCP tool definition/registration and related handler wiring.
- [x] 1.2 Remove assistant decision endpoint contract from OpenAPI output and any endpoint-specific schema usage.
- [x] 1.3 Update API adapter interfaces (`api.ts`, `mcp-api.ts`, `direct-api.ts`) to remove `decideAssistantAction` method and dependent types.

## 2. Align assistant service semantics

- [x] 2.1 Refactor assistant action summary/state messaging to remove "pending review" and "confirmed" semantics.
- [x] 2.2 Remove or simplify assistant decision entrypoints/state transitions that are no longer reachable under immediate execution.
- [x] 2.3 Ensure assistant chat execution path returns deterministic per-action outcomes for success/failure/partial success.

## 3. Remove TUI approval UX

- [x] 3.1 Remove `y/n` assistant action confirmation keyboard handling and pending-action selection logic from TUI app state.
- [x] 3.2 Update assistant panel footer/help copy to reflect chat + immediate execution behavior.
- [x] 3.3 Keep assistant chat/history actions functional after approval UX removal.

## 4. Update tests and validation

- [x] 4.1 Replace decision-oriented assistant service tests with immediate-execution behavior tests.
- [x] 4.2 Update MCP/OpenAPI tests to assert absence of assistant decision surface.
- [x] 4.3 Run targeted assistant + TUI + MCP test suites covering modified behavior.

## 5. Final verification

- [x] 5.1 Confirm no remaining references to confirm/cancel assistant approval semantics in shipped contracts or help text.
- [x] 5.2 Confirm OpenSpec artifacts and implementation remain aligned for modified capabilities (`assistant-action-safety`, `assistant-task-actions`, `assistant-project-actions`, `mcp-complete-tui-surface`).
