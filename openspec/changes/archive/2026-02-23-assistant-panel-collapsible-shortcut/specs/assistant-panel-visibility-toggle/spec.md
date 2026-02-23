## ADDED Requirements

### Requirement: Assistant panel visibility can be toggled via keyboard shortcut
The TUI SHALL provide a dedicated keyboard shortcut that toggles the assistant panel between visible and hidden states from any normal interaction context.

#### Scenario: Collapse assistant panel with shortcut
- **WHEN** the assistant panel is visible and the user triggers the toggle shortcut
- **THEN** the assistant panel SHALL become hidden in the current TUI layout

#### Scenario: Expand assistant panel with shortcut
- **WHEN** the assistant panel is hidden and the user triggers the toggle shortcut
- **THEN** the assistant panel SHALL become visible in the current TUI layout

### Requirement: Assistant visibility state remains consistent during the session
The TUI MUST maintain a single source of truth for assistant panel visibility so render output and shortcut behavior remain synchronized after rerenders.

#### Scenario: Rerender preserves visibility state
- **WHEN** the interface rerenders after a visibility toggle in the same session
- **THEN** the assistant panel visibility SHALL match the last toggled state
