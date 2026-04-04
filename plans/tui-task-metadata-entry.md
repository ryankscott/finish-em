# TUI Task Metadata Entry

## Summary

Define tokenized metadata entry and autocomplete behavior for TUI task creation.

## Current Rules

- TUI task deletion is soft and reversible: The TUI MUST soft-delete tasks (set `deleted_at`) rather than permanently removing them, so users can recover accidentally deleted tasks.
- TUI supports `u` hotkey to undelete a task: The TUI SHALL bind the `u` key to restore the selected task when the current view is "deleted".
- TUI task creation supports metadata token entry: The TUI SHALL support task creation via tokenized metadata input so users can provide task metadata fields in a single keyboard-first flow.
- TUI provides autocomplete for task metadata tokens: The TUI MUST provide inline autocomplete suggestions for recognized task metadata tokens to reduce syntax errors and omission.
- TUI validates required task metadata before create: The TUI MUST block submission when required task metadata is missing or invalid and present actionable validation feedback.

## Related History

- `2026-02-24-assistant-can-manage-tasks-projects` -> `archive/2026-02-24-assistant-can-manage-tasks-projects.md`
- `2026-03-04-date-editor-calendar-picker` -> `archive/2026-03-04-date-editor-calendar-picker.md`
- `2026-03-05-deleted-tasks-undelete` -> `archive/2026-03-05-deleted-tasks-undelete.md`
