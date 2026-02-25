## Purpose

Define the single source of shortcode→emoji mappings used for project emoji autocomplete and parsing in the TUI.

## Requirements

### Requirement: Canonical shortcode-to-emoji mapping
The system SHALL provide one canonical mapping from emoji shortcode (e.g. `cat`, `rocket`) to the corresponding emoji character(s), used by both TUI project metadata autocomplete and project input parsing.

#### Scenario: Lookup by shortcode
- **WHEN** a consumer requests the emoji for a known shortcode (e.g. `rocket`)
- **THEN** the system returns the corresponding emoji character (e.g. 🚀)
- **AND** shortcode matching is case-insensitive or consistently normalized

#### Scenario: Unknown shortcode
- **WHEN** a consumer requests the emoji for a shortcode not in the mapping
- **THEN** the system indicates no mapping exists (e.g. returns undefined or false)
- **AND** consumers may fall back to literal value and surface a warning as specified elsewhere

### Requirement: Enumerate shortcodes for autocomplete
The system SHALL expose the set of supported shortcodes (or their display form, e.g. `:shortcode:`) so that TUI autocomplete can suggest completions for the `emoji:` token.

#### Scenario: List available shortcodes
- **WHEN** a consumer requests the list of shortcodes (e.g. for prefix matching)
- **THEN** the system returns the same shortcodes that are valid for lookup
- **AND** the list is consistent with the canonical mapping (no orphan entries, no missing entries)
