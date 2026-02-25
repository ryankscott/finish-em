## ADDED Requirements

### Requirement: Assistant can delete projects through validated actions
The system SHALL allow the assistant to execute a validated `delete_project` action that deletes a non-inbox project using the same backend project repository as standard project APIs, with execution occurring in the same assistant turn and no approval decision step. Tasks belonging to the project SHALL be reassigned to the inbox before the project is removed.

#### Scenario: Delete project from assistant action
- **WHEN** the assistant emits a valid `delete_project` action with an existing non-inbox project identifier
- **THEN** the system reassigns the project's tasks to the inbox, deletes the project, and returns a structured success result
- **AND** no dedicated confirm/cancel operation is required to finalize the action

#### Scenario: Reject delete for non-existent project
- **WHEN** the assistant emits a `delete_project` action for a project identifier that does not exist
- **THEN** the system does not create side effects and returns a structured failure result indicating the target project was not found

#### Scenario: Reject delete for inbox project
- **WHEN** the assistant emits a `delete_project` action for the inbox project identifier
- **THEN** the system does not create side effects and returns a structured failure result indicating the inbox cannot be deleted
