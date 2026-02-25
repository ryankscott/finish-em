## Purpose

Define assistant capabilities for project create/update actions with validated payloads.
## Requirements
### Requirement: Assistant can create projects through validated actions
The system SHALL allow the assistant to execute a validated `create_project` action that creates a project using the same backend project service and persistence model as standard project APIs, with execution occurring in the same assistant turn and no approval decision step.

#### Scenario: Create project from assistant action
- **WHEN** the assistant emits a valid `create_project` action with required project attributes
- **THEN** the system creates the project and returns a structured success result containing the project identifier
- **AND** no dedicated confirm/cancel operation is required to finalize the action

### Requirement: Assistant project creation supports canonical metadata fields
The system MUST keep assistant-driven project creation metadata support aligned with canonical project metadata fields supported by project repositories and MCP project tools.

#### Scenario: Create project with full metadata payload
- **WHEN** the assistant emits a valid `create_project` action containing `name` and optional canonical metadata fields (`emoji`, `description`, `startAt`, `endAt`, `color`, `isInbox`)
- **THEN** the system validates and applies the provided fields through existing project domain logic
- **AND** the structured success result references the created project identifier

#### Scenario: Reject invalid metadata payload on create
- **WHEN** the assistant emits `create_project` with invalid date or field value formats
- **THEN** the system does not create side effects
- **AND** returns a structured failure result with validation details

### Requirement: Assistant can update supported project metadata through validated actions
The system MUST allow assistant-driven updates for supported project metadata fields (such as name and color) through validated action payloads.

#### Scenario: Update project metadata from assistant action
- **WHEN** the assistant emits a valid `update_project` action with an existing project identifier and supported metadata updates
- **THEN** the system applies the updates through existing project domain logic and returns a structured success result

#### Scenario: Reject update for non-existent project
- **WHEN** the assistant emits an `update_project` action for a project identifier that does not exist
- **THEN** the system does not create side effects and returns a structured failure result indicating missing target project

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

