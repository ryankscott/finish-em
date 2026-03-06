## ADDED Requirements

### Requirement: Overdue view is accessible from the sidebar
The system SHALL provide an "Overdue" nav item in the sidebar that navigates to the overdue task list when selected.

#### Scenario: User selects Overdue in sidebar
- **WHEN** the user navigates to and selects the "Overdue" sidebar item
- **THEN** the task panel SHALL display only open tasks whose due date is strictly before the start of the current day
- **AND** the status bar SHALL display "Overdue"

#### Scenario: Overdue item shows task count badge
- **WHEN** the sidebar is rendered
- **THEN** the "Overdue" item SHALL display a count badge reflecting the number of overdue open tasks
- **AND** the count SHALL update each time data is reloaded

### Requirement: Overdue view displays tasks sorted by due date ascending
The system SHALL sort overdue tasks by due date ascending so the most overdue tasks appear first.

#### Scenario: Multiple overdue tasks are shown
- **WHEN** there are multiple open tasks with due dates before today
- **THEN** the task list SHALL display them ordered from earliest due date to latest

### Requirement: Overdue view excludes completed and deleted tasks
The system SHALL exclude completed tasks and soft-deleted tasks from the overdue view.

#### Scenario: Completed task is not shown as overdue
- **WHEN** a task has a due date in the past and status "completed"
- **THEN** the task SHALL NOT appear in the Overdue view

#### Scenario: Deleted task is not shown as overdue
- **WHEN** a task has a due date in the past and has been soft-deleted
- **THEN** the task SHALL NOT appear in the Overdue view

### Requirement: Overdue view shows empty state when no tasks are overdue
The system SHALL display an empty state in the task panel when there are no overdue tasks.

#### Scenario: No overdue tasks exist
- **WHEN** all open tasks are due today or in the future, or there are no tasks
- **THEN** the task panel SHALL display the standard empty state message
