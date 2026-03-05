## MODIFIED Requirements

### Requirement: Assistant project creation supports canonical metadata fields
The system MUST keep assistant-driven project creation metadata support aligned with canonical project metadata fields supported by project repositories and shared domain operation handlers.

#### Scenario: Create project with full metadata payload
- **WHEN** the assistant emits a valid `create_project` action containing `name` and optional canonical metadata fields (`emoji`, `description`, `startAt`, `endAt`, `color`, `isInbox`)
- **THEN** the system validates and applies the provided fields through existing project domain logic
- **AND** the structured success result references the created project identifier

#### Scenario: Reject invalid metadata payload on create
- **WHEN** the assistant emits `create_project` with invalid date or field value formats
- **THEN** the system does not create side effects
- **AND** returns a structured failure result with validation details
