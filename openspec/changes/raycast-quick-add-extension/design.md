## Context

finish-em has a CLI binary (`finish-em`) that exposes a full task/project command surface with `--json` output. The TUI is the primary interface but it requires a terminal. A Raycast extension can provide a global hotkey entry point for task capture without context-switching to the terminal.

The extension is personal-use only and lives as a subdirectory of the finish-em repo (`raycast/`). It will be loaded via Raycast's "Add Script Directory" / local development extension flow — no Raycast Store publishing required.

## Goals / Non-Goals

**Goals:**
- Single Raycast command: "Add Task" — a minimal form (title, project, priority)
- Populate project list by shelling out to `finish-em project list --json`
- Create task by shelling out to `finish-em task add <title> --project-id <id> --priority <n> --json`
- Show a success toast and close after submission
- Work with `finish-em` already in PATH (no PATH configuration needed in extension)

**Non-Goals:**
- Listing, searching, or completing tasks from Raycast
- Any other finish-em command surface (goals, reminders, settings)
- Publishing to the Raycast Store
- Syncing state / caching beyond a single command invocation

## Decisions

### Shell out to CLI binary vs. read SQLite directly

**Decision:** Shell out to `finish-em` binary via `execa` / Node `child_process`.

**Rationale:** The CLI already exposes `--json` output on every command and handles all business logic. Reading SQLite directly from the extension would duplicate schema knowledge and risk concurrent write issues. A spawn costs ~150–200ms — acceptable for a quick-add flow.

**Alternative considered:** Bundle a Node.js SQLite client and query the DB directly. Rejected: schema coupling, no write safety, duplicates logic.

### Extension structure: subdir in finish-em repo

**Decision:** `raycast/` at the repo root, with its own `package.json` and TypeScript config.

**Rationale:** Keeps the extension version-controlled alongside the CLI it depends on. Raycast supports loading local unpublished extensions from any directory.

**Alternative considered:** Separate repo. Rejected: extra overhead for a personal tool, no benefit.

### Project list loading strategy

**Decision:** Fetch project list once on command mount using `@raycast/utils`'s `useCachedPromise` (or equivalent `useEffect` + `useState`), not on every keystroke.

**Rationale:** Project list is small and infrequently changes. One spawn per command invocation is fine. Caching across invocations provides marginal value for added complexity.

### Priority field

**Decision:** Optional dropdown with values None / Low (4) / Medium (3) / High (2) / Urgent (1), mapping to finish-em's 1–4 integer priority scale.

**Rationale:** Matches the existing CLI `--priority 1-4` convention. None omits the flag entirely.

### Binary PATH

**Decision:** Use the full path `/usr/local/bin/finish-em` (or detected via `which finish-em` at dev time) OR rely on Raycast's shell environment inheriting the user's PATH when the extension script runs.

**Rationale:** Raycast extensions run in a Node.js subprocess that inherits the macOS launch environment, which may not include `~/.bun/bin`. The safe approach is to spawn via a login shell (`/bin/zsh -lc "finish-em ..."`) so PATH is fully initialized.

## Risks / Trade-offs

- **PATH not available in Raycast's Node env** → Mitigation: spawn via `/bin/zsh -lc` to get login shell PATH, or allow user to configure binary path in extension preferences.
- **Slow first load if binary cold-starts** → Mitigation: Bun binary is pre-compiled and starts fast (~100ms); acceptable.
- **Raycast API breaking changes** → Mitigation: pin `@raycast/api` version; personal use means no urgency to update.
- **Project list empty / CLI error** → Mitigation: show error toast with stderr output; don't silently fail.
