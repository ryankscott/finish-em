## ADDED Requirements

### Requirement: API allows deleting a non-inbox project
The system SHALL allow callers to delete a project by id via the same API surfaces that support project create and update (OpenAPI, TUI API direct and MCP-backed). Deletion SHALL reassign the project's tasks to the inbox and then remove the project. Only non-inbox projects MAY be deleted.

#### Scenario: Delete project via API
- **WHEN** the caller requests deletion of an existing non-inbox project by id
- **THEN** the system reassigns all tasks in that project to the inbox
- **AND** the project is removed
- **AND** the caller receives a success outcome (e.g. HTTP 204 or resolved promise)

#### Scenario: Delete request for missing project
- **WHEN** the caller requests deletion for a project id that does not exist
- **THEN** the system performs no changes
- **AND** the caller receives a not-found outcome (e.g. HTTP 404 or thrown error)

#### Scenario: Delete request for inbox project
- **WHEN** the caller requests deletion of the inbox project
- **THEN** the system performs no changes
- **AND** the caller receives a failure outcome indicating the inbox cannot be deleted (e.g. HTTP 400/403 or thrown error)

### Requirement: OpenAPI exposes project delete
The system SHALL expose `DELETE /api/projects/{projectId}` with responses consistent with project-deletion semantics (success, not found, inbox protected).

#### Scenario: DELETE returns 204 when project is deleted
- **WHEN** a client sends `DELETE /api/projects/{projectId}` for an existing non-inbox project
- **THEN** the server responds with 204 No Content after deleting the project

#### Scenario: DELETE returns 404 for missing or inbox project
- **WHEN** a client sends `DELETE /api/projects/{projectId}` for a non-existent project or the inbox project id
- **THEN** the server responds with 404 Not Found and no side effects

### Requirement: TUI API exposes project delete
The system SHALL expose `deleteProject(projectId)` on the TUI API (direct and MCP-backed implementations) that resolves on success and throws or rejects on failure (not found or inbox).

#### Scenario: deleteProject succeeds for non-inbox project
- **WHEN** the TUI calls `deleteProject(projectId)` for an existing non-inbox project
- **THEN** the project is deleted and its tasks reassigned to inbox
- **AND** the returned promise resolves

#### Scenario: deleteProject fails for missing or inbox project
- **WHEN** the TUI calls `deleteProject(projectId)` for a non-existent project or the inbox
- **THEN** the returned promise rejects (or throws) with an appropriate error
