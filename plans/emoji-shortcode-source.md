# Emoji Shortcode Source

## Summary

Define the single source of shortcode→emoji mappings used for project emoji autocomplete and parsing in the TUI.

## Current Rules

- Canonical shortcode-to-emoji mapping: The system SHALL provide one canonical mapping from emoji shortcode (e.g. `cat`, `rocket`) to the corresponding emoji character(s), used by both TUI project metadata autocomplete and project input parsing.
- Enumerate shortcodes for autocomplete: The system SHALL expose the set of supported shortcodes (or their display form, e.g. `:shortcode:`) so that TUI autocomplete can suggest completions for the `emoji:` token.

## Related History

- `2026-02-25-fix-emoji-autocomplete-for-projects` -> `archive/2026-02-25-fix-emoji-autocomplete-for-projects.md`
