## Purpose

Define that TUI domain operations are executed through MCP contracts with user-visible parity.

## Requirements

### Requirement: TUI executes domain operations through MCP contracts
The TUI SHALL perform domain mutations and queries through MCP tool/resource contracts rather than web route interfaces.

#### Scenario: TUI operation uses MCP pathway
- **WHEN** a user performs a task/project/goal/reminder operation in the TUI
- **THEN** the TUI SHALL invoke the corresponding MCP contract and render the resulting outcome

### Requirement: TUI handles MCP responses with user-facing parity
The TUI MUST present success and failure feedback based on MCP responses while preserving existing interaction expectations.

#### Scenario: MCP operation failure is surfaced in TUI
- **WHEN** an MCP-invoked operation returns an error
- **THEN** the TUI SHALL display an error outcome and SHALL not present the operation as successful

### Requirement: TUI startup validates MCP availability for operation mode
The TUI SHALL validate MCP runtime availability for MCP-backed operation mode before accepting user commands.

#### Scenario: MCP is unavailable during runtime initialization
- **WHEN** the TUI starts and MCP contract execution cannot be initialized
- **THEN** the runtime SHALL fail fast with actionable startup diagnostics
