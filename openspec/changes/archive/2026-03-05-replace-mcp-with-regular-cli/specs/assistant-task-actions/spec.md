## MODIFIED Requirements

### Requirement: Assistant task creation supports canonical metadata fields
The system MUST keep assistant-driven task creation metadata support aligned with canonical task metadata fields supported by task repositories and shared domain operation handlers.

#### Scenario: Create task with full metadata payload
- **WHEN** the assistant emits a valid `create_task` action containing required `title` and optional canonical task metadata fields (`projectId`, `parentTaskId`, `notes`, `priority`, `scheduledAt`, `dueAt`, `dueTimezone`, `recurrencePreset`, `recurrenceRRule`)
- **THEN** the system validates and applies the provided fields through existing task domain logic
- **AND** the structured success result references the created task identifier

#### Scenario: Reject invalid task metadata payload on create
- **WHEN** the assistant emits `create_task` with invalid metadata formats or values
- **THEN** the system does not create side effects
- **AND** returns a structured failure result with validation details
