## Context

The TUI uses the `e` key in three places: task list (opens task field picker), sidebar/project view (opens project field picker), and goals/upcoming (edit goal). Each picker lets users choose which field to edit (due date, project, priority, notes, etc. for tasks; name, emoji, description, dates for projects). The proposal is to make `e` in all three contexts only edit the primary text (task title, project name, goal title), with no picker.

Current implementation: key handling lives in `useMainKeys.ts`; input modes like `editTask`, `editProject`, and `editGoalTitle` exist; task/project flows currently open `TaskEditPicker` / `ProjectEditPicker` when `e` is pressed. Goals already use a single-field edit flow (`editGoalTitle`).

## Goals / Non-Goals

**Goals:**
- Map `e` to “edit primary text only” for task, project, and goal in the TUI.
- Reuse existing input modes `editTask`, `editProjectName`, and `editGoalTitle`; ensure task and project flows no longer open the field picker on `e`.
- Update Help and inline hints so they describe the new behavior.

**Non-Goals:**
- Adding a new shortcut or UI to reopen the full task/project field picker (can be a follow-up).
- Changing behavior of other keys (e.g. `c` for notes, date/priority shortcuts).
- Changing tokenized task creation or metadata entry specs.

## Decisions

1. **e key → set input mode directly (no picker)**  
   When focus is on a task, project, or goal and the user presses `e`, the app sets the appropriate text-edit mode (`editTask`, `editProjectName`, or `editGoalTitle`) and shows the input bar with the current title/name pre-filled. No intermediate picker component is shown.  
   *Rationale:* Matches proposal; keeps the common case (rename) one keypress away.  
   *Alternative considered:* Keep picker but add a “title” shortcut (e.g. `e` then `t`) — rejected because proposal explicitly asks for “e edits text only.”

2. **Remove or bypass picker entry from e**  
   Task and project handlers that currently open `TaskEditPicker` / `ProjectEditPicker` on `e` will be changed to set `editTask` / `editProjectName` (with initial value from selected item) instead. Picker components may remain in the codebase for a future entry point (e.g. another key or menu) but are not invoked by `e`.  
   *Rationale:* Clear behavioral change with minimal scope; no new dependencies.

3. **Help and hints**  
   Update `HelpModal.tsx` so the single `e` row (and any section-specific rows for Tasks/Projects/Goals) describes “Edit task title”, “Edit project name”, “Edit goal title” as appropriate. Remove or reword “field picker” and “picker (j/k choose…)”. Update any inline hints (e.g. Dashboard, UpcomingPanel) that say “e edit” to stay consistent (e.g. “e edit title”).  
   *Rationale:* Proposal requires help/hints to reflect new behavior.

## Risks / Trade-offs

- **Removing picker from e:** Users who used `e` to open the picker lose that path. [Risk] → Mitigation: document in release notes; consider adding an alternative shortcut (e.g. `E` or `Ctrl+e`) for “edit any field” in a follow-up.
- **Consistency across contexts:** Task/project/goal all behave the same (e = text only). [Risk] → Low; design enforces that consistency.

## Migration Plan

Code-only change; no data migration. Deploy as usual. Rollback: revert the commit(s) that change key handling and help text.

## Open Questions

- Whether to add a new shortcut for “open task/project field picker” in this change or a later one (proposal leaves it as possible follow-up).
