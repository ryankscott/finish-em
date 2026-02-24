## ADDED Requirements

### Requirement: TUI task creation supports metadata token entry
The TUI SHALL support task creation via tokenized metadata input so users can provide task metadata fields in a single keyboard-first flow.

#### Scenario: Parse tokenized task metadata input
- **WHEN** a user initiates TUI task creation and enters tokenized metadata input (for example `title:Ship docs project:Work p1 due:tomorrow`)
- **THEN** the system parses recognized metadata tokens into a task create payload
- **AND** unrecognized or malformed tokens are surfaced as warnings before submission

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
