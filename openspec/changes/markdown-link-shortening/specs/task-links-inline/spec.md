## MODIFIED Requirements

### Requirement: Links in task title and notes are displayed as labeled placeholders
The system SHALL display URLs in task title, task notes (both expanded and collapsed preview), and project description as `[label]` placeholders instead of raw URLs. The label SHALL be the link's hostname (domain) when no custom label is provided.

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

#### Scenario: Collapsed notes preview shows shortened links
- **WHEN** a task has notes containing a markdown link or bare URL and is not expanded
- **THEN** the collapsed one-line notes preview SHALL display the link as `[label]` (not raw markdown or bare URL)
- **AND** the preview is truncated after link shortening (not before)

#### Scenario: Project description shows shortened links
- **WHEN** the expanded task panel shows a project description containing a markdown link or bare URL
- **THEN** the description SHALL display the link as `[label]`
- **AND** the underlying URL is not modified in storage
