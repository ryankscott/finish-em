# TUI Create Task Modal

## Summary

Spec for the full-form Create Task modal (`A` key) that allows users to enter all task attributes in a single keyboard-driven flow.

## Current Rules

- TUI provides a full-form modal for task creation: The TUI SHALL provide a multi-field create modal, triggered by `A` from any view, that presents all task attributes in a single keyboard-driven flow and creates the task on submission.
- Create Task modal exposes all task fields: The `CreateTaskModal` SHALL present all task fields — title, project, priority, due date, scheduled date, recurrence, and notes — in a single scrollable form.
- Create Task modal supports keyboard navigation between fields: The TUI SHALL allow the user to move between modal fields using `j`/`k` or `Tab`/`Shift+Tab`.
- Create Task modal supports direct text entry on text fields: The TUI SHALL allow the user to type directly into text fields (Title, Due date, Scheduled date, Notes) using the existing text-input keybinding system.
- Create Task modal uses EnumPicker for enum fields: The TUI SHALL open the existing `EnumPicker` when the user confirms on an enum field (Project, Priority, Recurrence).
- Create Task modal validates required fields before submission: The TUI SHALL block task creation if the Title field is empty and indicate the error inline.
- Create Task modal submits and dismisses on successful creation: The TUI SHALL create the task with all collected field values when the user submits from the "Create Task" row (or presses `Enter` on the Notes field).

## Related History

- `2026-03-10-create-task-project-modals` -> `archive/2026-03-10-create-task-project-modals.md`
