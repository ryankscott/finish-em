# TUI Project Metadata Entry

## Summary

Define tokenized metadata entry and autocomplete behavior for TUI project creation.

## Current Rules

- TUI project creation supports metadata token entry: The TUI SHALL support project creation and project-view editing via tokenized metadata input so users can provide and update project metadata fields in a single keyboard-first flow.
- TUI provides autocomplete for project metadata tokens: The TUI MUST provide inline autocomplete suggestions for recognized project metadata tokens to reduce syntax errors and omission in project creation and project-view editing.
- TUI validates required metadata before create: The TUI MUST block submission when required metadata is missing or invalid and present actionable validation feedback for project creation and project-view project editing.
- TUI suggests emoji shortcode values from shared source: The TUI MUST provide inline autocomplete for the `emoji:` token value using the canonical emoji shortcode source so users can complete `:shortcode:` without memorizing the set.
- TUI resolves emoji shortcodes via shared source: The TUI SHALL resolve `emoji::shortcode:` values using the same canonical shortcode→emoji mapping used for autocomplete, and SHALL treat unknown shortcodes as invalid for mapping while preserving existing warning and literal-fallback behaviour.

## Related History

- `2026-02-24-assistant-can-manage-tasks-projects` -> `archive/2026-02-24-assistant-can-manage-tasks-projects.md`
- `2026-02-25-fix-emoji-autocomplete-for-projects` -> `archive/2026-02-25-fix-emoji-autocomplete-for-projects.md`
- `2026-03-05-edit-project-metadata-in-project-view` -> `archive/2026-03-05-edit-project-metadata-in-project-view.md`
- `2026-03-05-project-jira-confluence-links` -> `archive/2026-03-05-project-jira-confluence-links.md`
