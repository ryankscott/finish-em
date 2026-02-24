## Purpose

Define the consolidated runtime behavior where TUI and MCP server run together on a shared backend.

## Requirements

### Requirement: TUI and MCP server start in one process runtime
The system SHALL initialize a single runtime that starts the TUI and MCP server within the same process lifecycle.

#### Scenario: Default startup launches TUI and MCP together
- **WHEN** the user starts the application with the default runtime command
- **THEN** the TUI SHALL render and the MCP server SHALL be started in the same process

### Requirement: Consolidated runtime shares one domain backend
The system MUST ensure TUI and MCP operations use the same domain services and persistence layer instance for consistent behavior.

#### Scenario: State changed through one interface is visible to the other
- **WHEN** a task is created or updated via either TUI or MCP
- **THEN** subsequent reads through both interfaces SHALL reflect the same persisted state

### Requirement: Consolidated runtime lifecycle is coordinated
The system SHALL coordinate startup failure and shutdown behavior across TUI and MCP components.

#### Scenario: Runtime startup fails if required component initialization fails
- **WHEN** either TUI bootstrapping or MCP bootstrapping fails during startup
- **THEN** the runtime SHALL exit with a non-success status and SHALL surface the initialization error
