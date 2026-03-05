## Why

The current MCP runtime adds architectural and operational overhead (extra server lifecycle, transport adapters, and MCP-specific contract maintenance) for limited practical value in this codebase. Replacing MCP interop with a regular command-oriented CLI simplifies the system, improves discoverability, and aligns operation flows with a standard developer UX.

## What Changes

- **BREAKING** Remove MCP server/runtime and MCP-specific transport and contract layers from the product surface.
- Introduce a regular CLI command surface (modeled after common tools like `gh`) for interop and automation, instead of generic MCP `tool`/JSON-RPC style invocation.
- Add consistent discoverability via `help`, `-h`, and `--help` at root and subcommand levels.
- Keep TUI as a first-class interface while removing MCP coupling from startup and runtime orchestration.
- Update startup/run scripts and tests to reflect CLI + TUI architecture instead of TUI + MCP runtime assumptions.
- Remove MCP-focused dependencies, docs, and stale MCP-specific artifacts.

## Capabilities

### New Capabilities
- `cli-command-surface`: Define a regular subcommand-based CLI interface for tasks/projects/goals/reminders/settings/assistant operations with clear help output and predictable command semantics.

### Modified Capabilities
- `tui-mcp-consolidated-runtime`: Replace the TUI+MCP consolidated runtime requirement with a simplified runtime that does not require MCP server startup.
- `tui-uses-mcp-contract`: Replace MCP contract requirements with non-MCP operation pathways appropriate to the simplified architecture.
- `mcp-complete-tui-surface`: Deprecate MCP surface completeness requirements and replace with CLI interop surface expectations.
- `project-deletion`: Remove references to MCP-backed API variants where deletion behavior is currently specified across direct and MCP-backed TUI adapters.
- `assistant-project-actions`: Remove MCP project-tool coupling language while preserving assistant behavior alignment with canonical project repositories.
- `assistant-task-actions`: Remove MCP task-tool coupling language while preserving assistant behavior alignment with canonical task repositories.

## Impact

- Affected code:
  - MCP implementation and HTTP adapters (`src/utils/mcp-*.ts`, `src/tui/mcp-*.ts`, `src/routes/mcp.ts`, related tests).
  - TUI startup and API adapter selection (`src/tui/main.tsx`, adapter wiring, runtime flags).
  - New CLI command parsing/dispatch and help text flow (new or refactored files under `src/tui` or a dedicated CLI module).
  - Package scripts and dependency graph (`package.json`, lockfile) to remove MCP dependencies and add/adjust CLI entry behavior.
- Affected behavior:
  - External integration path moves from MCP endpoint/tool invocation to regular CLI command execution.
  - Help/discoverability improves via explicit command help instead of MCP tool discovery.
- Dependencies/systems:
  - Removes reliance on `@modelcontextprotocol/sdk`.
  - Reduces runtime complexity by removing MCP server lifecycle management and related test surface.
