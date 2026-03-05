## Purpose

Define reminder presence and timing indicators shown on task rows in the TUI task list.

## Requirements

### Requirement: Task rows show reminder presence in collapsed state
The TUI task list SHALL render reminder presence on collapsed task rows with a bell indicator.

#### Scenario: Show bell icon for task with reminder in collapsed row
- **WHEN** a task has an active reminder and the task row is collapsed
- **THEN** the task row displays a bell indicator
- **AND** the collapsed row omits detailed reminder timestamp text

### Requirement: Expanded task rows show reminder time details
The TUI task list SHALL render reminder timing details on expanded task rows.

#### Scenario: Show bell and reminder timestamp in expanded row
- **WHEN** a task has an active reminder and the task row is expanded
- **THEN** the task row displays a bell indicator and reminder timestamp text
- **AND** the timestamp is formatted in local timezone

#### Scenario: Omit reminder detail text when no reminder exists
- **WHEN** a task has no active reminder and the task row is expanded
- **THEN** the task row does not display reminder detail text
