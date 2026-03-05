## ADDED Requirements

### Requirement: e key edits task title only
When focus is on the task list and a task is selected, the TUI SHALL treat the `e` key as "edit task title only." The system SHALL enter a text-edit mode with the current task title as the initial value and SHALL NOT open a field picker or any multi-field edit flow.

#### Scenario: e on selected task enters title edit
- **WHEN** the user has a task selected in the task list and presses `e`
- **THEN** the TUI enters task title edit mode with the input bar pre-filled with the selected task's title
- **AND** no field picker (e.g. project, due date, priority, notes) is shown

#### Scenario: Submitting task title edit updates only title
- **WHEN** the user is in task title edit mode and submits the input (e.g. Enter)
- **THEN** the system updates only the task's title with the submitted value
- **AND** no other task fields (due date, project, priority, notes, etc.) are changed

### Requirement: e key edits project name only
When focus is on the sidebar with a project selected (project view), the TUI SHALL treat the `e` key as "edit project name only." The system SHALL enter a text-edit mode with the current project name as the initial value and SHALL NOT open a project field picker or any multi-field edit flow.

#### Scenario: e on selected project enters name edit
- **WHEN** the user has a project selected in the sidebar (project view) and presses `e`
- **THEN** the TUI enters project name edit mode with the input bar pre-filled with the selected project's name
- **AND** no project field picker (e.g. name, emoji, description, dates) is shown

#### Scenario: Submitting project name edit updates only name
- **WHEN** the user is in project name edit mode and submits the input (e.g. Enter)
- **THEN** the system updates only the project's name with the submitted value
- **AND** no other project fields (emoji, description, dates) are changed

### Requirement: e key edits goal title only
When focus is on the goals panel (or goals in upcoming view) with a goal selected, the TUI SHALL treat the `e` key as "edit goal title only." The system SHALL enter a text-edit mode with the current goal title as the initial value.

#### Scenario: e on selected goal enters title edit
- **WHEN** the user has a goal selected in the goals panel (or upcoming goals) and presses `e`
- **THEN** the TUI enters goal title edit mode with the input bar pre-filled with the selected goal's title

#### Scenario: Submitting goal title edit updates only title
- **WHEN** the user is in goal title edit mode and submits the input (e.g. Enter)
- **THEN** the system updates only the goal's title with the submitted value

### Requirement: Help and hints describe e as text-only edit
The TUI SHALL document the `e` key in help and inline hints as editing the primary text only (task title, project name, or goal title) depending on context, and SHALL NOT describe `e` as opening a field picker for tasks or projects.

#### Scenario: Help modal describes e correctly
- **WHEN** the user opens the keyboard shortcuts help (e.g. `?`)
- **THEN** the entry for `e` (in Tasks, Projects, and Goals contexts as applicable) describes editing the task title, project name, or goal title
- **AND** the help does not state that `e` opens a field picker for tasks or projects

#### Scenario: Inline hints mention e edit consistently
- **WHEN** the UI shows an inline hint that refers to the `e` key (e.g. in dashboard, upcoming panel, or goals)
- **THEN** the hint indicates that `e` edits the primary text (title/name) of the focused item
- **AND** the hint does not refer to a field picker for `e`
