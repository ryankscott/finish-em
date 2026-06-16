# Edit Project Metadata In Project View

_Archived change: `2026-03-05-edit-project-metadata-in-project-view`_

## Summary

Project metadata can be set during creation, but users cannot edit that metadata from project view in the TUI. This creates unnecessary friction for common updates like renaming a project or adjusting emoji/date/description after planning evolves.

## Scope

- Add a project-edit interaction in TUI project view so users can edit selected project metadata without leaving keyboard flow.
- Allow editing `name`, `emoji`, `description`, `startAt`, and `endAt` from project view using tokenized input compatible with existing project metadata syntax.
- Add prefilled edit input for the active project so users can incrementally update fields instead of re-entering everything.
- Add project update support to TUI API adapters (HTTP, direct, and MCP-backed) so the UI can persist metadata edits consistently across runtimes.
- Update help and status messaging to clarify project-edit behavior and validation feedback.
- Add a keyboard-first project edit flow in project view to update `name`, `emoji`, `description`, `startAt`, and `endAt`.
- Reuse existing token syntax (`name:`, `emoji:`, `description:`, `start:`, `end:`) so create and edit are consistent.
- Prefill edit input from the active project to support incremental changes.
- Add `updateProject` across TUI API adapters (HTTP/direct/MCP) for consistent runtime behavior.
- Preserve existing task edit behavior outside project-view project-edit context.
- Redesigning project list navigation or introducing multi-step forms.
- Changing persistence schema or server-side project domain model.
- Expanding this flow to edit project color or inbox designation in this change.
- Impact: Affected code:
- Impact: `src/tui/App.tsx` input mode and keybinding handling in project view.
- Impact: `src/tui/api.ts`, `src/tui/direct-api.ts`, and `src/tui/mcp-api.ts` project update contract wiring.
- Impact: `src/tui/HelpModal.tsx` shortcut text for edit behavior.
- Impact: TUI parser/autocomplete tests for project metadata editing flow.
- Impact: Affected behavior:
- Impact: Pressing `e` in project view edits the active project metadata (including name rename) instead of only editing selected task.
- Impact: Project metadata updates become a first-class keyboard workflow in TUI.
- Impact: Dependencies/systems:
- Impact: Reuses existing backend project update support; no persistence schema changes required.
- Related capabilities: `tui-project-metadata-entry`

## Notes

- 1) Add a dedicated `editProject` input mode in TUI: - Decision: Extend `InputMode` and submit handling in `App.tsx` with a project-specific branch for update submission. - Rationale: Keeps existing task editing logic isolated and avoids overloading `editTask` with project-specific parsing and target resolution. - Alternatives considered: - Reusing `editTask` mode with conditional branching: rejected as harder to reason about and more error-prone.
- 2) Trigger project edit only when the active view is `project`: - Decision: In key handling for `e`, route to project edit when `view === "project"` and an `activeProjectId` exists; otherwise preserve current task edit flow. - Rationale: Matches user intent in project view while preserving established task shortcuts elsewhere. - Alternatives considered: - New keybinding (for example uppercase `E`): rejected to avoid discoverability and ergonomics regressions.
- 3) Reuse the project token parser for edit payload derivation: - Decision: Use existing project token parser behavior for edit submission, with plain text interpreted as rename-only for backward speed. - Rationale: Minimizes syntax drift and implementation risk by reusing validated parsing behavior users already learn during creation. - Alternatives considered: - New edit-only parser: rejected due to duplicate logic and likely divergence.
- 4) Prefill input with project metadata tokens: - Decision: Initialize edit input with deterministic tokenized representation of current project metadata so users can edit in place. - Rationale: Reduces re-entry cost and makes editable fields explicit. - Alternatives considered: - Empty input expecting only patch tokens: rejected as less discoverable and easier to misapply.
- 5) Add `updateProject` to all TUI API adapters: - Decision: Extend `ApiClient` and implementations in `api.ts`, `direct-api.ts`, and `mcp-api.ts` with `updateProject(projectId, patch)`. - Rationale: Required for runtime parity and testability across standalone, server-backed, and MCP-backed TUI modes. - Alternatives considered: - Updating only HTTP adapter first: rejected because compiled/direct and MCP runtimes would diverge.
- [Ambiguity between task and project edit when no task is selected] → Mitigation: prioritize project edit strictly by `view === "project"`, independent of task selection.
- [Parser semantics for clearing fields may be inconsistent] → Mitigation: align edit validation/status messages with parser-supported clear tokens and add targeted tests.
- [API adapter drift] → Mitigation: add/update adapter integration tests that assert project update support in each adapter.
- [Help text confusion if shortcut meaning changes by view] → Mitigation: update help copy to explicitly call out project-view behavior for `e`.
- Open questions: - Should this change also expose `color` and `inbox` edits in project view, or keep scope limited to the requested five fields? - Should project edit support explicit clear token for description (for example `description:none`) or only overwrite with non-empty values in this iteration?

## Implementation Phases

1. Extend TUI project update API contract
   - [done] Add `updateProject(projectId, patch)` to `ApiClient` in `src/tui/api.ts`
   - [done] Implement HTTP project update call (`PATCH /api/projects/:projectId`) in `src/tui/api.ts`
   - [done] Implement `updateProject` passthrough in `src/tui/direct-api.ts`
   - [done] Implement `updateProject` MCP tool call wiring in `src/tui/mcp-api.ts`
2. Add project-view edit interaction in App
   - [done] Add `editProject` input mode and submit branch in `src/tui/App.tsx`
   - [done] Route `e` key to project edit when `view === "project"` and `activeProjectId` is set
   - [done] Keep existing task edit behavior unchanged for non-project views
   - [done] Prefill project edit input with tokenized current metadata (`name`, `emoji`, `description`, `start`, `end`)
   - [done] Reuse project metadata parser for edit submission and map parsed values into project patch payload
   - [done] Surface clear status/error messages for successful update, no-op edits, and validation failures
3. Update discoverability and UX copy
   - [done] Update `src/tui/HelpModal.tsx` shortcut text to describe project-view `e` behavior
   - [done] Update bottom input label text in `src/tui/App.tsx` to include project edit context
4. Verify behavior with tests
   - [done] Add/extend TUI tests for project-view edit key handling and input mode transitions
   - [done] Add/extend parser/edit-flow tests for tokenized project update input and validation feedback
   - [done] Add/extend API adapter tests to verify `updateProject` availability across HTTP/direct/MCP paths
   - [done] Run targeted TUI tests covering project create/edit flows and ensure no regression in task edit behavior
