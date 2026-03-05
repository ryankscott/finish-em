## MODIFIED Requirements

### Requirement: TUI task deletion is soft and reversible
The TUI MUST soft-delete tasks (set `deleted_at`) rather than permanently removing them, so users can recover accidentally deleted tasks.

#### Scenario: Pressing `d` soft-deletes the selected task
- **WHEN** the user presses `d` on a selected task in any non-deleted view
- **THEN** the task is soft-deleted (removed from current view) without permanent data loss
- **AND** the task appears in the Deleted view

#### Scenario: `d` key shows status confirmation
- **WHEN** the user presses `d` on a selected task
- **THEN** the status bar displays "Task deleted"
- **AND** the task list refreshes

## ADDED Requirements

### Requirement: TUI supports `u` hotkey to undelete a task
The TUI SHALL bind the `u` key to restore the selected task when the current view is "deleted".

#### Scenario: `u` restores the selected deleted task
- **WHEN** the user is in the Deleted view and presses `u` with a task selected
- **THEN** the selected task is removed from the Deleted view
- **AND** the task is restored to its original project/status view
- **AND** a toast notification "Task restored" is shown

#### Scenario: `u` is inactive in non-deleted views
- **WHEN** the user presses `u` while in Today, Inbox, Upcoming, Completed, or a Project view
- **THEN** no action occurs
