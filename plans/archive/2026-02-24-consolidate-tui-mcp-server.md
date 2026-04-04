# Consolidate TUI MCP Server

_Archived change: `2026-02-24-consolidate-tui-mcp-server`_

## Summary

The current project maintains parallel surfaces (web app/server and TUI), which increases maintenance cost and duplicates interface behavior. Consolidating onto a TUI-first architecture with MCP as the integration surface reduces operational complexity while preserving extensibility for external tools.

## Scope

- **BREAKING** Remove the web application surface and associated HTTP server runtime used for browser UI/API routes.
- Keep the TUI as the primary user interface and preserve existing task/project/goal/reminder workflows.
- Add/standardize a first-class MCP server runtime in the same process as the TUI.
- **BREAKING** Route TUI operations through MCP tool contracts so TUI and external MCP clients use the same behavioral interface.
- Ensure MCP exposes the full functional surface currently available to TUI (tasks, projects, goals, reminders, completion/state transitions, scheduling/due updates).
- Simplify startup/deployment around a consolidated runtime mode focused on TUI + MCP.
- Establish a single-process runtime that starts TUI and MCP together.
- Route TUI mutations/queries through MCP contracts to ensure one behavioral interface.
- Provide complete MCP surface parity with existing TUI capabilities.
- Remove web application and route-based server runtime paths from the product.
- Simplify run/build/deploy scripts around TUI+MCP.
- Adding new user-facing features beyond current TUI functionality.
- Redesigning TUI interaction patterns or layout.
- Introducing distributed/multi-node architecture.
- Replacing existing persistence technology.
- Impact: Affected code:
- Impact: TUI runtime and startup (`src/tui/*`), including initialization flow and API wiring.
- Impact: MCP implementation (`src/utils/mcp-tools.ts`, `src/utils/mcp-resources.ts`, `src/utils/mcp-handler.ts`, `src/mcp-todos.ts`).
- Impact: Server/data layer reused by both interfaces (`src/server/**`, `data/**`).
- Impact: Removal/refactor of web app and route-based server surface (`src/routes/**`, web-focused `src/components/**`, router/bootstrap files, related Vite/web entrypoints).
- Impact: Affected behavior:
- Impact: Product runtime becomes TUI-first and MCP-enabled; web app/server behaviors are removed.
- Impact: External tools (e.g., Claude via MCP) gain parity with TUI functionality through MCP interfaces.
- Impact: Dependencies/systems:
- Impact: Continued use of existing persistence/repository services.
- Impact: MCP SDK remains a primary integration dependency.
- Impact: Build/run scripts and packaging paths will shift toward consolidated TUI+MCP execution.
- Related capabilities: `assistant-panel-visibility-toggle`, `mcp-complete-tui-surface`, `tui-mcp-consolidated-runtime`, `tui-uses-mcp-contract`

## Notes

- 1. Single-process consolidated runtime - Decision: Run MCP server and TUI in one Node process. - Rationale: Preserves standalone UX while avoiding extra service orchestration and minimizing deployment complexity. - Alternative considered: Separate MCP daemon + TUI client process. Rejected due to higher operational overhead and poorer out-of-box experience.
- [Risk] MCP becomes a bottleneck or adds latency to TUI interactions → Mitigation: Keep MCP adapters thin and domain logic in shared services; benchmark key flows during implementation.
- [Risk] Behavioral regressions while replacing direct API pathways → Mitigation: Add parity-focused tests for representative task/project/goal/reminder operations via MCP path.
- [Risk] Tooling/scripts break when web runtime is removed → Mitigation: Stage script cleanup with explicit replacement commands and CI checks for remaining references.
- [Risk] External MCP transport assumptions differ by client → Mitigation: Document supported connection mode(s) and provide stable defaults/env overrides.
- [Risk] Large deletion introduces accidental data-layer coupling regressions → Mitigation: Perform phased removal (first reroute, then delete) and keep repository/service tests green.
- Open questions: - Which MCP connection mode should be the default for external local clients in this repo (e.g., stdio vs local network), and do we support more than one mode? - Should there be a headless MCP-only startup mode in addition to default TUI+MCP, or only a single default entrypoint? - What minimum parity test matrix is required before deleting web/server code (smoke only vs full CRUD/state-transition coverage)?

## Implementation Phases

1. Consolidated Runtime Bootstrap
   - [done] Add a unified startup path that initializes shared domain services once and starts both TUI and MCP in the same process lifecycle.
   - [done] Implement coordinated lifecycle handling so startup failures in either TUI or MCP fail fast with actionable diagnostics and non-zero exit status.
   - [done] Define and wire runtime mode/config defaults for local MCP connectivity used by external tools while preserving default TUI launch behavior.
2. MCP Surface Parity
   - [done] Audit current TUI capabilities (tasks/projects/goals/reminders and state transitions) against existing MCP tools/resources and list parity gaps.
   - [done] Implement missing MCP tools/resources and response contracts to achieve full TUI functional parity.
   - [done] Align MCP validation and error semantics with existing domain rules to ensure deterministic failures and no partial mutations.
3. Route TUI Through MCP Contracts
   - [done] Refactor TUI data operation pathways to invoke MCP contracts instead of web route interfaces.
   - [done] Update TUI success/error handling to render outcomes from MCP responses with current UX parity.
   - [done] Add startup validation in TUI for MCP contract availability before accepting user commands.
4. Remove Web App and Route-Based Server Surface
   - [done] Remove browser app/router/bootstrap and web-only component usage that is no longer part of the product surface.
   - [done] Remove route-based HTTP API runtime code paths and related wiring no longer needed after MCP consolidation.
   - [done] Clean up dependencies, scripts, and build configuration to eliminate web-runtime references and keep only TUI+MCP paths.
5. Verification and Migration Safety
   - [done] Add/adjust tests for MCP-driven parity across representative task/project/goal/reminder workflows used in TUI.
   - [done] Add runtime smoke tests for default startup (TUI+MCP) and failure-path behavior when one component cannot initialize.
   - [done] Execute migration validation checklist and document rollback point (pre-consolidation tag/branch) before deleting final deprecated code paths.
