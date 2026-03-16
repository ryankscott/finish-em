## Purpose

Define keyboard-driven sidebar (project list and nav) visibility behavior in the TUI.

## Requirements

### Requirement: Sidebar visibility can be toggled via keyboard shortcut
The TUI SHALL provide a dedicated keyboard shortcut that toggles the sidebar (project list and nav) between visible and collapsed states from any normal interaction context (when the user is not in text input mode or a modal/picker).

#### Scenario: Collapse sidebar with shortcut
- **WHEN** the sidebar is visible and the user triggers the toggle shortcut
- **THEN** the sidebar SHALL be hidden and the main content pane SHALL use the full terminal width

#### Scenario: Expand sidebar with shortcut
- **WHEN** the sidebar is collapsed and the user triggers the toggle shortcut
- **THEN** the sidebar SHALL be visible at its normal width and the content pane SHALL use the remaining width

#### Scenario: Focus moves off sidebar when collapsing
- **WHEN** focus is on the sidebar and the user triggers the toggle shortcut
- **THEN** the sidebar SHALL collapse and focus SHALL move to the tasks pane (or the only available content pane)

#### Scenario: Shortcut not active in text input
- **WHEN** the user is in text input mode (e.g. input bar, picker) and presses the toggle key
- **THEN** the key SHALL be handled as input (e.g. insert character) and SHALL NOT toggle the sidebar

#### Scenario: Shortcut documented in help
- **WHEN** the user opens the keyboard shortcuts help (e.g. `?`)
- **THEN** the sidebar toggle shortcut SHALL be listed with its keybinding and a brief description

The TUI MUST maintain a single source of truth for sidebar visibility so render output and shortcut behavior remain synchronized after rerenders.
