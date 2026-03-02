## 1. Extension Scaffold

- [x] 1.1 Create `raycast/` directory at repo root
- [x] 1.2 Create `raycast/package.json` with Raycast extension manifest (name, description, commands, author, license, dependencies: `@raycast/api`, `@raycast/utils`)
- [x] 1.3 Create `raycast/tsconfig.json` extending Raycast's default TypeScript config
- [x] 1.4 Install dependencies (`npm install` inside `raycast/`)
- [x] 1.5 Add `raycast/` to repo `.gitignore` exclusions for `node_modules` (if not already covered)

## 2. CLI Helper

- [x] 2.1 Create `raycast/src/cli.ts` — a small helper that runs a finish-em command via `/bin/zsh -lc` and returns parsed JSON output
- [x] 2.2 Handle non-zero exit codes in the helper: throw an error with stderr content

## 3. Add Task Command

- [x] 3.1 Create `raycast/src/add-task.tsx` — the main command file
- [x] 3.2 Implement project list fetching using `useCachedPromise` calling `finish-em project list --json`
- [x] 3.3 Build the form with three fields: title (required TextField), project (optional Dropdown), priority (optional Dropdown)
- [x] 3.4 Populate project dropdown from fetched projects, with a leading "No Project" option
- [x] 3.5 Populate priority dropdown with: None, Urgent (1), High (2), Medium (3), Low (4)
- [x] 3.6 Implement form submission handler: construct CLI args and call `finish-em task add` via the CLI helper
- [x] 3.7 Show success toast with task title on creation, then call `popToRoot()` to close Raycast
- [x] 3.8 Show error toast with stderr on CLI failure, keep form open

## 4. Smoke Test

- [ ] 4.1 Load extension in Raycast via "Add Script Directory" pointing to `raycast/`
- [ ] 4.2 Verify "Add Task" command appears in Raycast
- [ ] 4.3 Verify project dropdown populates with real projects
- [ ] 4.4 Create a task with project and priority — confirm it appears in `finish-em task list`
- [ ] 4.5 Create a task with title only — confirm it is created without errors
- [ ] 4.6 Verify error toast appears when binary path is wrong or command fails
