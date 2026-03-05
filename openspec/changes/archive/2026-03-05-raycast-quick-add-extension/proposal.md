## Why

The finish-em TUI is great for focused task management, but there's no way to quickly capture a task from anywhere on the desktop without switching to the terminal. A Raycast extension provides a near-instant quick-add entry point — invoking it from any context takes under a second and results in a new task.

## What Changes

- Add a `raycast/` subdirectory to the repo containing a standalone Raycast extension.
- The extension provides a single "Add Task" command: a form with a title field, project dropdown, and priority picker.
- The extension shells out to the `finish-em` CLI binary (`finish-em task add ... --json`) to create tasks and (`finish-em project list --json`) to populate the project list.
- No changes to the finish-em CLI, TUI, server, or database schema.

## Capabilities

### New Capabilities
- `raycast-quick-add`: A Raycast extension command that presents a minimal form (title, project, priority) and creates a task by invoking the finish-em CLI binary.

### Modified Capabilities

## Impact

- New directory: `raycast/` at the repo root — a self-contained Raycast extension with its own `package.json`, TypeScript config, and source files.
- Dependencies: `@raycast/api` (Raycast SDK), `@raycast/utils` (for `useExec` / `useCachedPromise`).
- No changes to existing finish-em source code.
- Requires `finish-em` binary to be installed and available in PATH.
