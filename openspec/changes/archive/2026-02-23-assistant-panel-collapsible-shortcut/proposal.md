## Why

The TUI assistant currently stays visible at all times, which reduces available space for primary task/project workflows and slows keyboard-driven usage. Adding a shortcut-based collapse/expand flow now improves focus and matches expected power-user behavior while keeping assistant access instant.

## What Changes

- Add a keyboard shortcut to toggle assistant panel visibility (collapse when open, expand when hidden) in the TUI.
- When the assistant panel is collapsed, automatically expand the main content window to consume the freed layout space.
- When the assistant panel is expanded again, restore the split layout so assistant and main content are both visible.
- Ensure the toggle behavior is reflected consistently in shared TUI/UI state so rendering and hotkeys remain predictable.

## Capabilities

### New Capabilities
- `assistant-panel-visibility-toggle`: Keyboard-driven toggle behavior and visibility state for the assistant panel.
- `tui-main-window-auto-expand`: Automatic main-pane layout expansion/restoration when assistant visibility changes.

### Modified Capabilities
- None.

## Impact

- Affected code: TUI layout components, assistant panel container, hotkey handling, and shared UI state/context.
- Affected UX: Keyboard-only users gain faster context switching and more usable screen space.
- APIs/dependencies: No backend API contract changes expected; scope is TUI/frontend interaction behavior.
