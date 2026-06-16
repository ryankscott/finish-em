# Task Links Inline

## Summary

Define inline link display, editing, and opening behavior for URLs embedded in task titles and notes.

## Current Rules

- Links in task title and notes are displayed as labeled placeholders: The system SHALL display URLs in task title and task notes as `[[label]]` placeholders instead of raw URLs. The label SHALL be the link's hostname (domain) when no custom label is provided.
- User can edit the link label: The system SHALL allow the user to edit the label (the text inside `[[...]]`) for links in both task title and task notes. The URL SHALL remain unchanged when only the label is edited.
- Links are openable from the TUI: The system SHALL allow the user to open a displayed link (e.g. `[[label]]`) from the TUI so that the URL is opened in the system default browser or appropriate handler.

## Related History

- `markdown-link-shortening` -> `markdown-link-shortening.md`
- `2026-03-05-task-links-inline` -> `archive/2026-03-05-task-links-inline.md`
