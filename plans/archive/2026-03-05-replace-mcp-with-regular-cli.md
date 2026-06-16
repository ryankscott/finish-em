# Replace MCP With Regular CLI

_Archived change: `2026-03-05-replace-mcp-with-regular-cli`_

## Summary

The current MCP runtime adds architectural and operational overhead (extra server lifecycle, transport adapters, and MCP-specific contract maintenance) for limited practical value in this codebase. Replacing MCP interop with a regular command-oriented CLI simplifies the system, improves discoverability, and aligns operation flows with a standard developer UX.

## Scope

- **BREAKING** Remove MCP server/runtime and MCP-specific transport and contract layers from the product surface.
- Introduce a regular CLI command surface (modeled after common tools like `gh`) for interop and automation, instead of generic MCP `tool`/JSON-RPC style invocation.
- Add consistent discoverability via `help`, `-h`, and `--help` at root and subcommand levels.
- Keep TUI as a first-class interface while removing MCP coupling from startup and runtime orchestration.
- Update startup/run scripts and tests to reflect CLI + TUI architecture instead of TUI + MCP runtime assumptions.
- Remove MCP-focused dependencies, docs, and stale MCP-specific artifacts.
- Remove MCP server, MCP transport adapters, and MCP-specific runtime wiring.
- Provide a regular subcommand-based CLI for interop and automation.
- Keep TUI functionality intact while decoupling startup from MCP.
- Remove HTTP/OpenAPI surfaces that are no longer needed when CLI replaces MCP interop.
- Preserve domain validation/behavior by reusing existing repositories/services.
- Introducing new domain features beyond parity with existing operations.
- Designing a remote network API for third-party clients in this change.
- Reworking persistence, schema, or assistant model-provider behavior.
- Building a plugin architecture for external extensions.
- Impact: Affected code:
- Impact: MCP implementation and HTTP adapters (`src/utils/mcp-*.ts`, `src/tui/mcp-*.ts`, `src/routes/mcp.ts`, related tests).
- Impact: TUI startup and API adapter selection (`src/tui/main.tsx`, adapter wiring, runtime flags).
- Impact: New CLI command parsing/dispatch and help text flow (new or refactored files under `src/tui` or a dedicated CLI module).
- Impact: Package scripts and dependency graph (`package.json`, lockfile) to remove MCP dependencies and add/adjust CLI entry behavior.
- Impact: Affected behavior:
- Impact: External integration path moves from MCP endpoint/tool invocation to regular CLI command execution.
- Impact: Help/discoverability improves via explicit command help instead of MCP tool discovery.
- Impact: Dependencies/systems:
- Impact: Removes reliance on `@modelcontextprotocol/sdk`.
- Impact: Reduces runtime complexity by removing MCP server lifecycle management and related test surface.
- Related capabilities: `assistant-project-actions`, `assistant-task-actions`, `cli-command-surface`, `mcp-complete-tui-surface`, `project-deletion`, `tui-mcp-consolidated-runtime`, `tui-uses-mcp-contract`

## Notes

- 1. Replace MCP interop with regular CLI commands - Decision: Interop is provided through standard commands/subcommands (for example `finish-em task list`, `finish-em project create`, etc.), not generic `tool call` APIs. - Rationale: Improves UX and script readability, removes JSON-RPC/MCP ceremony, and aligns with user expectation (`gh`-style). - Alternatives considered: - Keep MCP and add CLI wrapper. Rejected: maintains dual surfaces and complexity. - Keep MCP-style `tool` commands in CLI. Rejected: poor ergonomics and discoverability.
- [Risk] Existing integrations that depend on MCP/HTTP break immediately.
- [Risk] CLI command taxonomy becomes inconsistent or too broad.
- [Risk] Silent behavior drift when replacing MCP adapter calls.
- [Risk] Removing OpenAPI may reduce future web/API restart velocity.
- Open questions: - Should CLI default output be human-readable with optional `--json`, or JSON-first with formatting flags? - Which command groups are required in v1 of the CLI interop surface versus phase 2? - Do we support shell completion in this change, or defer to a follow-up?

## Implementation Phases

1. CLI Foundation
   - [done] Add a root CLI command dispatcher that preserves default TUI startup when no subcommand is provided
   - [done] Define top-level command groups (`task`, `project`, `goal`, `reminder`, `assistant`, `settings`, `tui`) with stable parsing and routing
   - [done] Implement root and scoped help output for `help`, `-h`, and `--help` with examples
   - [done] Implement default human-readable command output formatting and an optional `--json` flag for machine-readable output
   - [done] Standardize CLI exit code behavior for success, validation failures, and runtime errors
2. Domain Wiring and Operation Parity
   - [done] Add command handlers for task lifecycle operations (list/create/update/complete/uncomplete/delete) using shared domain services
   - [done] Add command handlers for project operations (list/create/update/delete) using shared domain services
   - [done] Add command handlers for goal and reminder operations using shared domain services
   - [done] Add command handlers for assistant state/chat/history operations using shared domain services
   - [done] Ensure CLI and TUI pathways both use shared in-process domain logic with no MCP transport dependency
3. Remove MCP and HTTP/OpenAPI Surfaces
   - [done] Remove MCP runtime wiring from TUI startup (MCP flags, server bootstrap, MCP adapter wiring)
   - [done] Remove MCP implementation modules and MCP-only tests (`src/utils/mcp-*`, `src/tui/mcp-*`, `src/routes/mcp.ts`, and related tests)
   - [done] Remove HTTP/OpenAPI handler modules and references from supported runtime surfaces
   - [done] Remove MCP/OpenAPI-related scripts and dependencies from `package.json` and update lockfiles
   - [done] Remove stale MCP artifacts and references from docs and code comments
4. Validation and Regression Coverage
   - [done] Add CLI integration tests for representative task/project/goal/reminder/assistant operations in default output mode
   - [done] Add CLI integration tests for `--json` output mode and structured failure outputs
   - [done] Add help/usage tests for root and subcommand `help`, `-h`, and `--help`
   - [done] Add regression tests for project deletion semantics (task reassignment, inbox protection, missing target behavior) via CLI and TUI direct pathways
   - [done] Run full test suite and resolve regressions caused by MCP/HTTP/OpenAPI removals
5. Documentation and Migration
   - [done] Update README and developer docs to describe CLI-first interop and human-readable default output with optional `--json`
   - [done] Document breaking changes and migration guidance from MCP/HTTP/OpenAPI usage to CLI commands
   - [done] Update operational scripts and examples to use new CLI commands
   - [done] Verify the planning artifacts are internally consistent (proposal/design/specs/tasks) and ready for implementation
