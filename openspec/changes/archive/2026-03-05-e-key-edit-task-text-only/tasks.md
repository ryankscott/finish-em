## 1. Task: e key edits title only

- [x] 1.1 In useMainKeys, when user presses `e` with a task selected, set input mode to `editTask` and set initial input value to `selectedTask.title` only (remove use of `serializeTaskToEditInput` for this path)
- [x] 1.2 Ensure editTask submit path updates only the task title (e.g. in useSubmitInput, for `editTask` mode send a patch containing only `title` from the submitted value so other fields are not changed)

## 2. Project: e key edits name only

- [x] 2.1 In useMainKeys, when user presses `e` in project view with a project selected, set input mode to `editProjectName` and set initial value to `activeProject.name`; do not set `projectEditPicker` or open the project field picker
- [x] 2.2 Verify editProjectName submit path already updates only project name (no code change if already correct)

## 3. Goal: e key behavior

- [x] 3.1 Confirm goal `e` already sets `editGoalTitle` with goal title and submit updates only title (no change if already correct)

## 4. Help and hints

- [x] 4.1 Update HelpModal.tsx: describe `e` as editing task title, project name, or goal title (remove "field picker" and "j/k choose" for tasks and projects)
- [x] 4.2 Update inline hints that mention `e` (e.g. Dashboard, UpcomingPanel, SettingsPanel) to say edit title/name where applicable

## 5. Tests

- [x] 5.1 Update or add keybinding/input-mode tests so `e` on task enters editTask with title only and does not open task edit picker
- [x] 5.2 Update or add tests so `e` on project enters editProjectName with project name and does not open project edit picker
- [x] 5.3 Add or adjust tests that submit in editTask mode to assert only title is updated when value is plain text
