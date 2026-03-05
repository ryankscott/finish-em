## Context

The current TUI has a first-class assistant surface with dedicated UI components (`src/tui/AssistantPanel.tsx`), layout/focus logic (`src/tui/assistant-layout.ts`, `src/tui/App.tsx`), shortcut help text (`src/tui/HelpModal.tsx`), assistant command plumbing (`src/tui/direct-api.ts`, `src/tui/cli.ts`), and assistant settings surfaces (provider/API key commands and settings storage).

Assistant behavior is also implemented server-side in `src/server/services/assistant.ts` with persistence in `assistant_messages` tables and related repository/types/tests. This change removes assistant panel usage inside the TUI, removes assistant settings from the app, removes assistant backend services, and shifts assistant workflows to external tooling (for example Claude Code and Cursor).

Constraint: task/project workflows in the TUI must remain intact and cannot regress while assistant-specific UI and action pathways are removed.

## Goals / Non-Goals

**Goals:**
- Remove all in-TUI assistant panel rendering, focus modes, and toggle behavior.
- Remove assistant-specific keybindings, command modes, and help text from TUI interaction flow.
- Remove assistant settings and provider/API key management surfaces from the TUI and runtime configuration paths.
- Remove assistant backend service, repository, types, persistence schema, and assistant-only CLI/API pathways.
- Preserve core task/project flows and TUI stability.

**Non-Goals:**
- Building a new in-app replacement assistant UI.
- Defining UX details for external tools (Claude Code/Cursor) beyond documenting that they are the preferred assistant path.
- Re-implementing assistant behavior under a different in-app abstraction.

## Decisions

### 1. Remove assistant UI surface from TUI completely
- Decision: Delete assistant panel rendering and related focus/layout state from `App.tsx` and remove `assistant-layout` usage.
- Rationale: Partial hiding creates dead states and maintenance overhead. Full removal yields a simpler interaction model.
- Alternative considered: Keep panel code but hard-disable visibility. Rejected because dormant code preserves complexity and creates reactivation risk.

### 2. Remove assistant-driven keybindings and command modes
- Decision: Remove assistant chat input mode, assistant focus area, toggle shortcuts, and assistant-related entries in help text.
- Rationale: Keyboard/command references to removed UI would create broken affordances.
- Alternative considered: Keep shortcuts as no-ops. Rejected because silent no-ops are confusing and increase support burden.

### 3. Remove assistant settings surfaces and configuration pathways
- Decision: Remove assistant settings commands and state from TUI/CLI flows (including provider/API key operations and assistant-specific help references).
- Rationale: Keeping assistant settings after removing assistant usage creates dead configuration paths and user confusion.
- Alternative considered: Keep settings for potential future assistant return. Rejected because dormant settings are misleading and increase maintenance burden.

### 4. Remove assistant backend services in the same change
- Decision: Remove assistant server service, assistant repositories, assistant message persistence artifacts, assistant-only API/client methods, and assistant-only CLI subcommands in this change.
- Rationale: The product direction is external-tool assistant usage; retaining internal assistant backend paths preserves unused behavior and ongoing maintenance cost.
- Alternative considered: staged backend removal after TUI cleanup. Rejected to avoid carrying dead backend contracts and migration debt.

## Risks / Trade-offs

- [Full backend assistant removal may break hidden dependencies] -> Mitigation: perform repository-wide call-site audit before deletion and fail builds on unresolved imports/references.
- [Shortcut/help text drift leaves stale assistant references] -> Mitigation: snapshot tests and string-level assertions for help content and key handling.
- [TUI focus/input regressions after removing assistant mode] -> Mitigation: add/adjust tests around focus transitions, input modes, and pane width behavior.
- [Assistant settings leftovers in persisted config cause inconsistent startup behavior] -> Mitigation: remove read/write paths for assistant settings and ensure startup ignores/cleans legacy assistant settings keys.
- [External-tool messaging is unclear to users] -> Mitigation: update docs/help copy to explicitly direct assistant usage to external tools.

## Migration Plan

1. Remove assistant panel component usage and assistant layout/focus state in TUI (`App.tsx`, `assistant-layout.ts`, related tests).
2. Remove assistant keybindings/help entries and assistant command modes from TUI command handling.
3. Remove assistant settings/provider/API-key configuration paths from TUI and CLI handling.
4. Remove assistant backend code paths (`src/server/services/assistant.ts`, assistant repos/types/api-client surfaces, assistant-only CLI commands) and delete or migrate assistant-only tests.
5. Remove assistant persistence artifacts (assistant message schema/migrations/tables/indexes) and verify startup/migrations succeed without assistant tables.
6. Run tests and smoke-check TUI keyboard navigation, task/project creation, and editing flows.
7. Update docs/changelog to call out breaking change: assistant interaction is external-tool-only and in-app assistant settings are removed.

Rollback: restore removed assistant UI/settings/backend files from version control if core navigation/task flows regress during rollout.

## Open Questions

- Do we want an explicit in-app notice (for one release) that assistant workflows moved to external tools?
- Are any automation/test harnesses currently invoking `finish-em assistant` CLI subcommands that must be migrated concurrently?
