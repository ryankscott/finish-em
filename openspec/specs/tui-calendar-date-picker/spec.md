## Purpose

Define the interactive terminal calendar picker for visual date selection in TUI date-editing flows.

## Requirements

### Requirement: TUI provides a calendar picker for date fields
The TUI SHALL provide an interactive terminal calendar picker that allows users to select a date visually using keyboard navigation when editing any date field (due date, scheduled date, project start date, project end date).

#### Scenario: Open calendar picker from date text-input mode
- **WHEN** the user is in a date text-input mode (`editDueDate`, `editScheduledDate`, `editProjectStartDate`, or `editProjectEndDate`)
- **AND** presses `E`
- **THEN** the TUI closes the text input bar
- **AND** opens the calendar picker overlay in the mode corresponding to that date field
- **AND** the calendar initialises with the cursor on the field's current date value if set, or today if the field is blank

#### Scenario: Calendar picker renders a month grid
- **WHEN** the calendar picker is open
- **THEN** the TUI displays a month header (e.g. `March 2026`)
- **AND** a 7-column weekday header (`Su Mo Tu We Th Fr Sa`)
- **AND** day numbers laid out in the correct weekday columns for the visible month
- **AND** the cursor date is highlighted

#### Scenario: Navigate days with arrow keys
- **WHEN** the calendar picker is open
- **AND** the user presses a left/right/up/down arrow key (or `h`/`l`/`k`/`j`)
- **THEN** the cursor moves by 1 day (left/right) or 7 days (up/down)
- **AND** if the cursor moves outside the visible month, the visible month advances or retreats accordingly

#### Scenario: Step through months with bracket keys
- **WHEN** the calendar picker is open
- **AND** the user presses `[` or `]`
- **THEN** the visible month retreats (`[`) or advances (`]`) by one month
- **AND** the cursor date is clamped to the last day of the new month if it would overflow

#### Scenario: Select a date with Enter
- **WHEN** the calendar picker is open
- **AND** the user presses Enter
- **THEN** the calendar picker closes
- **AND** the selected date field is updated to the cursor date in `YYYY-MM-DD` format (time defaulting to 9:00 AM via existing `parseDatePhrase` logic)
- **AND** the change is persisted immediately

#### Scenario: Clear date with `c`
- **WHEN** the calendar picker is open
- **AND** the user presses `c`
- **THEN** the calendar picker closes
- **AND** the date field is cleared (set to null)

#### Scenario: Cancel with Escape
- **WHEN** the calendar picker is open
- **AND** the user presses Escape
- **THEN** the calendar picker closes
- **AND** the date field is unchanged

### Requirement: Calendar picker hint text is shown in field pickers
The TUI MUST display a hint to users that the calendar picker is available when a date field is selected for editing.

#### Scenario: TaskEditPicker shows calendar hint for date fields
- **WHEN** the user opens the task edit picker
- **AND** selects the "Due date" or "Scheduled date" row
- **THEN** the hint text includes the `E` key as an option to open the calendar picker

#### Scenario: ProjectEditPicker shows calendar hint for date fields
- **WHEN** the user opens the project edit picker
- **AND** selects the "Start date" or "End date" row
- **THEN** the hint text includes the `E` key as an option to open the calendar picker
