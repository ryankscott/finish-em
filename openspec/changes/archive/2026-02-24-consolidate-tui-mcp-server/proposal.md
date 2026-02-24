## Why

The current project maintains parallel surfaces (web app/server and TUI), which increases maintenance cost and duplicates interface behavior. Consolidating onto a TUI-first architecture with MCP as the integration surface reduces operational complexity while preserving extensibility for external tools.

## What Changes

- **BREAKING** Remove the web application surface and associated HTTP server runtime used for browser UI/API routes.
- Keep the TUI as the primary user interface and preserve existing task/project/goal/reminder workflows.
- Add/standardize a first-class MCP server runtime in the same process as the TUI.
- **BREAKING** Route TUI operations through MCP tool contracts so TUI and external MCP clients use the same behavioral interface.
- Ensure MCP exposes the full functional surface currently available to TUI (tasks, projects, goals, reminders, completion/state transitions, scheduling/due updates).
- Simplify startup/deployment around a consolidated runtime mode focused on TUI + MCP.

## Capabilities

### New Capabilities
- `tui-mcp-consolidated-runtime`: Defines a single-process runtime where TUI and MCP server are started together and share one data/logic backend.
- `mcp-complete-tui-surface`: Defines MCP tools/resources that cover the full user-visible functional scope currently available in TUI.
- `tui-uses-mcp-contract`: Defines TUI behavior to execute operations via MCP contracts rather than separate web/API-specific pathways.

### Modified Capabilities
- `assistant-panel-visibility-toggle`: Scope and runtime assumptions are updated to operate in a TUI-only product context (no web surface dependency).

## Impact

- Affected code:
  - TUI runtime and startup (`src/tui/*`), including initialization flow and API wiring.
  - MCP implementation (`src/utils/mcp-tools.ts`, `src/utils/mcp-resources.ts`, `src/utils/mcp-handler.ts`, `src/mcp-todos.ts`).
  - Server/data layer reused by both interfaces (`src/server/**`, `data/**`).
  - Removal/refactor of web app and route-based server surface (`src/routes/**`, web-focused `src/components/**`, router/bootstrap files, related Vite/web entrypoints).
- Affected behavior:
  - Product runtime becomes TUI-first and MCP-enabled; web app/server behaviors are removed.
  - External tools (e.g., Claude via MCP) gain parity with TUI functionality through MCP interfaces.
- Dependencies/systems:
  - Continued use of existing persistence/repository services.
  - MCP SDK remains a primary integration dependency.
  - Build/run scripts and packaging paths will shift toward consolidated TUI+MCP execution.
