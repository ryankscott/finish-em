## 1. Remove Assistant UI Surface From TUI

- [x] 1.1 Remove `AssistantPanel` rendering and assistant pane layout/focus paths from `src/tui/App.tsx`.
- [x] 1.2 Remove or delete `src/tui/assistant-layout.ts` and its tests, and update any callers to use non-assistant pane sizing/focus behavior.
- [x] 1.3 Remove assistant-panel toggle key handling and any assistant-specific input modes from TUI keyboard handling.
- [x] 1.4 Remove assistant references from `src/tui/HelpModal.tsx` and other user-facing TUI help text.

## 2. Remove Assistant Settings and CLI Surfaces

- [x] 2.1 Remove assistant provider/API-key commands from TUI command parsing and execution paths (`src/tui/cli.ts`, assistant command helpers).
- [x] 2.2 Remove assistant settings read/write behavior from settings repositories/types and eliminate assistant-only settings defaults.
- [x] 2.3 Add migration-safe handling for legacy persisted assistant settings keys so startup/runtime does not fail.
- [x] 2.4 Remove assistant-specific direct API client endpoints and any command paths that depend on them.

## 3. Remove Assistant Backend Services and Persistence

- [x] 3.1 Remove `src/server/services/assistant.ts` and replace remaining call sites with non-assistant flows or delete dead paths.
- [x] 3.2 Remove assistant repositories and types (`src/server/repos/assistant.ts`, assistant-related type members) and clean imports/usages.
- [x] 3.3 Remove assistant message schema artifacts (drizzle schema/table definitions, SQL migrations, db bootstrap/index creation for `assistant_messages`).
- [x] 3.4 Remove assistant-only CLI subcommands (`finish-em assistant ...`) and update command help output accordingly.

## 4. Validate and Document Breaking Changes

- [x] 4.1 Update and run tests for TUI navigation/focus/input behavior after assistant removal.
- [x] 4.2 Update and run tests for project/task create/update/delete flows to ensure non-assistant behavior remains intact.
- [x] 4.3 Remove or rewrite assistant backend unit/integration tests and ensure the test suite passes without assistant services.
- [x] 4.4 Update docs/changelog/help text to state assistant workflows are external-tool-only (Claude Code/Cursor) and in-app assistant settings are removed.
