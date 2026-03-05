## Purpose

Projects may store optional external links (Jira Product Discovery, Jira Delivery, Confluence) and users may edit them from the project edit screen and see them in project view when set.

## Requirements

### Requirement: Projects store optional Jira and Confluence URLs
The system SHALL store three optional URL fields per project: Jira Product Discovery, Jira Delivery, and Confluence. Each field SHALL be nullable and persist as provided by the user (no format validation required).

#### Scenario: Persist and load link fields
- **WHEN** a project has one or more of the three link fields set
- **THEN** the system persists them and returns them when the project is loaded
- **AND** unset fields are null or empty and do not affect existing behavior

#### Scenario: Create project without link fields
- **WHEN** a project is created without supplying any of the three link fields
- **THEN** all three link fields are stored as null or empty
- **AND** project creation succeeds as today

### Requirement: TUI project edit screen supports editing link fields
The TUI SHALL expose the three link fields in the existing project edit picker. The user SHALL be able to select each field, enter or paste a URL (or clear the value), and submit to update the project.

#### Scenario: Edit Jira Discovery URL from project edit picker
- **WHEN** the user is in project view and opens the project edit picker and selects the Jira Product Discovery field
- **THEN** the system enters input mode with the current value (if any) prefilled
- **AND** on submit the project is updated with the entered value (or cleared if empty)

#### Scenario: Edit Jira Delivery URL from project edit picker
- **WHEN** the user is in project view and opens the project edit picker and selects the Jira Delivery field
- **THEN** the system enters input mode with the current value (if any) prefilled
- **AND** on submit the project is updated with the entered value (or cleared if empty)

#### Scenario: Edit Confluence URL from project edit picker
- **WHEN** the user is in project view and opens the project edit picker and selects the Confluence field
- **THEN** the system enters input mode with the current value (if any) prefilled
- **AND** on submit the project is updated with the entered value (or cleared if empty)

### Requirement: Project view may display set links
When the user is viewing a project in project view, the TUI MAY display the three link fields in the project metadata area when they are set, so the user can see or copy the URLs.

#### Scenario: Show set links in project metadata block
- **WHEN** the user is in project view and the active project has one or more of the three link fields set
- **THEN** the TUI MAY show those links in the same area as description, start date, and end date
- **AND** only set links are shown; unset fields are omitted
