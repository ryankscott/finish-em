## MODIFIED Requirements

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
