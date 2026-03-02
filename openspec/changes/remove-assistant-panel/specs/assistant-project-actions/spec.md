## REMOVED Requirements

### Requirement: Assistant can create projects through validated actions
**Reason**: Assistant-driven project mutations are being removed from in-app/backend assistant services.
**Migration**: Use existing non-assistant project creation flows in the TUI or perform assistant-assisted changes through external tools.

### Requirement: Assistant project creation supports canonical metadata fields
**Reason**: Assistant action payload support is no longer applicable once assistant action execution is removed.
**Migration**: Keep canonical metadata support through standard project APIs and TUI forms only.

### Requirement: Assistant can update supported project metadata through validated actions
**Reason**: Assistant update actions are removed with backend assistant service decommissioning.
**Migration**: Route metadata updates through existing non-assistant update flows.

### Requirement: Assistant can delete projects through validated actions
**Reason**: Assistant delete actions are removed with backend assistant service decommissioning.
**Migration**: Use standard project deletion flows and preserve existing deletion safety rules outside assistant action pathways.
