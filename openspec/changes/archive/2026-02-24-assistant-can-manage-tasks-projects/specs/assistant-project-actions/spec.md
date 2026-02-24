## ADDED Requirements

### Requirement: Assistant can create projects through validated actions
The system SHALL allow the assistant to execute a validated `create_project` action that creates a project using the same backend project service and persistence model as standard project APIs.

#### Scenario: Create project from assistant action
- **WHEN** the assistant emits a valid `create_project` action with required project attributes
- **THEN** the system creates the project and returns a structured success result containing the project identifier

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
