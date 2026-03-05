## REMOVED Requirements

### Requirement: MCP exposes full TUI functional surface
**Reason**: MCP is being retired as an interop surface in favor of a regular CLI command surface.
**Migration**: Use CLI command groups for task/project/goal/reminder/assistant operations, with `--json` for machine-readable output.

### Requirement: MCP preserves operation semantics used by TUI
**Reason**: Semantics parity is no longer defined through MCP contracts.
**Migration**: Validate parity between CLI command execution and TUI-visible behavior through shared domain operation requirements.

## ADDED Requirements

### Requirement: CLI exposes full interop surface for TUI-visible operations
The system SHALL provide CLI commands that cover all user-visible operational domains used by the TUI for tasks, projects, goals, reminders, and assistant interactions.

#### Scenario: Task lifecycle operations are available via CLI
- **WHEN** a caller executes task create, read, update, complete, uncomplete, or delete through CLI commands
- **THEN** the CLI SHALL execute the operation and return structured success or error outcomes

#### Scenario: Assistant interaction operations are available via CLI
- **WHEN** a caller executes assistant interaction operations through CLI commands
- **THEN** the system SHALL support chat/state/history operations aligned with immediate action execution semantics

### Requirement: CLI interop preserves operation semantics used by TUI
The system MUST keep validation, state transition rules, and error handling consistent between CLI behavior and TUI-visible behavior.

#### Scenario: Invalid mutation returns deterministic validation feedback
- **WHEN** a caller submits invalid input for an operation through CLI commands
- **THEN** the CLI response SHALL include validation failure details without applying partial state changes
