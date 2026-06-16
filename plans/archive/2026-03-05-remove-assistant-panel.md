# Remove Assistant Panel

_Archived change: `2026-03-05-remove-assistant-panel`_

## Summary

The in-TUI assistant panel adds UI and interaction complexity that overlaps with stronger external AI workflows. We want to remove embedded assistant usage from the TUI and standardize assistant-driven workflows through external tools like Claude Code and Cursor.

## Scope

- Remove the assistant panel from the TUI layout and remove its visibility toggle behavior.
- Remove assistant-specific interaction flows from the TUI runtime, including assistant session UI surfaces and panel-driven controls.
- Remove in-app assistant action execution pathways tied to the TUI assistant experience.
- Keep task/project management accessible through existing non-assistant TUI flows and external tool integrations.
- **BREAKING**: Users can no longer interact with an assistant directly inside the TUI.
- Remove all in-TUI assistant panel rendering, focus modes, and toggle behavior.
- Remove assistant-specific keybindings, command modes, and help text from TUI interaction flow.
- Remove assistant settings and provider/API key management surfaces from the TUI and runtime configuration paths.
- Remove assistant backend service, repository, types, persistence schema, and assistant-only CLI/API pathways.
- Preserve core task/project flows and TUI stability.
- Building a new in-app replacement assistant UI.
- Defining UX details for external tools (Claude Code/Cursor) beyond documenting that they are the preferred assistant path.
- Re-implementing assistant behavior under a different in-app abstraction.
- Impact: Affected code: TUI layout composition, keymap/shortcut handling, assistant UI components, assistant turn/action execution plumbing, and related tests.
- Impact: Affected behavior: assistant-driven flows are no longer available in the TUI; users perform assistant workflows through external tools.
- Impact: Affected integrations: any internal contract that assumes a TUI assistant surface must be updated or removed.
- Related capabilities: `assistant-action-safety`, `assistant-panel-visibility-toggle`, `assistant-project-actions`, `assistant-task-actions`

## Notes

- 1. Remove assistant UI surface from TUI completely: - Decision: Delete assistant panel rendering and related focus/layout state from `App.tsx` and remove `assistant-layout` usage. - Rationale: Partial hiding creates dead states and maintenance overhead. Full removal yields a simpler interaction model. - Alternative considered: Keep panel code but hard-disable visibility. Rejected because dormant code preserves complexity and creates reactivation risk.
- 2. Remove assistant-driven keybindings and command modes: - Decision: Remove assistant chat input mode, assistant focus area, toggle shortcuts, and assistant-related entries in help text. - Rationale: Keyboard/command references to removed UI would create broken affordances. - Alternative considered: Keep shortcuts as no-ops. Rejected because silent no-ops are confusing and increase support burden.
- 3. Remove assistant settings surfaces and configuration pathways: - Decision: Remove assistant settings commands and state from TUI/CLI flows (including provider/API key operations and assistant-specific help references). - Rationale: Keeping assistant settings after removing assistant usage creates dead configuration paths and user confusion. - Alternative considered: Keep settings for potential future assistant return. Rejected because dormant settings are misleading and increase maintenance burden.
- 4. Remove assistant backend services in the same change: - Decision: Remove assistant server service, assistant repositories, assistant message persistence artifacts, assistant-only API/client methods, and assistant-only CLI subcommands in this change. - Rationale: The product direction is external-tool assistant usage; retaining internal assistant backend paths preserves unused behavior and ongoing maintenance cost. - Alternative considered: staged backend removal after TUI cleanup. Rejected to avoid carrying dead backend contracts and migration debt.
- [Full backend assistant removal may break hidden dependencies] -> Mitigation: perform repository-wide call-site audit before deletion and fail builds on unresolved imports/references.
- [Shortcut/help text drift leaves stale assistant references] -> Mitigation: snapshot tests and string-level assertions for help content and key handling.
- [TUI focus/input regressions after removing assistant mode] -> Mitigation: add/adjust tests around focus transitions, input modes, and pane width behavior.
- [Assistant settings leftovers in persisted config cause inconsistent startup behavior] -> Mitigation: remove read/write paths for assistant settings and ensure startup ignores/cleans legacy assistant settings keys.
- [External-tool messaging is unclear to users] -> Mitigation: update docs/help copy to explicitly direct assistant usage to external tools.
- Open questions: - Do we want an explicit in-app notice (for one release) that assistant workflows moved to external tools? - Are any automation/test harnesses currently invoking `finish-em assistant` CLI subcommands that must be migrated concurrently?

## Implementation Phases

1. Remove Assistant UI Surface From TUI
   - [done] Remove `AssistantPanel` rendering and assistant pane layout/focus paths from `src/tui/App.tsx`.
   - [done] Remove or delete `src/tui/assistant-layout.ts` and its tests, and update any callers to use non-assistant pane sizing/focus behavior.
   - [done] Remove assistant-panel toggle key handling and any assistant-specific input modes from TUI keyboard handling.
   - [done] Remove assistant references from `src/tui/HelpModal.tsx` and other user-facing TUI help text.
2. Remove Assistant Settings and CLI Surfaces
   - [done] Remove assistant provider/API-key commands from TUI command parsing and execution paths (`src/tui/cli.ts`, assistant command helpers).
   - [done] Remove assistant settings read/write behavior from settings repositories/types and eliminate assistant-only settings defaults.
   - [done] Add migration-safe handling for legacy persisted assistant settings keys so startup/runtime does not fail.
   - [done] Remove assistant-specific direct API client endpoints and any command paths that depend on them.
3. Remove Assistant Backend Services and Persistence
   - [done] Remove `src/server/services/assistant.ts` and replace remaining call sites with non-assistant flows or delete dead paths.
   - [done] Remove assistant repositories and types (`src/server/repos/assistant.ts`, assistant-related type members) and clean imports/usages.
   - [done] Remove assistant message schema artifacts (drizzle schema/table definitions, SQL migrations, db bootstrap/index creation for `assistant_messages`).
   - [done] Remove assistant-only CLI subcommands (`finish-em assistant ...`) and update command help output accordingly.
4. Validate and Document Breaking Changes
   - [done] Update and run tests for TUI navigation/focus/input behavior after assistant removal.
   - [done] Update and run tests for project/task create/update/delete flows to ensure non-assistant behavior remains intact.
   - [done] Remove or rewrite assistant backend unit/integration tests and ensure the test suite passes without assistant services.
   - [done] Update docs/changelog/help text to state assistant workflows are external-tool-only (Claude Code/Cursor) and in-app assistant settings are removed.
