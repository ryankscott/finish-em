## ADDED Requirements

### Requirement: Links in task title and notes are displayed as labeled placeholders
The system SHALL display URLs in task title and task notes as `[[label]]` placeholders instead of raw URLs. The label SHALL be the link's hostname (domain) when no custom label is provided.

#### Scenario: Bare URL is displayed using domain as label
- **WHEN** a task title or notes contains a bare URL (e.g. `https://docs.example.com/spec`)
- **THEN** the system displays it as `[[docs.example.com]]` (or the hostname of the URL)
- **AND** the underlying URL is preserved for opening

#### Scenario: Custom label is displayed when using [[label](url) syntax
- **WHEN** a task title or notes contains `[[Spec doc]](https://example.com/spec)`
- **THEN** the system displays it as `[[Spec doc]]`
- **AND** the underlying URL is preserved for opening

#### Scenario: Plain text is unchanged
- **WHEN** task title or notes contain no URL or link syntax
- **THEN** the system displays the text unchanged

### Requirement: User can edit the link label
The system SHALL allow the user to edit the label (the text inside `[[...]]`) for links in both task title and task notes. The URL SHALL remain unchanged when only the label is edited.

#### Scenario: Editing task title updates link label and preserves URL
- **WHEN** the user edits a task whose title contains a link (e.g. `[[link]](https://example.com)`) and changes the label to "Spec"
- **THEN** the stored title SHALL contain `[[Spec]](https://example.com)` (or equivalent)
- **AND** the URL SHALL be unchanged

#### Scenario: Editing notes updates link label and preserves URL
- **WHEN** the user edits a task whose notes contain a link and changes the label
- **THEN** the stored notes SHALL reflect the new label with the same URL
- **AND** the URL SHALL be unchanged

### Requirement: Links are openable from the TUI
The system SHALL allow the user to open a displayed link (e.g. `[[label]]`) from the TUI so that the URL is opened in the system default browser or appropriate handler.

#### Scenario: Open link from task display
- **WHEN** the user invokes the action to open a link on a displayed `[[label]]`
- **THEN** the system opens the associated URL (e.g. in the system browser)
- **AND** the task data is not modified
