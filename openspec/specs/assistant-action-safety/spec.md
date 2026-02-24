## Purpose

Define safety constraints for assistant-triggered mutations.
## Requirements
### Requirement: Assistant mutation execution is restricted to an explicit action allowlist
The system SHALL execute assistant mutations only when the action type is part of a defined allowlist for supported task and project operations.

#### Scenario: Unsupported assistant action type
- **WHEN** the assistant emits an action type not present in the allowlist
- **THEN** the system rejects the action, performs no mutation, and returns a structured failure result explaining that the action is unsupported

### Requirement: Assistant mutation payloads are validated before execution
The system MUST validate required fields, identifier formats, and operation-specific constraints before invoking backend mutation services.

#### Scenario: Missing required payload field
- **WHEN** the assistant emits a supported action missing required fields
- **THEN** the system rejects the action before execution and returns a structured failure result with validation errors

### Requirement: Assistant returns deterministic per-action outcomes for user-visible confirmation
The system SHALL produce normalized per-action outcomes that include action type, target reference (if available), status, and human-readable message suitable for immediate assistant UI feedback without a separate approval step.

#### Scenario: Mixed outcomes in multi-action execution
- **WHEN** a single assistant turn executes multiple actions and at least one action fails
- **THEN** the system returns individual outcomes for each action and a summary that clearly indicates partial success
- **AND** no additional confirm/cancel interaction is required to finalize already-attempted actions

#### Scenario: Successful single action execution
- **WHEN** the assistant executes one valid mutation action successfully
- **THEN** the system returns a success outcome with a concise execution message that can be shown directly in assistant UI

#### Scenario: Decision surface is unavailable
- **WHEN** a client attempts to use a dedicated assistant action approval/decision interface
- **THEN** the system indicates that approval-based action decisions are not part of the supported assistant contract

