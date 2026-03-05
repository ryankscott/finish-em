## Context

The current runtime carries MCP-specific abstractions (tool registry, MCP server wrapper, request handler, MCP HTTP server startup) while the TUI already runs in-process against shared repositories/services. This creates extra moving parts without delivering enough value for this codebase's intended usage. The new direction is to replace MCP interoperability with a regular command-oriented CLI and remove transport layers that exist primarily to host MCP.

Current constraints and realities:
- Domain behavior lives in `src/server/repos/**` and `src/server/services/**` and should remain the canonical implementation layer.
- The TUI currently uses an MCP adapter and starts an MCP HTTP server by default.
- Existing specs encode MCP assumptions and must be updated to prevent contract drift.
- Users want `gh`-style discoverability with `help`, `-h`, and `--help`.

Stakeholders:
- Local TUI users.
- Automation users invoking commands in scripts.
- Maintainers reducing architectural and maintenance overhead.

## Goals / Non-Goals

**Goals:**
- Remove MCP server, MCP transport adapters, and MCP-specific runtime wiring.
- Provide a regular subcommand-based CLI for interop and automation.
- Keep TUI functionality intact while decoupling startup from MCP.
- Remove HTTP/OpenAPI surfaces that are no longer needed when CLI replaces MCP interop.
- Preserve domain validation/behavior by reusing existing repositories/services.

**Non-Goals:**
- Introducing new domain features beyond parity with existing operations.
- Designing a remote network API for third-party clients in this change.
- Reworking persistence, schema, or assistant model-provider behavior.
- Building a plugin architecture for external extensions.

## Decisions

1. Replace MCP interop with regular CLI commands
- Decision: Interop is provided through standard commands/subcommands (for example `finish-em task list`, `finish-em project create`, etc.), not generic `tool call` APIs.
- Rationale: Improves UX and script readability, removes JSON-RPC/MCP ceremony, and aligns with user expectation (`gh`-style).
- Alternatives considered:
  - Keep MCP and add CLI wrapper. Rejected: maintains dual surfaces and complexity.
  - Keep MCP-style `tool` commands in CLI. Rejected: poor ergonomics and discoverability.

2. Remove HTTP handlers and OpenAPI schema from active runtime
- Decision: Remove HTTP handler surface tied to MCP and remove OpenAPI generation/docs from the supported product surface in this change.
- Rationale: If CLI is the interop contract, HTTP/OpenAPI become redundant maintenance overhead and ambiguous source-of-truth.
- Alternatives considered:
  - Keep HTTP/OpenAPI as deprecated compatibility. Rejected: continues parallel contract maintenance.
  - Keep only read-only HTTP endpoints. Rejected: creates mixed model and future confusion.

3. Keep domain layer as the single implementation core
- Decision: CLI and TUI both call shared repository/service modules directly (or through one thin internal application-service layer), not transport adapters.
- Rationale: Preserves tested business behavior while removing protocol-specific glue.
- Alternatives considered:
  - Rewrite domain as command-first layer only. Rejected: unnecessary churn and risk.

4. Help-first CLI UX at every level
- Decision: Add root and subcommand help support for `help`, `-h`, and `--help`, including examples and key flags.
- Rationale: Discoverability is a core requirement and expected for regular CLI tools.
- Alternatives considered:
  - Root-only help. Rejected: insufficient discoverability for deep command trees.

5. TUI remains default interactive mode
- Decision: Running `finish-em` without subcommands starts TUI; command groups provide non-interactive automation flows.
- Rationale: Maintains current user workflow while adding explicit command-driven interop.
- Alternatives considered:
  - Make command help the default with explicit `tui` subcommand required. Rejected: unnecessary friction for existing users.

## Risks / Trade-offs

- [Risk] Existing integrations that depend on MCP/HTTP break immediately.  
  Mitigation: Treat as explicit breaking change; document migration to CLI commands and remove MCP scripts in same release.

- [Risk] CLI command taxonomy becomes inconsistent or too broad.  
  Mitigation: Define command conventions early (`noun verb`, shared flags, consistent error/output shape).

- [Risk] Silent behavior drift when replacing MCP adapter calls.  
  Mitigation: Add parity tests at the domain/CLI boundary for representative CRUD and assistant flows.

- [Risk] Removing OpenAPI may reduce future web/API restart velocity.  
  Mitigation: Keep domain layer clean; if HTTP is needed later, create a dedicated new change and regenerate contract from domain behavior.

## Migration Plan

1. Introduce CLI command dispatcher with root help and scoped subcommand help.
2. Wire command handlers to existing repository/service operations and standardize exit codes/output.
3. Switch TUI runtime to non-MCP adapter path and remove MCP startup flags/options.
4. Remove MCP artifacts (`src/utils/mcp-*`, `src/tui/mcp-*`, `/mcp` route, MCP-only tests/scripts).
5. Remove HTTP/OpenAPI runtime artifacts and references used solely for the retired interop path.
6. Update docs/scripts/dependencies (`package.json`, README, lockfile) to reflect CLI+TUI architecture.
7. Rollback strategy: revert this change set to restore MCP/HTTP code paths if critical regressions are found before release.

## Open Questions

- Should CLI default output be human-readable with optional `--json`, or JSON-first with formatting flags?
- Which command groups are required in v1 of the CLI interop surface versus phase 2?
- Do we support shell completion in this change, or defer to a follow-up?
