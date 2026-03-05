## MODIFIED Requirements

### Requirement: TUI executes domain operations through MCP contracts
The TUI SHALL perform domain mutations and queries through shared in-process domain operations rather than MCP tool/resource contracts or web route interfaces.

#### Scenario: TUI operation uses shared domain pathway
- **WHEN** a user performs a task/project/goal/reminder operation in the TUI
- **THEN** the TUI SHALL invoke the corresponding shared domain operation and render the resulting outcome

### Requirement: TUI handles MCP responses with user-facing parity
The TUI MUST present success and failure feedback based on operation outcomes while preserving existing interaction expectations.

#### Scenario: Operation failure is surfaced in TUI
- **WHEN** a TUI-invoked operation returns an error
- **THEN** the TUI SHALL display an error outcome and SHALL not present the operation as successful

### Requirement: TUI startup validates MCP availability for operation mode
The TUI SHALL validate required local runtime dependencies for operation mode before accepting user commands.

#### Scenario: Required runtime dependency is unavailable during initialization
- **WHEN** the TUI starts and required operation dependencies cannot be initialized
- **THEN** the runtime SHALL fail fast with actionable startup diagnostics
