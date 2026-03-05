## Purpose

Define soft-delete semantics for tasks and the TUI Deleted view that allows users to browse and restore deleted tasks.

## Requirements

### Requirement: Deleted tasks are soft-deleted and recoverable
The system SHALL soft-delete tasks by setting a `deleted_at` timestamp instead of removing rows, so deleted tasks can be listed and restored.

#### Scenario: Soft-delete preserves task data
- **WHEN** a user presses `d` on a selected task
- **THEN** the task's `deleted_at` is set to the current timestamp
- **AND** the task disappears from all non-deleted views (today, inbox, upcoming, completed, project)
- **AND** the task's title, notes, project, and all other metadata are fully preserved

#### Scenario: Soft-delete cascades to subtasks
- **WHEN** a user presses `d` on a parent task that has subtasks
- **THEN** all subtasks are also soft-deleted in the same operation
- **AND** all subtasks disappear from their respective views

### Requirement: TUI provides a Deleted view in the sidebar
The TUI SHALL include a "Deleted" entry in the sidebar navigation that shows all soft-deleted tasks.

#### Scenario: Navigate to Deleted view
- **WHEN** the user selects "Deleted" in the sidebar
- **THEN** the task panel displays all soft-deleted tasks sorted by `deleted_at` descending (most recently deleted first)
- **AND** the sidebar badge shows the count of deleted tasks

#### Scenario: Deleted view is empty when no tasks are deleted
- **WHEN** there are no soft-deleted tasks
- **THEN** the Deleted view shows an empty task list

### Requirement: User can undelete a task from the Deleted view
The TUI SHALL allow users to restore a soft-deleted task by pressing `u` while the task is selected in the Deleted view.

#### Scenario: Undelete restores a task to its original project
- **WHEN** the user is in the Deleted view, selects a task, and presses `u`
- **THEN** the task's `deleted_at` is cleared
- **AND** the task reappears in its original project and status-based views
- **AND** a toast notification confirms "Task restored"

#### Scenario: Undelete restores subtasks of a restored parent
- **WHEN** the user undeletes a parent task that has soft-deleted subtasks
- **THEN** all subtasks belonging to that parent are also undeleted in the same operation

#### Scenario: Undelete restores parent when undeleting an orphaned subtask
- **WHEN** the user undeletes a subtask whose parent is also soft-deleted
- **THEN** the parent task is also undeleted
- **AND** both the subtask and its parent reappear in their original views

#### Scenario: `u` key is a no-op outside the Deleted view
- **WHEN** the user presses `u` while in any view other than "Deleted"
- **THEN** no action is taken
