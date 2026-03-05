## MODIFIED Requirements

### Requirement: TUI project creation supports metadata token entry
The TUI SHALL support project creation and project-view editing via tokenized metadata input so users can provide and update project metadata fields in a single keyboard-first flow.

#### Scenario: Parse tokenized project metadata input for create
- **WHEN** a user initiates TUI project creation and enters tokenized metadata input (for example `name:Roadmap color:#3b82f6 emoji:🚀`)
- **THEN** the system parses recognized metadata tokens into a project create payload
- **AND** unrecognized or malformed tokens are surfaced as warnings before submission

#### Scenario: Parse tokenized project metadata input for project-view edit
- **WHEN** a user initiates project edit in TUI project view and enters tokenized metadata input (for example `name:Q2 Roadmap emoji:🧭 start:2026-03-01 end:2026-06-30 description:Planning`)
- **THEN** the system parses recognized metadata tokens into a project update payload
- **AND** updates only supported editable metadata fields (`name`, `emoji`, `description`, `startAt`, `endAt`)
- **AND** unrecognized or malformed tokens are surfaced as warnings before submission

### Requirement: TUI provides autocomplete for project metadata tokens
The TUI MUST provide inline autocomplete suggestions for recognized project metadata tokens to reduce syntax errors and omission in project creation and project-view editing.

#### Scenario: Suggest token keys during project metadata entry
- **WHEN** the user types in TUI project creation input
- **THEN** the system offers deterministic suggestions for supported token keys (such as `name:`, `color:`, `emoji:`, `description:`, `start:`, `end:`, `inbox:`)
- **AND** allows keyboard acceptance of a suggestion without leaving input mode

#### Scenario: Suggest token keys during project metadata editing
- **WHEN** the user types in TUI project edit input from project view
- **THEN** the system offers deterministic suggestions for supported token keys
- **AND** allows keyboard acceptance of a suggestion without leaving input mode

### Requirement: TUI validates required metadata before create
The TUI MUST block submission when required metadata is missing or invalid and present actionable validation feedback for project creation and project-view project editing.

#### Scenario: Reject submission when required metadata is missing
- **WHEN** the user submits project creation input without required metadata
- **THEN** the system does not call project creation
- **AND** presents a validation message describing what is missing

#### Scenario: Allow fast path for name-only entry
- **WHEN** the user submits plain text without metadata tokens
- **THEN** the system treats the value as project name for backward compatibility
- **AND** creates the project using existing defaults for omitted optional metadata

#### Scenario: Edit project metadata from project view with prefilled values
- **WHEN** the user is in TUI project view and initiates edit for the active project
- **THEN** the system opens project edit input prefilled with tokenized project metadata for the active project
- **AND** submitting valid input updates project metadata through project update APIs
- **AND** invalid input blocks submission and surfaces actionable validation feedback
