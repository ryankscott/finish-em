# Support Deleting Projects

_Archived change: `2026-02-25-support-deleting-projects`_

## Summary

Users need to remove projects they no longer use. The backend already supports deletion (repo moves tasks to inbox and deletes the project; inbox cannot be deleted), but deletion is not exposed in the TUI API, OpenAPI, or assistant actions. Exposing it everywhere create/update are supported keeps the product consistent and completes the project lifecycle.

## Scope

- **API**: Expose project deletion on the same surfaces that support create/update—TUI API (direct and MCP), OpenAPI `DELETE /api/projects/:id`, and assistant validated action `delete_project`.
- **Behavior**: Reuse existing repo behavior: non-inbox projects can be deleted; their tasks are reassigned to inbox; inbox cannot be deleted. Callers receive clear success/failure (e.g. not found, or inbox protected).
- **TUI**: Add `deleteProject(projectId)` to the TUI API contract and implementations; no requirement yet for a dedicated delete UI (e.g. context menu or project settings)—can be follow-up.
- Expose project delete on OpenAPI (`DELETE /api/projects/:id`), TUI API (`deleteProject(projectId)`), and assistant (`delete_project` action) so behavior is consistent with create/update.
- Reuse existing repo: no new persistence logic; callers get clear success/failure (deleted, not found, or inbox protected).
- No new TUI screens or controls (e.g. project context menu or settings delete button); API-only for this change.
- No soft-delete or undo; deletion remains permanent with tasks reassigned to inbox.
- Impact: **Code**: `src/server/repos/projects.ts` (already has `deleteProject`), `src/server/services/openapi.ts` (add or wire DELETE handler), `src/server/services/assistant.ts` (add delete_project action schema and execution), `src/tui/api.ts`, `src/tui/direct-api.ts`, `src/tui/mcp-api.ts` (add `deleteProject`). MCP tool `delete_project` already exists.
- Impact: **APIs**: OpenAPI `DELETE /api/projects/{projectId}`; TUI API `deleteProject(projectId): Promise<void>` (or boolean); assistant action `delete_project` with `projectId`.
- Impact: **Dependencies**: None. DB schema already uses FK with ON DELETE CASCADE where applicable; repo moves tasks to inbox before delete.
- Related capabilities: `assistant-project-actions`, `project-deletion`

## Notes

- - **Reuse repo `deleteProject`**: No new service layer. OpenAPI, assistant, and direct API call the repo; MCP already does. Alternative: introduce a project service that could add logging/events—rejected for simplicity; can add later if needed. - **HTTP semantics**: `DELETE /api/projects/:id` returns 204 when deleted, 404 when project missing, 400 or 403 when target is inbox (or 404 to avoid leaking inbox id). Implementation can match existing PATCH semantics (e.g. 404 for not-found and inbox). - **TUI API shape**: `deleteProject(projectId): Promise<void>`; throw on failure (not found or inbox) so callers can show an error. Alternative: return boolean—rejected to align with other mutating API methods that throw. - **Assistant action**: Add `delete_project` with `projectId`; success result mirrors create/update (e.g. `{ ok: true }` or minimal payload); failure result includes reason (not_found, cannot_delete_inbox). Same validation/execution pattern as existing project actions.
- **Inbox protection**: Repo already enforces; all call paths must use repo (no bypass). Mitigation: single entry point `deleteProject`; tests for inbox and missing id.
- **Task reassignment**: Callers may not expect tasks to move to inbox. Mitigation: documented in spec and API; no change to current repo behavior.

## Implementation Phases

1. OpenAPI
   - [done] Add DELETE handler for /api/projects/:projectId in openapi.ts that calls project repo deleteProject; return 204 on success, 404 when project missing or is inbox
   - [done] Add or extend tests for DELETE /api/projects/:id (success, not found, inbox)
2. TUI API
   - [done] Add deleteProject(projectId: number): Promise<void> to TUI API type and HTTP implementation in api.ts (call DELETE endpoint; throw on non-2xx)
   - [done] Implement deleteProject in direct-api.ts using projectRepo.deleteProject; throw on failure (not found or inbox)
   - [done] Expose deleteProject on mcp-api.ts by calling delete_project tool and mapping result to resolve/reject
   - [done] Add tests for deleteProject in api.test.ts and direct-api integration tests as needed
3. Assistant
   - [done] Add delete_project action schema (z.object with projectId) and register in assistant action schemas
   - [done] Add delete_project branch in executeAssistantAction that calls deleteProject and returns structured success/failure (not_found, cannot_delete_inbox)
   - [done] Add assistant tests for delete_project (success, non-existent project, inbox)
