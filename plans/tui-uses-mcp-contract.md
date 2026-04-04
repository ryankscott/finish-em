# TUI Uses MCP Contract

## Summary

Define that TUI domain operations are executed through shared in-process domain operations with user-visible parity.

## Current Rules

- TUI executes domain operations through MCP contracts: The TUI SHALL perform domain mutations and queries through shared in-process domain operations rather than MCP tool/resource contracts or web route interfaces.
- TUI handles MCP responses with user-facing parity: The TUI MUST present success and failure feedback based on operation outcomes while preserving existing interaction expectations.
- TUI startup validates MCP availability for operation mode: The TUI SHALL validate required local runtime dependencies for operation mode before accepting user commands.

## Related History

- `2026-02-24-consolidate-tui-mcp-server` -> `archive/2026-02-24-consolidate-tui-mcp-server.md`
- `2026-03-05-replace-mcp-with-regular-cli` -> `archive/2026-03-05-replace-mcp-with-regular-cli.md`
