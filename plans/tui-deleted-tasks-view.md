# TUI Deleted Tasks View

## Summary

Define soft-delete semantics for tasks and the TUI Deleted view that allows users to browse and restore deleted tasks.

## Current Rules

- Deleted tasks are soft-deleted and recoverable: The system SHALL soft-delete tasks by setting a `deleted_at` timestamp instead of removing rows, so deleted tasks can be listed and restored.
- TUI provides a Deleted view in the sidebar: The TUI SHALL include a "Deleted" entry in the sidebar navigation that shows all soft-deleted tasks.
- User can undelete a task from the Deleted view: The TUI SHALL allow users to restore a soft-deleted task by pressing `u` while the task is selected in the Deleted view.

## Related History

- `2026-03-05-deleted-tasks-undelete` -> `archive/2026-03-05-deleted-tasks-undelete.md`
