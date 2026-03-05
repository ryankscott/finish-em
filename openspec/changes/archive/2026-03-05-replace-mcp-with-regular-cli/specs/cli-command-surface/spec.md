## ADDED Requirements

### Requirement: CLI provides regular command-oriented interface
The system SHALL expose a regular command-oriented CLI with stable top-level command groups for task, project, goal, reminder, assistant, settings, and tui operations, rather than protocol-specific tool invocation commands.

#### Scenario: User runs a command group operation
- **WHEN** a user invokes a supported command group subcommand (for example, task list or project create)
- **THEN** the CLI SHALL execute the corresponding domain operation
- **AND** the command SHALL return a deterministic success or failure outcome

### Requirement: CLI output defaults to human-readable format with optional JSON mode
The CLI SHALL emit human-readable output by default for interactive use and SHALL support an optional `--json` flag to emit JSON output for scripting and automation.

#### Scenario: Command runs without JSON flag
- **WHEN** a user runs a CLI command without `--json`
- **THEN** the CLI SHALL render human-readable output suitable for terminal reading

#### Scenario: Command runs with JSON flag
- **WHEN** a user runs a CLI command with `--json`
- **THEN** the CLI SHALL emit valid JSON representing the same operation result
- **AND** the command SHALL preserve non-zero exit behavior for failures

### Requirement: CLI supports discoverability help at root and command scopes
The CLI SHALL provide discoverability via `help`, `-h`, and `--help` at the root level and for each command group and subcommand.

#### Scenario: Root help is requested
- **WHEN** a user runs the CLI with `--help` or `help`
- **THEN** the CLI SHALL display available command groups, common flags, and example usage

#### Scenario: Subcommand help is requested
- **WHEN** a user runs a command group or subcommand with `-h`, `--help`, or `help`
- **THEN** the CLI SHALL display usage, flags, and examples specific to that command scope
