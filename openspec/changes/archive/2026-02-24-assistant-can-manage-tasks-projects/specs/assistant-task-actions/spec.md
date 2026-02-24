## ADDED Requirements

### Requirement: Assistant can create and update tasks through validated actions
The system SHALL allow the assistant to execute validated task mutation actions for task creation and task field updates against the canonical task backend services.

#### Scenario: Create task from assistant action
- **WHEN** the assistant emits a valid `create_task` action with required fields
- **THEN** the system creates the task in the same store used by normal task APIs and returns a structured success result containing the created task identifier

#### Scenario: Update task fields from assistant action
- **WHEN** the assistant emits a valid `update_task` action with a target task identifier and supported fields
- **THEN** the system updates only the specified fields via existing task domain logic and returns a structured success result

### Requirement: Assistant task creation supports canonical metadata fields
The system MUST keep assistant-driven task creation metadata support aligned with canonical task metadata fields supported by task repositories and MCP task tools.

#### Scenario: Create task with full metadata payload
- **WHEN** the assistant emits a valid `create_task` action containing required `title` and optional canonical task metadata fields (`projectId`, `parentTaskId`, `notes`, `priority`, `scheduledAt`, `dueAt`, `dueTimezone`, `recurrencePreset`, `recurrenceRRule`)
- **THEN** the system validates and applies the provided fields through existing task domain logic
- **AND** the structured success result references the created task identifier

#### Scenario: Reject invalid task metadata payload on create
- **WHEN** the assistant emits `create_task` with invalid metadata formats or values
- **THEN** the system does not create side effects
- **AND** returns a structured failure result with validation details

### Requirement: Assistant can complete and uncomplete tasks through validated actions
The system MUST support assistant actions that transition task completion state using the same business rules as existing task completion APIs.

#### Scenario: Complete task from assistant action
- **WHEN** the assistant emits a valid `complete_task` action for an existing open task
- **THEN** the system marks the task as completed and returns a structured success result

#### Scenario: Uncomplete task from assistant action
- **WHEN** the assistant emits a valid `uncomplete_task` action for an existing completed task
- **THEN** the system marks the task as open and returns a structured success result

### Requirement: Assistant can set and reschedule task due dates through validated actions
The system SHALL support assistant actions that set or update task due dates/scheduled dates using validated date payloads.

#### Scenario: Set due date on task
- **WHEN** the assistant emits a valid `set_task_due_date` action with a target task identifier and valid due date payload
- **THEN** the system updates the task due date via existing scheduling logic and returns a structured success result

#### Scenario: Reject invalid date payload
- **WHEN** the assistant emits a due-date action with an invalid or unparseable date payload
- **THEN** the system rejects the action, does not mutate task state, and returns a structured failure result with validation details
