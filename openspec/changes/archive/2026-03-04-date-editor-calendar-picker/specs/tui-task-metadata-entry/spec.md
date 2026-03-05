## MODIFIED Requirements

### Requirement: TUI task creation supports metadata token entry
The TUI SHALL support task creation via tokenized metadata input so users can provide task metadata fields in a single keyboard-first flow.

#### Scenario: Parse tokenized task metadata input
- **WHEN** a user initiates TUI task creation and enters tokenized metadata input (for example `title:Ship docs project:Work p1 due:tomorrow`)
- **THEN** the system parses recognized metadata tokens into a task create payload
- **AND** unrecognized or malformed tokens are surfaced as warnings before submission

#### Scenario: Open calendar picker from due date text input via E key
- **WHEN** the user is editing a task due date via the `editDueDate` text-input mode
- **AND** presses `E`
- **THEN** the TUI switches to the `calendarPickerDueDate` calendar picker mode
- **AND** the calendar is pre-seeded with the task's current due date if set

#### Scenario: Open calendar picker from scheduled date text input via E key
- **WHEN** the user is editing a task scheduled date via the `editScheduledDate` text-input mode
- **AND** presses `E`
- **THEN** the TUI switches to the `calendarPickerScheduledDate` calendar picker mode
- **AND** the calendar is pre-seeded with the task's current scheduled date if set
