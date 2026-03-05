## Purpose

Define project deletion via CLI and TUI: semantics (reassign tasks to inbox, forbid deleting inbox), success/failure outcomes, and exposure on CLI command surface and TUI API direct implementation.

## Requirements

### Requirement: API allows deleting a non-inbox project
The system SHALL allow callers to delete a project by id via supported local operation surfaces (CLI command surface and TUI API direct implementation). Deletion SHALL reassign the project's tasks to the inbox and then remove the project. Only non-inbox projects MAY be deleted.

#### Scenario: Delete project via supported operation surface
- **WHEN** the caller requests deletion of an existing non-inbox project by id
- **THEN** the system reassigns all tasks in that project to the inbox
- **AND** the project is removed
- **AND** the caller receives a success outcome

#### Scenario: Delete request for missing project
- **WHEN** the caller requests deletion for a project id that does not exist
- **THEN** the system performs no changes
- **AND** the caller receives a not-found outcome

#### Scenario: Delete request for inbox project
- **WHEN** the caller requests deletion of the inbox project
- **THEN** the system performs no changes
- **AND** the caller receives a failure outcome indicating the inbox cannot be deleted

### Requirement: TUI API exposes project delete
The system SHALL expose `deleteProject(projectId)` on the TUI API direct implementation, and CLI project deletion commands SHALL map to the same domain semantics.

#### Scenario: deleteProject succeeds for non-inbox project
- **WHEN** the TUI calls `deleteProject(projectId)` for an existing non-inbox project
- **THEN** the project is deleted and its tasks reassigned to inbox
- **AND** the returned promise resolves

#### Scenario: deleteProject fails for missing or inbox project
- **WHEN** the TUI calls `deleteProject(projectId)` for a non-existent project or the inbox
- **THEN** the returned promise rejects (or throws) with an appropriate error

#### Scenario: CLI delete project follows same semantics
- **WHEN** a caller runs the CLI project deletion command for an existing non-inbox project
- **THEN** the project is deleted and its tasks are reassigned to inbox
- **AND** missing or inbox targets return failure outcomes without side effects
