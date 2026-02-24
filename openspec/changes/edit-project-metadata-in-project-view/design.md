## Context

TUI project metadata is currently supported for project creation via tokenized input and autocomplete. In project view, `e` edits the selected task, and there is no equivalent in-place project metadata edit path. Backend repositories and APIs already support updating project metadata (`name`, `emoji`, `description`, `startAt`, `endAt`, `color`, `isInbox`), but TUI API adapters do not expose `updateProject`, so project-view editing cannot be wired end to end.

## Goals / Non-Goals

**Goals:**
- Add a keyboard-first project edit flow in project view to update `name`, `emoji`, `description`, `startAt`, and `endAt`.
- Reuse existing token syntax (`name:`, `emoji:`, `description:`, `start:`, `end:`) so create and edit are consistent.
- Prefill edit input from the active project to support incremental changes.
- Add `updateProject` across TUI API adapters (HTTP/direct/MCP) for consistent runtime behavior.
- Preserve existing task edit behavior outside project-view project-edit context.

**Non-Goals:**
- Redesigning project list navigation or introducing multi-step forms.
- Changing persistence schema or server-side project domain model.
- Expanding this flow to edit project color or inbox designation in this change.

## Decisions

### 1) Add a dedicated `editProject` input mode in TUI
- Decision: Extend `InputMode` and submit handling in `App.tsx` with a project-specific branch for update submission.
- Rationale: Keeps existing task editing logic isolated and avoids overloading `editTask` with project-specific parsing and target resolution.
- Alternatives considered:
  - Reusing `editTask` mode with conditional branching: rejected as harder to reason about and more error-prone.

### 2) Trigger project edit only when the active view is `project`
- Decision: In key handling for `e`, route to project edit when `view === "project"` and an `activeProjectId` exists; otherwise preserve current task edit flow.
- Rationale: Matches user intent in project view while preserving established task shortcuts elsewhere.
- Alternatives considered:
  - New keybinding (for example uppercase `E`): rejected to avoid discoverability and ergonomics regressions.

### 3) Reuse the project token parser for edit payload derivation
- Decision: Use existing project token parser behavior for edit submission, with plain text interpreted as rename-only for backward speed.
- Rationale: Minimizes syntax drift and implementation risk by reusing validated parsing behavior users already learn during creation.
- Alternatives considered:
  - New edit-only parser: rejected due to duplicate logic and likely divergence.

### 4) Prefill input with project metadata tokens
- Decision: Initialize edit input with deterministic tokenized representation of current project metadata so users can edit in place.
- Rationale: Reduces re-entry cost and makes editable fields explicit.
- Alternatives considered:
  - Empty input expecting only patch tokens: rejected as less discoverable and easier to misapply.

### 5) Add `updateProject` to all TUI API adapters
- Decision: Extend `ApiClient` and implementations in `api.ts`, `direct-api.ts`, and `mcp-api.ts` with `updateProject(projectId, patch)`.
- Rationale: Required for runtime parity and testability across standalone, server-backed, and MCP-backed TUI modes.
- Alternatives considered:
  - Updating only HTTP adapter first: rejected because compiled/direct and MCP runtimes would diverge.

## Risks / Trade-offs

- [Ambiguity between task and project edit when no task is selected] → Mitigation: prioritize project edit strictly by `view === "project"`, independent of task selection.
- [Parser semantics for clearing fields may be inconsistent] → Mitigation: align edit validation/status messages with parser-supported clear tokens and add targeted tests.
- [API adapter drift] → Mitigation: add/update adapter integration tests that assert project update support in each adapter.
- [Help text confusion if shortcut meaning changes by view] → Mitigation: update help copy to explicitly call out project-view behavior for `e`.

## Migration Plan

1. Extend TUI API contract to include `updateProject` and implement in all adapters.
2. Add project edit input mode + submit path in `App.tsx`.
3. Add tokenized project edit prefill helper and wire `e` key behavior in project view.
4. Update help/status text for project edit discoverability.
5. Add/adjust tests for project-view edit behavior, parser usage, and adapter update support.

Rollback strategy:
- Revert `editProject` input mode and keybinding branch, keeping existing task edit flow intact.
- Keep server/project repo behavior unchanged (no schema migration involved), so rollback is code-only.

## Open Questions

- Should this change also expose `color` and `inbox` edits in project view, or keep scope limited to the requested five fields?
- Should project edit support explicit clear token for description (for example `description:none`) or only overwrite with non-empty values in this iteration?
