## ADDED Requirements

### Requirement: Quick Add defaults to selected project when no project in input

When the user adds a task via Quick Add (input bar), the system SHALL use the currently selected project in the sidebar as the default project for the new task when the user does not specify a project in the input (e.g. no `project:` or `proj:` token). Explicit project in the input SHALL take precedence over the selected project. When no project is selected, the system SHALL keep existing default behavior (e.g. Inbox).

#### Scenario: Selected project used when input has no project

- **WHEN** a project is selected in the sidebar and the user submits Quick Add input that does not include a project token (e.g. "Buy milk" or "title: Review doc")
- **THEN** the new task is created in the selected project

#### Scenario: Explicit project in input wins over selected project

- **WHEN** a project is selected in the sidebar and the user submits Quick Add input that includes a project token (e.g. "project: Inbox Buy milk" or "proj: Other title: Task")
- **THEN** the new task is created in the project specified in the input, not the selected project

#### Scenario: No project selected falls back to existing default

- **WHEN** no project is selected (or view is not project) or the selected context is Inbox, and the user submits Quick Add input without a project token
- **THEN** the new task is created using the existing default (e.g. Inbox or fallback id) as today
