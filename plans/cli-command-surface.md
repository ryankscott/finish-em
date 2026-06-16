# CLI Command Surface

## Summary

Define the regular command-oriented CLI interface that exposes finish-em domain operations via stable command groups for scripting, automation, and Raycast integration.

## Current Rules

- CLI provides regular command-oriented interface: The system SHALL expose a regular command-oriented CLI with stable top-level command groups for task, project, goal, reminder, assistant, settings, and tui operations, rather than protocol-specific tool invocation commands.
- CLI output defaults to human-readable format with optional JSON mode: The CLI SHALL emit human-readable output by default for interactive use and SHALL support an optional `--json` flag to emit JSON output for scripting and automation.
- CLI supports discoverability help at root and command scopes: The CLI SHALL provide discoverability via `help`, `-h`, and `--help` at the root level and for each command group and subcommand.

## Related History

- `2026-03-05-replace-mcp-with-regular-cli` -> `archive/2026-03-05-replace-mcp-with-regular-cli.md`
