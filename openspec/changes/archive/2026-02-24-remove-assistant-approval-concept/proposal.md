## Why

Assistant action approval currently exists as a user-facing concept in API surfaces, TUI shortcuts, and specs, but runtime behavior already auto-executes assistant actions during chat. Keeping both models creates confusion, duplicated pathways, and inconsistent contracts.

## What Changes

- Remove the explicit approval/decision model for assistant actions from user-facing behavior and contracts.
- **BREAKING** Remove assistant action decision interfaces (`decide_assistant_action` / decision endpoint) from MCP and app API surfaces.
- Align assistant outcomes and messaging around immediate execution results (`executed` / `failed`) instead of pending review.
- Update TUI assistant UX/help text to remove confirm/cancel shortcuts and pending-action selection semantics.
- Update OpenSpec requirements to describe deterministic immediate outcomes rather than confirmation flows.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `assistant-action-safety`: Replace confirmation-oriented requirements with immediate execution and outcome requirements.
- `assistant-task-actions`: Clarify task action behavior under immediate execution semantics (no approval turn).
- `assistant-project-actions`: Clarify project action behavior under immediate execution semantics (no approval turn).
- `mcp-complete-tui-surface`: Remove assistant action decision tooling from exposed MCP surface and align assistant interaction UX.

## Impact

- Affected code: assistant service action-state transitions and summaries, TUI assistant panel/input handling, help modal shortcuts, API client contracts, MCP tool registration, OpenAPI path definitions, and assistant tests.
- Affected APIs: removal of decision endpoint and MCP tool; changed assistant interaction contract for clients relying on pending/confirm flow.
- Dependencies/systems: OpenSpec specs for assistant safety/action behavior and TUI/MCP surface definitions.
