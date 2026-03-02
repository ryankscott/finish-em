## REMOVED Requirements

### Requirement: Assistant panel visibility can be toggled via keyboard shortcut
**Reason**: The in-TUI assistant panel and its interaction model are being removed.
**Migration**: Remove assistant-panel toggle key handling and rely on non-assistant TUI navigation; use external tools for assistant workflows.

### Requirement: Assistant visibility state remains consistent during the session
**Reason**: Assistant visibility state no longer exists after removing the assistant panel surface.
**Migration**: Remove assistant visibility state from TUI state containers and layout logic.
