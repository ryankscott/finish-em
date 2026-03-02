## REMOVED Requirements

### Requirement: Assistant mutation execution is restricted to an explicit action allowlist
**Reason**: Assistant mutation execution is being removed entirely, so the allowlist contract is no longer needed.
**Migration**: Remove assistant action parsing/execution entry points and keep validation requirements on standard non-assistant APIs.

### Requirement: Assistant mutation payloads are validated before execution
**Reason**: Assistant payload execution path is being removed.
**Migration**: Preserve payload validation in canonical task/project command and API pathways.

### Requirement: Assistant returns deterministic per-action outcomes for user-visible confirmation
**Reason**: Assistant action outcomes and assistant UI feedback surfaces are removed with the assistant subsystem.
**Migration**: Remove assistant outcome contracts and rely on existing command/API result contracts used outside assistant flows.
