## Context

Finish-Em currently has overlapping product surfaces and runtime modes: a web app/server path and a TUI path. The proposal sets a product direction to remove the web surface, keep TUI as primary UX, and expose all functionality through MCP for external tool interoperability. This is a cross-cutting change that touches startup/runtime composition, API boundaries, and operational scripts, so a design artifact is warranted before implementation.

Constraints:
- Preserve current TUI user workflows and ergonomics.
- Maintain functional parity for tasks, projects, goals, and reminders.
- Reduce long-term maintenance by eliminating duplicate web/server pathways.
- Keep external automation/integration compatibility via MCP.

Stakeholders:
- Local TUI users.
- External MCP clients (e.g., Claude, other agent tools).
- Maintainers who currently support parallel stacks.

## Goals / Non-Goals

**Goals:**
- Establish a single-process runtime that starts TUI and MCP together.
- Route TUI mutations/queries through MCP contracts to ensure one behavioral interface.
- Provide complete MCP surface parity with existing TUI capabilities.
- Remove web application and route-based server runtime paths from the product.
- Simplify run/build/deploy scripts around TUI+MCP.

**Non-Goals:**
- Adding new user-facing features beyond current TUI functionality.
- Redesigning TUI interaction patterns or layout.
- Introducing distributed/multi-node architecture.
- Replacing existing persistence technology.

## Decisions

1. Single-process consolidated runtime
- Decision: Run MCP server and TUI in one Node process.
- Rationale: Preserves standalone UX while avoiding extra service orchestration and minimizing deployment complexity.
- Alternative considered: Separate MCP daemon + TUI client process. Rejected due to higher operational overhead and poorer out-of-box experience.

2. MCP as the shared operational contract
- Decision: TUI uses MCP tool/resource contracts for domain operations instead of direct web API pathways.
- Rationale: Guarantees behavior parity between TUI and external clients and removes contract drift.
- Alternative considered: Keep TUI direct-service calls while MCP is parallel. Rejected because it preserves dual logic paths and increases maintenance burden.

3. Remove web app and route-centric HTTP server surface
- Decision: Decommission browser UI/router/route handlers tied to web-only runtime.
- Rationale: Matches product scope (TUI-first) and removes duplicate maintenance surface.
- Alternative considered: Keep web code dormant behind flags. Rejected because stale code still imposes dependency and cognitive costs.

4. Keep existing domain services/repositories as core implementation layer
- Decision: Preserve `src/server/**` data/domain modules as shared backend internals used by MCP.
- Rationale: Reuse proven logic and avoid risky data-layer rewrite.
- Alternative considered: Rebuild domain logic specifically around MCP handlers. Rejected as unnecessary churn.

5. Transport strategy supports local tool integration
- Decision: MCP server starts with a deterministic local transport/configuration suitable for local tool clients, while remaining in the same process lifecycle as TUI.
- Rationale: Enables external agent access without requiring separate deployment steps.
- Alternative considered: TUI-only embedded MCP not reachable externally. Rejected because it fails integration goals.

## Risks / Trade-offs

- [Risk] MCP becomes a bottleneck or adds latency to TUI interactions → Mitigation: Keep MCP adapters thin and domain logic in shared services; benchmark key flows during implementation.
- [Risk] Behavioral regressions while replacing direct API pathways → Mitigation: Add parity-focused tests for representative task/project/goal/reminder operations via MCP path.
- [Risk] Tooling/scripts break when web runtime is removed → Mitigation: Stage script cleanup with explicit replacement commands and CI checks for remaining references.
- [Risk] External MCP transport assumptions differ by client → Mitigation: Document supported connection mode(s) and provide stable defaults/env overrides.
- [Risk] Large deletion introduces accidental data-layer coupling regressions → Mitigation: Perform phased removal (first reroute, then delete) and keep repository/service tests green.

## Migration Plan

1. Introduce consolidated runtime bootstrap that initializes shared services once and starts TUI + MCP together.
2. Refactor MCP handlers/tools to cover full existing TUI operation surface if any gaps remain.
3. Move TUI data operations to MCP contract usage and verify feature parity end-to-end.
4. Remove web app/router/HTTP route code and web-only dependencies/scripts.
5. Update build/run packaging to default to TUI+MCP runtime and validate local startup behavior.
6. Rollback strategy: retain a short-lived branch/tag with pre-consolidation runtime; if severe regressions occur, restore prior startup path while preserving data schema.

## Open Questions

- Which MCP connection mode should be the default for external local clients in this repo (e.g., stdio vs local network), and do we support more than one mode?
- Should there be a headless MCP-only startup mode in addition to default TUI+MCP, or only a single default entrypoint?
- What minimum parity test matrix is required before deleting web/server code (smoke only vs full CRUD/state-transition coverage)?
