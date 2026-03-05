## ADDED Requirements

### Requirement: Add Task command is available in Raycast
The extension SHALL expose a single Raycast command named "Add Task" that opens a form for creating a new finish-em task.

#### Scenario: Command appears in Raycast
- **WHEN** the user opens Raycast and searches for "Add Task"
- **THEN** the finish-em "Add Task" command SHALL appear in results

### Requirement: Form has title, project, and priority fields
The Add Task form SHALL contain three fields: a required text field for the task title, an optional dropdown for selecting a project, and an optional dropdown for selecting a priority.

#### Scenario: Form renders with title focused
- **WHEN** the user opens the Add Task command
- **THEN** a form SHALL be displayed with the title field auto-focused

#### Scenario: Project dropdown is populated from CLI
- **WHEN** the form loads
- **THEN** the project dropdown SHALL contain one option per project returned by `finish-em project list --json`, plus a "No Project" option

#### Scenario: Priority dropdown options
- **WHEN** the user opens the priority dropdown
- **THEN** the options SHALL be: None, Urgent (1), High (2), Medium (3), Low (4)

### Requirement: Task is created via CLI on submission
The extension SHALL create the task by spawning the finish-em binary via a login shell, passing the title, project ID (if selected), and priority (if selected) as CLI flags with `--json` output.

#### Scenario: Successful task creation
- **WHEN** the user fills in a title and submits the form
- **THEN** the extension SHALL execute `finish-em task add "<title>" --project-id <id> --json` (with `--priority <n>` if set)
- **THEN** a success toast SHALL be shown with the created task title
- **THEN** the Raycast window SHALL close

#### Scenario: Task created without optional fields
- **WHEN** the user submits with only a title (no project, no priority)
- **THEN** the extension SHALL execute `finish-em task add "<title>" --json` (omitting `--project-id` and `--priority`)
- **THEN** a success toast SHALL be shown

### Requirement: CLI errors are surfaced to the user
The extension SHALL display an error toast if the CLI command fails or returns a non-zero exit code.

#### Scenario: CLI binary not found or exits with error
- **WHEN** the finish-em binary cannot be found or exits with a non-zero code
- **THEN** an error toast SHALL be shown with the stderr output
- **THEN** the form SHALL remain open so the user can retry

### Requirement: CLI is invoked via login shell
The extension SHALL invoke the finish-em binary via `/bin/zsh -lc` to ensure the user's PATH (including `~/.bun/bin`) is available.

#### Scenario: Binary found via login shell PATH
- **WHEN** finish-em is installed at a path only in the user's shell PATH (e.g., `~/.bun/bin`)
- **THEN** the extension SHALL successfully locate and execute the binary
