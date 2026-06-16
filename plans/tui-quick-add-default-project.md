# TUI Quick Add Default Project

## Current Rules

- Quick Add creates task in current project with title only: When the user adds a task via Quick Add (input bar with `a` key), the system SHALL create a task using only the provided title. The task SHALL be created in the currently selected project (or Inbox if no project is selected). The system SHALL NOT parse tokens, dates, priorities, or any other structured data from the input. The system SHALL NOT use AI processing.

## Related History

- `2026-03-05-auto-add-task-to-selected-project` -> `archive/2026-03-05-auto-add-task-to-selected-project.md`
- `2026-03-12-quick-add-simplification` -> `archive/2026-03-12-quick-add-simplification.md`
