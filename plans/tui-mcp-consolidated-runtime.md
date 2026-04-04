# TUI MCP Consolidated Runtime

## Summary

Define the runtime behavior where the TUI and CLI command execution run on a shared domain backend without requiring an MCP server.

## Current Rules

- TUI and MCP server start in one process runtime: The system SHALL initialize a single runtime entrypoint that supports TUI startup without requiring MCP server startup.
- Consolidated runtime shares one domain backend: The system MUST ensure TUI and CLI command operations use the same domain services and persistence layer instance for consistent behavior.
- Consolidated runtime lifecycle is coordinated: The system SHALL coordinate startup failure and shutdown behavior across TUI and CLI runtime components.

## Related History

- `2026-02-24-consolidate-tui-mcp-server` -> `archive/2026-02-24-consolidate-tui-mcp-server.md`
- `2026-03-05-replace-mcp-with-regular-cli` -> `archive/2026-03-05-replace-mcp-with-regular-cli.md`
