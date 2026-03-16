## ADDED Requirements

### Requirement: TUI provides a full-form modal for project creation
The TUI SHALL provide a multi-field create modal, triggered by `P` from any view, that presents all project attributes in a single keyboard-driven flow and creates the project on submission.

#### Scenario: P opens the Create Project modal from any view
- **WHEN** the user presses `P` (shift+P) from any view or focus area
- **THEN** the TUI opens a full-screen `CreateProjectModal` overlay
- **AND** the modal is positioned above all existing content
- **AND** focus begins on the Name field

#### Scenario: Esc dismisses the modal without creating a project
- **WHEN** the Create Project modal is open
- **AND** the user presses `Esc`
- **THEN** the modal closes
- **AND** no project is created
- **AND** the TUI returns to its previous state

### Requirement: Create Project modal exposes all project fields
The `CreateProjectModal` SHALL present all project fields — name, emoji, description, start date, end date, Jira Discovery URL, Jira Delivery URL, and Confluence URL — in a single form.

#### Scenario: Modal displays all project fields
- **WHEN** the Create Project modal is open
- **THEN** the modal displays rows for: Name, Emoji, Description, Start date, End date, Jira Discovery, Jira Delivery, and Confluence
- **AND** each field shows its current value (or empty placeholder)
- **AND** a "Create Project" submit row is shown at the bottom of the field list

#### Scenario: Active field is visually indicated
- **WHEN** the Create Project modal is open with a field active
- **THEN** the active field row is highlighted (cursor marker `❯` and distinct color)
- **AND** all other field rows are rendered in their inactive style

### Requirement: Create Project modal supports keyboard navigation between fields
The TUI SHALL allow the user to move between modal fields using `j`/`k` or `Tab`/`Shift+Tab`.

#### Scenario: j / Tab advances to the next field
- **WHEN** the Create Project modal is open
- **AND** the user presses `j` or `Tab`
- **THEN** focus moves to the next field in order
- **AND** wraps from the last field to the first

#### Scenario: k / Shift+Tab moves to the previous field
- **WHEN** the Create Project modal is open
- **AND** the user presses `k` or `Shift+Tab`
- **THEN** focus moves to the previous field in order
- **AND** wraps from the first field to the last

### Requirement: Create Project modal supports direct text entry on all fields
The TUI SHALL allow the user to type directly into all fields (Name, Emoji, Description, Start date, End date, Jira Discovery, Jira Delivery, Confluence) using the existing text-input keybinding system.

#### Scenario: Typing updates the active field value
- **WHEN** the Create Project modal is open
- **AND** the active field is any text field
- **AND** the user types characters
- **THEN** those characters are appended to the field's current value
- **AND** standard text editing keys (Backspace, Ctrl+W, Home, End, arrow keys) work as in all other text input modes

#### Scenario: E opens CalendarPicker from a date field
- **WHEN** the Create Project modal is open
- **AND** the active field is Start date or End date
- **AND** the user presses `E`
- **THEN** the TUI opens the appropriate CalendarPicker overlay (`calendarPickerProjectStartDate` or `calendarPickerProjectEndDate`)
- **AND** on date selection, the chosen date is written back to the modal field
- **AND** the modal remains open with focus on the date field

### Requirement: Create Project modal validates required fields before submission
The TUI SHALL block project creation if the Name field is empty and indicate the error inline.

#### Scenario: Submit with empty Name shows validation error
- **WHEN** the Create Project modal is open
- **AND** the Name field is empty
- **AND** the user navigates to the "Create Project" row and presses `Enter`
- **THEN** no project is created
- **AND** the modal displays an inline validation message indicating Name is required
- **AND** focus moves to the Name field

### Requirement: Create Project modal submits and dismisses on successful creation
The TUI SHALL create the project with all collected field values when the user submits from the "Create Project" row.

#### Scenario: Submitting a valid form creates the project and closes the modal
- **WHEN** the Create Project modal is open
- **AND** the Name field is non-empty
- **AND** the user confirms submission (navigates to "Create Project" row and presses `Enter`)
- **THEN** the TUI calls project creation with all collected field values
- **AND** the modal closes
- **AND** the project list refreshes
- **AND** a toast notification "Project created" is shown
