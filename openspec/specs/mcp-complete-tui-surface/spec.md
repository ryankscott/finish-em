## Purpose

Specify MCP surface completeness and semantics parity for all TUI-visible operations.
## Requirements
### Requirement: MCP exposes full TUI functional surface
The system SHALL provide MCP tools/resources that cover all user-visible TUI operations for tasks, projects, goals, reminders, and assistant interactions, excluding deprecated assistant approval/decision operations.

#### Scenario: Task lifecycle operations are available via MCP
- **WHEN** an MCP client requests task create, read, update, complete, uncomplete, or delete operations
- **THEN** the MCP server SHALL execute the operation and return structured success or error responses

#### Scenario: Assistant interaction surface excludes approval decisions
- **WHEN** an MCP client performs assistant interaction operations
- **THEN** the MCP server supports chat/state/history operations aligned with immediate action execution semantics
- **AND** the MCP surface does not require or expose a confirm/cancel decision tool for assistant actions

### Requirement: MCP preserves operation semantics used by TUI
The system MUST keep validation, state transition rules, and error handling consistent between MCP behavior and TUI-visible behavior.

#### Scenario: Invalid mutation returns deterministic validation feedback
- **WHEN** an MCP client submits invalid input for an operation
- **THEN** the MCP response SHALL include validation failure details without applying partial state changes

