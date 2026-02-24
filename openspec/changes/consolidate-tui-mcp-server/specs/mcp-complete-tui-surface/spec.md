## ADDED Requirements

### Requirement: MCP exposes full TUI functional surface
The system SHALL provide MCP tools/resources that cover all user-visible TUI operations for tasks, projects, goals, and reminders.

#### Scenario: Task lifecycle operations are available via MCP
- **WHEN** an MCP client requests task create, read, update, complete, uncomplete, or delete operations
- **THEN** the MCP server SHALL execute the operation and return structured success or error responses

#### Scenario: Project, goal, and reminder operations are available via MCP
- **WHEN** an MCP client requests project, goal, or reminder operations available in TUI
- **THEN** the MCP server SHALL provide equivalent capability and outcome semantics

### Requirement: MCP preserves operation semantics used by TUI
The system MUST keep validation, state transition rules, and error handling consistent between MCP behavior and TUI-visible behavior.

#### Scenario: Invalid mutation returns deterministic validation feedback
- **WHEN** an MCP client submits invalid input for an operation
- **THEN** the MCP response SHALL include validation failure details without applying partial state changes
