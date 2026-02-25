## ADDED Requirements

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
