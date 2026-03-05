## Purpose

Define the runtime behavior where the TUI and CLI command execution run on a shared domain backend without requiring an MCP server.

## Requirements

### Requirement: TUI and MCP server start in one process runtime
The system SHALL initialize a single runtime entrypoint that supports TUI startup without requiring MCP server startup.

#### Scenario: Default startup launches TUI without MCP server
- **WHEN** the user starts the application with the default runtime command
- **THEN** the TUI SHALL render in the same process
- **AND** no MCP server bootstrap SHALL be required

### Requirement: Consolidated runtime shares one domain backend
The system MUST ensure TUI and CLI command operations use the same domain services and persistence layer instance for consistent behavior.

#### Scenario: State changed through one interface is visible to the other
- **WHEN** a task is created or updated via either TUI or CLI command execution
- **THEN** subsequent reads through both interfaces SHALL reflect the same persisted state

### Requirement: Consolidated runtime lifecycle is coordinated
The system SHALL coordinate startup failure and shutdown behavior across TUI and CLI runtime components.

#### Scenario: Runtime startup fails if required component initialization fails
- **WHEN** either TUI bootstrapping or CLI runtime bootstrapping fails during startup
- **THEN** the runtime SHALL exit with a non-success status and SHALL surface the initialization error
