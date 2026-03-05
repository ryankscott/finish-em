## 1. CLI Foundation

- [x] 1.1 Add a root CLI command dispatcher that preserves default TUI startup when no subcommand is provided
- [x] 1.2 Define top-level command groups (`task`, `project`, `goal`, `reminder`, `assistant`, `settings`, `tui`) with stable parsing and routing
- [x] 1.3 Implement root and scoped help output for `help`, `-h`, and `--help` with examples
- [x] 1.4 Implement default human-readable command output formatting and an optional `--json` flag for machine-readable output
- [x] 1.5 Standardize CLI exit code behavior for success, validation failures, and runtime errors

## 2. Domain Wiring and Operation Parity

- [x] 2.1 Add command handlers for task lifecycle operations (list/create/update/complete/uncomplete/delete) using shared domain services
- [x] 2.2 Add command handlers for project operations (list/create/update/delete) using shared domain services
- [x] 2.3 Add command handlers for goal and reminder operations using shared domain services
- [x] 2.4 Add command handlers for assistant state/chat/history operations using shared domain services
- [x] 2.5 Ensure CLI and TUI pathways both use shared in-process domain logic with no MCP transport dependency

## 3. Remove MCP and HTTP/OpenAPI Surfaces

- [x] 3.1 Remove MCP runtime wiring from TUI startup (MCP flags, server bootstrap, MCP adapter wiring)
- [x] 3.2 Remove MCP implementation modules and MCP-only tests (`src/utils/mcp-*`, `src/tui/mcp-*`, `src/routes/mcp.ts`, and related tests)
- [x] 3.3 Remove HTTP/OpenAPI handler modules and references from supported runtime surfaces
- [x] 3.4 Remove MCP/OpenAPI-related scripts and dependencies from `package.json` and update lockfiles
- [x] 3.5 Remove stale MCP artifacts and references from docs and code comments

## 4. Validation and Regression Coverage

- [x] 4.1 Add CLI integration tests for representative task/project/goal/reminder/assistant operations in default output mode
- [x] 4.2 Add CLI integration tests for `--json` output mode and structured failure outputs
- [x] 4.3 Add help/usage tests for root and subcommand `help`, `-h`, and `--help`
- [x] 4.4 Add regression tests for project deletion semantics (task reassignment, inbox protection, missing target behavior) via CLI and TUI direct pathways
- [x] 4.5 Run full test suite and resolve regressions caused by MCP/HTTP/OpenAPI removals

## 5. Documentation and Migration

- [x] 5.1 Update README and developer docs to describe CLI-first interop and human-readable default output with optional `--json`
- [x] 5.2 Document breaking changes and migration guidance from MCP/HTTP/OpenAPI usage to CLI commands
- [x] 5.3 Update operational scripts and examples to use new CLI commands
- [x] 5.4 Verify OpenSpec artifacts are internally consistent (proposal/design/specs/tasks) and ready for implementation
