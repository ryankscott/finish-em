# Project Deletion

## Summary

Define project deletion via CLI and TUI: semantics (reassign tasks to inbox, forbid deleting inbox), success/failure outcomes, and exposure on CLI command surface and TUI API direct implementation.

## Current Rules

- API allows deleting a non-inbox project: The system SHALL allow callers to delete a project by id via supported local operation surfaces (CLI command surface and TUI API direct implementation). Deletion SHALL reassign the project's tasks to the inbox and then remove the project. Only non-inbox projects MAY be deleted.
- TUI API exposes project delete: The system SHALL expose `deleteProject(projectId)` on the TUI API direct implementation, and CLI project deletion commands SHALL map to the same domain semantics.

## Related History

- `2026-02-25-support-deleting-projects` -> `archive/2026-02-25-support-deleting-projects.md`
- `2026-03-05-replace-mcp-with-regular-cli` -> `archive/2026-03-05-replace-mcp-with-regular-cli.md`
