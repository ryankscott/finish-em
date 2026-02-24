## MODIFIED Requirements

### Requirement: Assistant can create and update tasks through validated actions
The system SHALL allow the assistant to execute validated task mutation actions for task creation and task field updates against the canonical task backend services, and execute those actions in the same assistant turn without a confirm/cancel approval step.

#### Scenario: Create task from assistant action
- **WHEN** the assistant emits a valid `create_task` action with required fields
- **THEN** the system creates the task in the same store used by normal task APIs and returns a structured success result containing the created task identifier
- **AND** no follow-up approval action is required for execution

#### Scenario: Update task fields from assistant action
- **WHEN** the assistant emits a valid `update_task` action with a target task identifier and supported fields
- **THEN** the system updates only the specified fields via existing task domain logic and returns a structured success result
- **AND** execution feedback is returned as part of the same assistant interaction
