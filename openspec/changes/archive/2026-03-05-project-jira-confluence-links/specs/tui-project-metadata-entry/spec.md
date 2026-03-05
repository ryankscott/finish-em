## MODIFIED Requirements

### Requirement: TUI project creation supports metadata token entry
The TUI SHALL support project creation and project-view editing via tokenized metadata input so users can provide and update project metadata fields in a single keyboard-first flow.

#### Scenario: Parse tokenized project metadata input for create
- **WHEN** a user initiates TUI project creation and enters tokenized metadata input (for example `name:Roadmap color:#3b82f6 emoji:🚀`)
- **THEN** the system parses recognized metadata tokens into a project create payload
- **AND** unrecognized or malformed tokens are surfaced as warnings before submission

#### Scenario: Parse tokenized project metadata input for project-view edit
- **WHEN** a user initiates project edit in TUI project view and enters tokenized metadata input (for example `name:Q2 Roadmap emoji:🧭 start:2026-03-01 end:2026-06-30 description:Planning`)
- **THEN** the system parses recognized metadata tokens into a project update payload
- **AND** updates only supported editable metadata fields (`name`, `emoji`, `description`, `startAt`, `endAt`, `jiraDiscoveryUrl`, `jiraDeliveryUrl`, `confluenceUrl`)
- **AND** unrecognized or malformed tokens are surfaced as warnings before submission

### Requirement: TUI provides autocomplete for project metadata tokens
The TUI MUST provide inline autocomplete suggestions for recognized project metadata tokens to reduce syntax errors and omission in project creation and project-view editing.

#### Scenario: Suggest token keys during project metadata entry
- **WHEN** the user types in TUI project creation input
- **THEN** the system offers deterministic suggestions for supported token keys (such as `name:`, `color:`, `emoji:`, `description:`, `start:`, `end:`, `inbox:`, and when implemented `jiraDiscovery:`, `jiraDelivery:`, `confluence:`)
- **AND** allows keyboard acceptance of a suggestion without leaving input mode

#### Scenario: Suggest token keys during project metadata editing
- **WHEN** the user types in TUI project edit input from project view
- **THEN** the system offers deterministic suggestions for supported token keys
- **AND** allows keyboard acceptance of a suggestion without leaving input mode
