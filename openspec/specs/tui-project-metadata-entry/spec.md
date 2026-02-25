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

### Requirement: TUI suggests emoji shortcode values from shared source
The TUI MUST provide inline autocomplete for the `emoji:` token value using the canonical emoji shortcode source so users can complete `:shortcode:` without memorizing the set.

#### Scenario: Suggest emoji shortcodes after emoji:
- **WHEN** the user has typed `emoji:` (or `emoji::` plus a prefix) in project creation input
- **THEN** the system offers suggestions from the shared shortcode list (e.g. `:cat:`, `:rocket:`)
- **AND** suggestions are consistent with the shortcodes that resolve to an emoji when parsed

### Requirement: TUI resolves emoji shortcodes via shared source
The TUI SHALL resolve `emoji::shortcode:` values using the same canonical shortcode→emoji mapping used for autocomplete, and SHALL treat unknown shortcodes as invalid for mapping while preserving existing warning and literal-fallback behaviour.

#### Scenario: Resolve known shortcode to emoji
- **WHEN** the user submits project creation input with `emoji::shortcode:` and the shortcode is in the canonical mapping
- **THEN** the system sets the project emoji to the mapped emoji character
- **AND** no warning is added for that token

#### Scenario: Unknown shortcode warning and literal fallback
- **WHEN** the user submits project creation input with `emoji::unknown:` and the shortcode is not in the canonical mapping
- **THEN** the system adds a warning (e.g. "Unknown emoji shortcode \":unknown:\"; using literal value")
- **AND** the emoji field is set to the literal value entered (e.g. `:unknown:`) so submission is not blocked
