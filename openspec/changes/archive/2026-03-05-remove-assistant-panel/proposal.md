## Why

The in-TUI assistant panel adds UI and interaction complexity that overlaps with stronger external AI workflows. We want to remove embedded assistant usage from the TUI and standardize assistant-driven workflows through external tools like Claude Code and Cursor.

## What Changes

- Remove the assistant panel from the TUI layout and remove its visibility toggle behavior.
- Remove assistant-specific interaction flows from the TUI runtime, including assistant session UI surfaces and panel-driven controls.
- Remove in-app assistant action execution pathways tied to the TUI assistant experience.
- Keep task/project management accessible through existing non-assistant TUI flows and external tool integrations.
- **BREAKING**: Users can no longer interact with an assistant directly inside the TUI.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `assistant-panel-visibility-toggle`: Remove assistant panel visibility requirements and shortcut-driven panel toggling from the TUI runtime.
- `assistant-project-actions`: Remove or redefine in-app assistant project mutation behavior so it no longer depends on a TUI assistant interaction surface.
- `assistant-task-actions`: Remove or redefine in-app assistant task mutation behavior so it no longer depends on a TUI assistant interaction surface.
- `assistant-action-safety`: Update assistant safety/feedback requirements to remove assumptions about immediate in-TUI assistant UI feedback and decision surfaces.

## Impact

- Affected code: TUI layout composition, keymap/shortcut handling, assistant UI components, assistant turn/action execution plumbing, and related tests.
- Affected behavior: assistant-driven flows are no longer available in the TUI; users perform assistant workflows through external tools.
- Affected integrations: any internal contract that assumes a TUI assistant surface must be updated or removed.
