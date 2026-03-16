## Why

The TUI sidebar (project list and nav) always occupies horizontal space. Users who want more room for the task list or who prefer a minimal layout have no way to hide it without leaving the app. Adding a keyboard shortcut to collapse and expand the sidebar gives users control over layout and aligns with the existing keyboard-first UX.

## What Changes

- A dedicated keyboard shortcut (preferably `/`) that toggles the sidebar between visible and collapsed from normal TUI interaction contexts.
- Layout behavior so the main content area uses the freed space when the sidebar is collapsed and restores when expanded.
- Help/shortcuts surface updated to document the new keybinding.

## Capabilities

### New Capabilities
- `tui-sidebar-toggle`: The TUI SHALL provide a keyboard shortcut that toggles the sidebar (project list / nav) between visible and collapsed, with layout and shortcut behavior remaining consistent.

### Modified Capabilities
- (none)

## Impact

- **TUI layout**: Sidebar and main content width/visibility; single source of truth for sidebar collapsed state.
- **Key handling**: New binding (e.g. `/`) in the main TUI hotkey layer; ensure no conflict with input bar or other modes.
- **Help/shortcuts**: Document the sidebar toggle in the shortcuts modal or equivalent.
