## 1. Consolidated Runtime Bootstrap

- [x] 1.1 Add a unified startup path that initializes shared domain services once and starts both TUI and MCP in the same process lifecycle.
- [x] 1.2 Implement coordinated lifecycle handling so startup failures in either TUI or MCP fail fast with actionable diagnostics and non-zero exit status.
- [x] 1.3 Define and wire runtime mode/config defaults for local MCP connectivity used by external tools while preserving default TUI launch behavior.

## 2. MCP Surface Parity

- [x] 2.1 Audit current TUI capabilities (tasks/projects/goals/reminders and state transitions) against existing MCP tools/resources and list parity gaps.
- [x] 2.2 Implement missing MCP tools/resources and response contracts to achieve full TUI functional parity.
- [x] 2.3 Align MCP validation and error semantics with existing domain rules to ensure deterministic failures and no partial mutations.

## 3. Route TUI Through MCP Contracts

- [x] 3.1 Refactor TUI data operation pathways to invoke MCP contracts instead of web route interfaces.
- [x] 3.2 Update TUI success/error handling to render outcomes from MCP responses with current UX parity.
- [x] 3.3 Add startup validation in TUI for MCP contract availability before accepting user commands.

## 4. Remove Web App and Route-Based Server Surface

- [x] 4.1 Remove browser app/router/bootstrap and web-only component usage that is no longer part of the product surface.
- [x] 4.2 Remove route-based HTTP API runtime code paths and related wiring no longer needed after MCP consolidation.
- [x] 4.3 Clean up dependencies, scripts, and build configuration to eliminate web-runtime references and keep only TUI+MCP paths.

## 5. Verification and Migration Safety

- [x] 5.1 Add/adjust tests for MCP-driven parity across representative task/project/goal/reminder workflows used in TUI.
- [x] 5.2 Add runtime smoke tests for default startup (TUI+MCP) and failure-path behavior when one component cannot initialize.
- [x] 5.3 Execute migration validation checklist and document rollback point (pre-consolidation tag/branch) before deleting final deprecated code paths.
