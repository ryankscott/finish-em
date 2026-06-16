# E Key Edit Task Text Only

_Archived change: `2026-03-05-e-key-edit-task-text-only`_

## Summary

Pressing `e` in the TUI currently opens a field picker for tasks and projects (and enters an edit flow for goals). Users who only want to change the title/text of the focused item must step through the picker or multiple flows. Making `e` directly edit the primary text (task title, project name, goal title) keeps the common case fast and leaves other metadata to dedicated shortcuts or a future picker.

## Scope

- **Tasks:** `e` on a selected task enters inline text-edit for the task title only. No field picker. Other task fields (due, scheduled, project, priority, notes, etc.) remain available via existing or future shortcuts (e.g. `c` for notes).
- **Projects:** `e` on a selected project enters inline text-edit for the project name only. No project field picker. Other project fields (emoji, description, dates) are out of scope for this change or reachable by other means.
- **Goals:** `e` on a selected goal enters inline text-edit for the goal title only. No other goal fields are edited by `e`.
- Help and hints SHALL be updated to describe the new behavior for tasks, projects, and goals.
- **BREAKING:** Current behavior (field picker for tasks/projects) is removed for the `e` key. Users who relied on `e` to open the picker will need another entry point if we reintroduce a full metadata picker later.
- Map `e` to “edit primary text only” for task, project, and goal in the TUI.
- Reuse existing input modes `editTask`, `editProjectName`, and `editGoalTitle`; ensure task and project flows no longer open the field picker on `e`.
- Update Help and inline hints so they describe the new behavior.
- Adding a new shortcut or UI to reopen the full task/project field picker (can be a follow-up).
- Changing behavior of other keys (e.g. `c` for notes, date/priority shortcuts).
- Changing tokenized task creation or metadata entry specs.
- Impact: **TUI:** Key handling in task list, sidebar (projects), and goals/upcoming panel; input bar mode for `editTask`, `editProjectName`, `editGoalTitle`; removal or relocation of the current task/project field picker triggered by `e`.
- Impact: **Help:** `HelpModal.tsx` and any inline hints (e.g. Dashboard, UpcomingPanel, SettingsPanel) that mention `e` for “edit” or “field picker.”
- Impact: **Tests:** Keybinding and input-mode tests (e.g. `App.keybindings.test.ts`, `useMainKeys`, `useNavigation`, integration tests that assume `e` opens a picker).
- Related capabilities: `tui-e-key-text-edit`

## Notes

- 1. **e key → set input mode directly (no picker)** When focus is on a task, project, or goal and the user presses `e`, the app sets the appropriate text-edit mode (`editTask`, `editProjectName`, or `editGoalTitle`) and shows the input bar with the current title/name pre-filled. No intermediate picker component is shown. *Rationale:* Matches proposal; keeps the common case (rename) one keypress away. *Alternative considered:* Keep picker but add a “title” shortcut (e.g. `e` then `t`) — rejected because proposal explicitly asks for “e edits text only.”
- **Removing picker from e:** Users who used `e` to open the picker lose that path. [Risk] → Mitigation: document in release notes; consider adding an alternative shortcut (e.g. `E` or `Ctrl+e`) for “edit any field” in a follow-up.
- **Consistency across contexts:** Task/project/goal all behave the same (e = text only). [Risk] → Low; design enforces that consistency.
- Open questions: - Whether to add a new shortcut for “open task/project field picker” in this change or a later one (proposal leaves it as possible follow-up).

## Implementation Phases

1. Task: e key edits title only
   - [done] In useMainKeys, when user presses `e` with a task selected, set input mode to `editTask` and set initial input value to `selectedTask.title` only (remove use of `serializeTaskToEditInput` for this path)
   - [done] Ensure editTask submit path updates only the task title (e.g. in useSubmitInput, for `editTask` mode send a patch containing only `title` from the submitted value so other fields are not changed)
2. Project: e key edits name only
   - [done] In useMainKeys, when user presses `e` in project view with a project selected, set input mode to `editProjectName` and set initial value to `activeProject.name`; do not set `projectEditPicker` or open the project field picker
   - [done] Verify editProjectName submit path already updates only project name (no code change if already correct)
3. Goal: e key behavior
   - [done] Confirm goal `e` already sets `editGoalTitle` with goal title and submit updates only title (no change if already correct)
4. Help and hints
   - [done] Update HelpModal.tsx: describe `e` as editing task title, project name, or goal title (remove "field picker" and "j/k choose" for tasks and projects)
   - [done] Update inline hints that mention `e` (e.g. Dashboard, UpcomingPanel, SettingsPanel) to say edit title/name where applicable
5. Tests
   - [done] Update or add keybinding/input-mode tests so `e` on task enters editTask with title only and does not open task edit picker
   - [done] Update or add tests so `e` on project enters editProjectName with project name and does not open project edit picker
   - [done] Add or adjust tests that submit in editTask mode to assert only title is updated when value is plain text
