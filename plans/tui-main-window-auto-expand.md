# TUI Main Window Auto Expand

## Summary

Define main-pane layout expansion/restoration behavior when assistant panel visibility changes in the TUI.

## Current Rules

- Main window expands when assistant panel is collapsed: When the assistant panel is hidden, the TUI main window SHALL automatically expand to use the full available width previously shared with the assistant pane.
- Main window returns to split layout when assistant panel is expanded: When the assistant panel is shown again, the TUI MUST restore a layout that includes both main window and assistant panel.

## Related History

- `2026-02-23-assistant-panel-collapsible-shortcut` -> `archive/2026-02-23-assistant-panel-collapsible-shortcut.md`
