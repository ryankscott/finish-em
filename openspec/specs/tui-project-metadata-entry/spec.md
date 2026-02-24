## Purpose

Define tokenized metadata entry and autocomplete behavior for TUI project creation.

## Requirements

### Requirement: TUI project creation supports metadata token entry
The TUI SHALL support project creation via tokenized metadata input so users can provide project metadata fields in a single keyboard-first flow.

#### Scenario: Parse tokenized project metadata input
- **WHEN** a user initiates TUI project creation and enters tokenized metadata input (for example `name:Roadmap color:#3b82f6 emoji:🚀`)
- **THEN** the system parses recognized metadata tokens into a project create payload
- **AND** unrecognized or malformed tokens are surfaced as warnings before submission

### Requirement: TUI provides autocomplete for project metadata tokens
The TUI MUST provide inline autocomplete suggestions for recognized project metadata tokens to reduce syntax errors and omission.

#### Scenario: Suggest token keys during project metadata entry
- **WHEN** the user types in TUI project creation input
- **THEN** the system offers deterministic suggestions for supported token keys (such as `name:`, `color:`, `emoji:`, `description:`, `start:`, `end:`, `inbox:`)
- **AND** allows keyboard acceptance of a suggestion without leaving input mode

### Requirement: TUI validates required metadata before create
The TUI MUST block submission when required metadata is missing or invalid and present actionable validation feedback.

#### Scenario: Reject submission when required metadata is missing
- **WHEN** the user submits project creation input without required metadata
- **THEN** the system does not call project creation
- **AND** presents a validation message describing what is missing

#### Scenario: Allow fast path for name-only entry
- **WHEN** the user submits plain text without metadata tokens
- **THEN** the system treats the value as project name for backward compatibility
- **AND** creates the project using existing defaults for omitted optional metadata
