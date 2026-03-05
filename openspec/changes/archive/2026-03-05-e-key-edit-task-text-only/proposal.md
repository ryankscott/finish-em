# Proposal: e key edits text only (tasks, projects, goals)

## Why

Pressing `e` in the TUI currently opens a field picker for tasks and projects (and enters an edit flow for goals). Users who only want to change the title/text of the focused item must step through the picker or multiple flows. Making `e` directly edit the primary text (task title, project name, goal title) keeps the common case fast and leaves other metadata to dedicated shortcuts or a future picker.

## What Changes

- **Tasks:** `e` on a selected task enters inline text-edit for the task title only. No field picker. Other task fields (due, scheduled, project, priority, notes, etc.) remain available via existing or future shortcuts (e.g. `c` for notes).
- **Projects:** `e` on a selected project enters inline text-edit for the project name only. No project field picker. Other project fields (emoji, description, dates) are out of scope for this change or reachable by other means.
- **Goals:** `e` on a selected goal enters inline text-edit for the goal title only. No other goal fields are edited by `e`.
- Help and hints SHALL be updated to describe the new behavior for tasks, projects, and goals.
- **BREAKING:** Current behavior (field picker for tasks/projects) is removed for the `e` key. Users who relied on `e` to open the picker will need another entry point if we reintroduce a full metadata picker later.

## Capabilities

### New Capabilities

- `tui-e-key-text-edit`: The TUI SHALL treat the `e` key as “edit primary text only” when focus is on a task, project, or goal. For tasks this is the task title; for projects the project name; for goals the goal title. No metadata picker or multi-field flow is triggered by `e`.

### Modified Capabilities

- `tui-task-metadata-entry`: Requirement scope is unchanged (tokenized task creation and autocomplete). The change only affects the TUI keybinding for editing an existing task’s title (e key), not the spec’s create/metadata requirements. No delta spec required unless we later define “task edit keybindings” in this spec.
- If a spec exists that explicitly requires “e opens task/project field picker,” it would need a delta to relax that and require “e edits primary text only” for tasks, projects, and goals. (No such spec was found in `openspec/specs/`; only `tui-task-metadata-entry` is related and it does not mandate the picker.)

## Impact

- **TUI:** Key handling in task list, sidebar (projects), and goals/upcoming panel; input bar mode for `editTask`, `editProjectName`, `editGoalTitle`; removal or relocation of the current task/project field picker triggered by `e`.
- **Help:** `HelpModal.tsx` and any inline hints (e.g. Dashboard, UpcomingPanel, SettingsPanel) that mention `e` for “edit” or “field picker.”
- **Tests:** Keybinding and input-mode tests (e.g. `App.keybindings.test.ts`, `useMainKeys`, `useNavigation`, integration tests that assume `e` opens a picker).
