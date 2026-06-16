# TUI E Key Text Edit

## Summary

Define the `e` key behavior for text-only editing of the primary text field of the focused item (task title, project name, or goal title) in the TUI.

## Current Rules

- e key edits task title only: When focus is on the task list and a task is selected, the TUI SHALL treat the `e` key as "edit task title only." The system SHALL enter a text-edit mode with the current task title as the initial value and SHALL NOT open a field picker or any multi-field edit flow.
- e key edits project name only: When focus is on the sidebar with a project selected (project view), the TUI SHALL treat the `e` key as "edit project name only." The system SHALL enter a text-edit mode with the current project name as the initial value and SHALL NOT open a project field picker or any multi-field edit flow.
- e key edits goal title only: When focus is on the goals panel (or goals in upcoming view) with a goal selected, the TUI SHALL treat the `e` key as "edit goal title only." The system SHALL enter a text-edit mode with the current goal title as the initial value.
- Help and hints describe e as text-only edit: The TUI SHALL document the `e` key in help and inline hints as editing the primary text only (task title, project name, or goal title) depending on context, and SHALL NOT describe `e` as opening a field picker for tasks or projects.

## Related History

- `2026-03-05-e-key-edit-task-text-only` -> `archive/2026-03-05-e-key-edit-task-text-only.md`
