## REMOVED Requirements

### Requirement: Assistant can create and update tasks through validated actions
**Reason**: In-app assistant task mutation execution is being removed.
**Migration**: Continue task creation and updates through normal TUI/API task flows; use external tools only outside the app runtime.

### Requirement: Assistant task creation supports canonical metadata fields
**Reason**: Assistant task payload support is obsolete after assistant service removal.
**Migration**: Preserve metadata handling in canonical task APIs and TUI entry/edit flows.

### Requirement: Assistant can complete and uncomplete tasks through validated actions
**Reason**: Assistant completion/uncompletion actions are removed with assistant backend decommissioning.
**Migration**: Use standard task completion controls and APIs.

### Requirement: Assistant can set and reschedule task due dates through validated actions
**Reason**: Assistant due-date mutation actions are removed with assistant backend decommissioning.
**Migration**: Use existing due-date and scheduling controls in the TUI and task APIs.
