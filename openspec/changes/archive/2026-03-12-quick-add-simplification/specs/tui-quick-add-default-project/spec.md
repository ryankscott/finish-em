## MODIFIED Requirements

### Requirement: Quick Add creates task in current project with title only

When the user adds a task via Quick Add (input bar with `a` key), the system SHALL create a task using only the provided title. The task SHALL be created in the currently selected project (or Inbox if no project is selected). The system SHALL NOT parse tokens, dates, priorities, or any other structured data from the input. The system SHALL NOT use AI processing.

#### Scenario: Task created in current project
- **WHEN** a project is selected in the sidebar and the user submits Quick Add input "Buy milk"
- **THEN** the new task is created in the selected project with title "Buy milk"
- **AND** the task has no priority, due date, scheduled date, notes, or recurrence

#### Scenario: Task created in Inbox when no project selected
- **WHEN** no project is selected (or view is not project) and the user submits Quick Add input "Review doc"
- **THEN** the new task is created in Inbox with title "Review doc"

#### Scenario: Input with colons treated as literal title
- **WHEN** the user submits Quick Add input "Discuss auth: login flow"
- **THEN** the new task is created with title exactly "Discuss auth: login flow"
- **AND** no token parsing occurs

## REMOVED Requirements

### Requirement: Quick Add defaults to selected project when no project in input
**Reason**: Superseded by simplified Quick Add behavior. Token parsing is removed entirely.
**Migration**: Use `A` key (Create Task Modal) for specifying different projects or any structured data.

### Requirement: Quick Add token parsing
**Reason**: Token syntax (`project:`, `due:`, `p1`, etc.) removed to simplify mental model.
**Migration**: Use `A` key (Create Task Modal) for setting project, priority, dates, or other fields.

### Requirement: Quick Add AI processing
**Reason**: AI fallback path removed for predictable, consistent behavior.
**Migration**: Use `A` key (Create Task Modal) for detailed task entry with full control.
