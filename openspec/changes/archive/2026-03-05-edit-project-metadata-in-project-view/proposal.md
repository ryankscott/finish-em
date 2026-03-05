## Why

Project metadata can be set during creation, but users cannot edit that metadata from project view in the TUI. This creates unnecessary friction for common updates like renaming a project or adjusting emoji/date/description after planning evolves.

## What Changes

- Add a project-edit interaction in TUI project view so users can edit selected project metadata without leaving keyboard flow.
- Allow editing `name`, `emoji`, `description`, `startAt`, and `endAt` from project view using tokenized input compatible with existing project metadata syntax.
- Add prefilled edit input for the active project so users can incrementally update fields instead of re-entering everything.
- Add project update support to TUI API adapters (HTTP, direct, and MCP-backed) so the UI can persist metadata edits consistently across runtimes.
- Update help and status messaging to clarify project-edit behavior and validation feedback.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `tui-project-metadata-entry`: Expand TUI project metadata behavior from create-only entry to include in-place project metadata editing from project view.

## Impact

- Affected code:
  - `src/tui/App.tsx` input mode and keybinding handling in project view.
  - `src/tui/api.ts`, `src/tui/direct-api.ts`, and `src/tui/mcp-api.ts` project update contract wiring.
  - `src/tui/HelpModal.tsx` shortcut text for edit behavior.
  - TUI parser/autocomplete tests for project metadata editing flow.
- Affected behavior:
  - Pressing `e` in project view edits the active project metadata (including name rename) instead of only editing selected task.
  - Project metadata updates become a first-class keyboard workflow in TUI.
- Dependencies/systems:
  - Reuses existing backend project update support; no persistence schema changes required.
