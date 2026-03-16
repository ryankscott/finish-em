## ADDED Requirements

### Requirement: TUI provides a full-form modal for task creation
The TUI SHALL provide a multi-field create modal, triggered by `A` from any view, that presents all task attributes in a single keyboard-driven flow and creates the task on submission.

#### Scenario: A opens the Create Task modal from any view
- **WHEN** the user presses `A` (shift+A) from any view or focus area
- **THEN** the TUI opens a full-screen `CreateTaskModal` overlay
- **AND** the modal is positioned above all existing content
- **AND** focus begins on the Title field

#### Scenario: Esc dismisses the modal without creating a task
- **WHEN** the Create Task modal is open
- **AND** the user presses `Esc`
- **THEN** the modal closes
- **AND** no task is created
- **AND** the TUI returns to its previous state

### Requirement: Create Task modal exposes all task fields
The `CreateTaskModal` SHALL present all task fields — title, project, priority, due date, scheduled date, recurrence, and notes — in a single scrollable form.

#### Scenario: Modal displays all task fields
- **WHEN** the Create Task modal is open
- **THEN** the modal displays rows for: Title, Project, Priority, Due date, Scheduled date, Recurrence, and Notes
- **AND** each field shows its current value (or empty placeholder)
- **AND** a "Create Task" submit row is shown at the bottom of the field list

#### Scenario: Active field is visually indicated
- **WHEN** the Create Task modal is open with a field active
- **THEN** the active field row is highlighted (e.g. cursor marker `❯` and distinct color)
- **AND** all other field rows are rendered in their inactive style

### Requirement: Create Task modal supports keyboard navigation between fields
The TUI SHALL allow the user to move between modal fields using `j`/`k` or `Tab`/`Shift+Tab`.

#### Scenario: j / Tab advances to the next field
- **WHEN** the Create Task modal is open
- **AND** the user presses `j` or `Tab`
- **THEN** focus moves to the next field in order
- **AND** wraps from the last field to the first

#### Scenario: k / Shift+Tab moves to the previous field
- **WHEN** the Create Task modal is open
- **AND** the user presses `k` or `Shift+Tab`
- **THEN** focus moves to the previous field in order
- **AND** wraps from the first field to the last

### Requirement: Create Task modal supports direct text entry on text fields
The TUI SHALL allow the user to type directly into text fields (Title, Due date, Scheduled date, Notes) using the existing text-input keybinding system.

#### Scenario: Typing updates the active text field value
- **WHEN** the Create Task modal is open
- **AND** the active field is a text field (Title, Due date, Scheduled date, or Notes)
- **AND** the user types characters
- **THEN** those characters are appended to the field's current value
- **AND** standard text editing keys (Backspace, Ctrl+W, Home, End, arrow keys) work as in all other text input modes

#### Scenario: E opens CalendarPicker from a date text field
- **WHEN** the Create Task modal is open
- **AND** the active field is Due date or Scheduled date
- **AND** the user presses `E`
- **THEN** the TUI opens the appropriate CalendarPicker overlay
- **AND** on date selection, the chosen date is written back to the modal field
- **AND** the modal remains open with focus on the date field

### Requirement: Create Task modal uses EnumPicker for enum fields
The TUI SHALL open the existing `EnumPicker` when the user confirms on an enum field (Project, Priority, Recurrence).

#### Scenario: Enter on an enum field opens EnumPicker
- **WHEN** the Create Task modal is open
- **AND** the active field is Project, Priority, or Recurrence
- **AND** the user presses `Enter`
- **THEN** the TUI opens the `EnumPicker` with the appropriate items for that field
- **AND** the picker is displayed on top of the modal

#### Scenario: EnumPicker selection updates the modal field
- **WHEN** the `EnumPicker` was opened from a Create Task modal enum field
- **AND** the user confirms a selection
- **THEN** the selected value is stored in the modal's field value map
- **AND** the modal is displayed again with the updated field value
- **AND** no task is created yet

#### Scenario: EnumPicker cancellation returns to modal
- **WHEN** the `EnumPicker` was opened from a Create Task modal enum field
- **AND** the user presses `Esc`
- **THEN** the picker closes
- **AND** the modal field value is unchanged
- **AND** the modal remains open

### Requirement: Create Task modal validates required fields before submission
The TUI SHALL block task creation if the Title field is empty and indicate the error inline.

#### Scenario: Submit with empty Title shows validation error
- **WHEN** the Create Task modal is open
- **AND** the Title field is empty
- **AND** the user navigates to the "Create Task" row and presses `Enter`
- **THEN** no task is created
- **AND** the modal displays an inline validation message indicating Title is required
- **AND** focus moves to the Title field

### Requirement: Create Task modal submits and dismisses on successful creation
The TUI SHALL create the task with all collected field values when the user submits from the "Create Task" row (or presses `Enter` on the Notes field).

#### Scenario: Submitting a valid form creates the task and closes the modal
- **WHEN** the Create Task modal is open
- **AND** the Title field is non-empty
- **AND** the user confirms submission (navigates to "Create Task" row and presses `Enter`)
- **THEN** the TUI calls task creation with all collected field values
- **AND** the modal closes
- **AND** the task list refreshes
- **AND** a toast notification "Task created" is shown
