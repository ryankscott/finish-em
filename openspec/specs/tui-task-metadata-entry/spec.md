## Purpose

Define tokenized metadata entry and autocomplete behavior for TUI task creation.

## Requirements

### Requirement: TUI task deletion is soft and reversible
The TUI MUST soft-delete tasks (set `deleted_at`) rather than permanently removing them, so users can recover accidentally deleted tasks.

#### Scenario: Pressing `d` soft-deletes the selected task
- **WHEN** the user presses `d` on a selected task in any non-deleted view
- **THEN** the task is soft-deleted (removed from current view) without permanent data loss
- **AND** the task appears in the Deleted view

#### Scenario: `d` key shows status confirmation
- **WHEN** the user presses `d` on a selected task
- **THEN** the status bar displays "Task deleted"
- **AND** the task list refreshes

### Requirement: TUI supports `u` hotkey to undelete a task
The TUI SHALL bind the `u` key to restore the selected task when the current view is "deleted".

#### Scenario: `u` restores the selected deleted task
- **WHEN** the user is in the Deleted view and presses `u` with a task selected
- **THEN** the selected task is removed from the Deleted view
- **AND** the task is restored to its original project/status view
- **AND** a toast notification "Task restored" is shown

#### Scenario: `u` is inactive in non-deleted views
- **WHEN** the user presses `u` while in Today, Inbox, Upcoming, Completed, or a Project view
- **THEN** no action occurs

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

### Requirement: TUI provides autocomplete for task metadata tokens
The TUI MUST provide inline autocomplete suggestions for recognized task metadata tokens to reduce syntax errors and omission.

#### Scenario: Suggest token keys and deterministic values during task entry
- **WHEN** the user types in TUI task creation input
- **THEN** the system offers deterministic suggestions for supported token keys (such as `title:`, `project:`, `priority:`, `due:`, `scheduled:`, `notes:`, `parent:`, `recurs:`)
- **AND** where deterministic, offers value hints (such as known project names, priority values, recurrence presets)
- **AND** allows keyboard acceptance of a suggestion without leaving input mode

### Requirement: TUI validates required task metadata before create
The TUI MUST block submission when required task metadata is missing or invalid and present actionable validation feedback.

#### Scenario: Reject submission when required task metadata is missing
- **WHEN** the user submits tokenized task input without required metadata
- **THEN** the system does not call task creation
- **AND** presents a validation message describing what is missing

#### Scenario: Allow fast path for plain quick-add entry
- **WHEN** the user submits plain text without metadata tokens
- **THEN** the system treats the value as task title for backward compatibility
- **AND** creates the task using existing defaults for omitted optional metadata
