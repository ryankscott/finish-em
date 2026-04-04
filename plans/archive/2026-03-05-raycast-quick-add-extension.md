# Raycast Quick Add Extension

_Archived change: `2026-03-05-raycast-quick-add-extension`_

## Summary

The finish-em TUI is great for focused task management, but there's no way to quickly capture a task from anywhere on the desktop without switching to the terminal. A Raycast extension provides a near-instant quick-add entry point — invoking it from any context takes under a second and results in a new task.

## Scope

- Add a `raycast/` subdirectory to the repo containing a standalone Raycast extension.
- The extension provides a single "Add Task" command: a form with a title field, project dropdown, and priority picker.
- The extension shells out to the `finish-em` CLI binary (`finish-em task add ... --json`) to create tasks and (`finish-em project list --json`) to populate the project list.
- No changes to the finish-em CLI, TUI, server, or database schema.
- Single Raycast command: "Add Task" — a minimal form (title, project, priority)
- Populate project list by shelling out to `finish-em project list --json`
- Create task by shelling out to `finish-em task add <title> --project-id <id> --priority <n> --json`
- Show a success toast and close after submission
- Work with `finish-em` already in PATH (no PATH configuration needed in extension)
- Listing, searching, or completing tasks from Raycast
- Any other finish-em command surface (goals, reminders, settings)
- Publishing to the Raycast Store
- Syncing state / caching beyond a single command invocation
- Impact: New directory: `raycast/` at the repo root — a self-contained Raycast extension with its own `package.json`, TypeScript config, and source files.
- Impact: Dependencies: `@raycast/api` (Raycast SDK), `@raycast/utils` (for `useExec` / `useCachedPromise`).
- Impact: No changes to existing finish-em source code.
- Impact: Requires `finish-em` binary to be installed and available in PATH.
- Related capabilities: `raycast-quick-add`

## Notes

- Shell out to CLI binary vs. read SQLite directly: **Decision:** Shell out to `finish-em` binary via `execa` / Node `child_process`.
- Extension structure: subdir in finish-em repo: **Decision:** `raycast/` at the repo root, with its own `package.json` and TypeScript config.
- Project list loading strategy: **Decision:** Fetch project list once on command mount using `@raycast/utils`'s `useCachedPromise` (or equivalent `useEffect` + `useState`), not on every keystroke.
- Priority field: **Decision:** Optional dropdown with values None / Low (4) / Medium (3) / High (2) / Urgent (1), mapping to finish-em's 1–4 integer priority scale.
- Binary PATH: **Decision:** Use the full path `/usr/local/bin/finish-em` (or detected via `which finish-em` at dev time) OR rely on Raycast's shell environment inheriting the user's PATH when the extension script runs.
- **PATH not available in Raycast's Node env** → Mitigation: spawn via `/bin/zsh -lc` to get login shell PATH, or allow user to configure binary path in extension preferences.
- **Slow first load if binary cold-starts** → Mitigation: Bun binary is pre-compiled and starts fast (~100ms); acceptable.
- **Raycast API breaking changes** → Mitigation: pin `@raycast/api` version; personal use means no urgency to update.
- **Project list empty / CLI error** → Mitigation: show error toast with stderr output; don't silently fail.

## Implementation Phases

1. Extension Scaffold
   - [done] Create `raycast/` directory at repo root
   - [done] Create `raycast/package.json` with Raycast extension manifest (name, description, commands, author, license, dependencies: `@raycast/api`, `@raycast/utils`)
   - [done] Create `raycast/tsconfig.json` extending Raycast's default TypeScript config
   - [done] Install dependencies (`npm install` inside `raycast/`)
   - [done] Add `raycast/` to repo `.gitignore` exclusions for `node_modules` (if not already covered)
2. CLI Helper
   - [done] Create `raycast/src/cli.ts` — a small helper that runs a finish-em command via `/bin/zsh -lc` and returns parsed JSON output
   - [done] Handle non-zero exit codes in the helper: throw an error with stderr content
3. Add Task Command
   - [done] Create `raycast/src/add-task.tsx` — the main command file
   - [done] Implement project list fetching using `useCachedPromise` calling `finish-em project list --json`
   - [done] Build the form with three fields: title (required TextField), project (optional Dropdown), priority (optional Dropdown)
   - [done] Populate project dropdown from fetched projects, with a leading "No Project" option
   - [done] Populate priority dropdown with: None, Urgent (1), High (2), Medium (3), Low (4)
   - [done] Implement form submission handler: construct CLI args and call `finish-em task add` via the CLI helper
   - [done] Show success toast with task title on creation, then call `popToRoot()` to close Raycast
   - [done] Show error toast with stderr on CLI failure, keep form open
4. Smoke Test
   - Load extension in Raycast via "Add Script Directory" pointing to `raycast/`
   - Verify "Add Task" command appears in Raycast
   - Verify project dropdown populates with real projects
   - Create a task with project and priority — confirm it appears in `finish-em task list`
   - Create a task with title only — confirm it is created without errors
   - Verify error toast appears when binary path is wrong or command fails
