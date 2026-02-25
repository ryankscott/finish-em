## Why

Users need to remove projects they no longer use. The backend already supports deletion (repo moves tasks to inbox and deletes the project; inbox cannot be deleted), but deletion is not exposed in the TUI API, OpenAPI, or assistant actions. Exposing it everywhere create/update are supported keeps the product consistent and completes the project lifecycle.

## What Changes

- **API**: Expose project deletion on the same surfaces that support create/update—TUI API (direct and MCP), OpenAPI `DELETE /api/projects/:id`, and assistant validated action `delete_project`.
- **Behavior**: Reuse existing repo behavior: non-inbox projects can be deleted; their tasks are reassigned to inbox; inbox cannot be deleted. Callers receive clear success/failure (e.g. not found, or inbox protected).
- **TUI**: Add `deleteProject(projectId)` to the TUI API contract and implementations; no requirement yet for a dedicated delete UI (e.g. context menu or project settings)—can be follow-up.

## Capabilities

### New Capabilities
- `project-deletion`: Specification for deleting a project via API and assistant. Covers allowed semantics (reassign tasks to inbox, forbid deleting inbox), success/failure outcomes, and where delete is exposed (HTTP API, TUI API, assistant action).

### Modified Capabilities
- `assistant-project-actions`: Add requirement and scenarios for a validated `delete_project` action (projectId; success or failure with reason).

## Impact

- **Code**: `src/server/repos/projects.ts` (already has `deleteProject`), `src/server/services/openapi.ts` (add or wire DELETE handler), `src/server/services/assistant.ts` (add delete_project action schema and execution), `src/tui/api.ts`, `src/tui/direct-api.ts`, `src/tui/mcp-api.ts` (add `deleteProject`). MCP tool `delete_project` already exists.
- **APIs**: OpenAPI `DELETE /api/projects/{projectId}`; TUI API `deleteProject(projectId): Promise<void>` (or boolean); assistant action `delete_project` with `projectId`.
- **Dependencies**: None. DB schema already uses FK with ON DELETE CASCADE where applicable; repo moves tasks to inbox before delete.
