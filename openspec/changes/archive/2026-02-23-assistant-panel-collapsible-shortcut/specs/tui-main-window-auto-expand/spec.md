## ADDED Requirements

### Requirement: Main window expands when assistant panel is collapsed
When the assistant panel is hidden, the TUI main window SHALL automatically expand to use the full available width previously shared with the assistant pane.

#### Scenario: Full-width main pane after collapse
- **WHEN** the user hides the assistant panel via the toggle shortcut
- **THEN** the main window SHALL render in an expanded full-width layout

### Requirement: Main window returns to split layout when assistant panel is expanded
When the assistant panel is shown again, the TUI MUST restore a layout that includes both main window and assistant panel.

#### Scenario: Split layout restored after expand
- **WHEN** the user shows the assistant panel via the toggle shortcut
- **THEN** the TUI SHALL render both the main window and assistant panel in the standard split layout
