## Context

Project deletion is already implemented in `src/server/repos/projects.ts`: `deleteProject(projectId)` moves the project's tasks to inbox, then deletes the project; it returns `false` for non-existent or inbox projects. MCP exposes `delete_project`; OpenAPI and TUI API (direct + MCP-backed) expose create/update but not delete; the assistant has `create_project` and `update_project` but no `delete_project`. This change wires deletion through those surfaces without changing repo semantics.

## Goals / Non-Goals

**Goals:**
- Expose project delete on OpenAPI (`DELETE /api/projects/:id`), TUI API (`deleteProject(projectId)`), and assistant (`delete_project` action) so behavior is consistent with create/update.
- Reuse existing repo: no new persistence logic; callers get clear success/failure (deleted, not found, or inbox protected).

**Non-Goals:**
- No new TUI screens or controls (e.g. project context menu or settings delete button); API-only for this change.
- No soft-delete or undo; deletion remains permanent with tasks reassigned to inbox.

## Decisions

- **Reuse repo `deleteProject`**: No new service layer. OpenAPI, assistant, and direct API call the repo; MCP already does. Alternative: introduce a project service that could add logging/events—rejected for simplicity; can add later if needed.
- **HTTP semantics**: `DELETE /api/projects/:id` returns 204 when deleted, 404 when project missing, 400 or 403 when target is inbox (or 404 to avoid leaking inbox id). Implementation can match existing PATCH semantics (e.g. 404 for not-found and inbox).
- **TUI API shape**: `deleteProject(projectId): Promise<void>`; throw on failure (not found or inbox) so callers can show an error. Alternative: return boolean—rejected to align with other mutating API methods that throw.
- **Assistant action**: Add `delete_project` with `projectId`; success result mirrors create/update (e.g. `{ ok: true }` or minimal payload); failure result includes reason (not_found, cannot_delete_inbox). Same validation/execution pattern as existing project actions.

## Risks / Trade-offs

- **Inbox protection**: Repo already enforces; all call paths must use repo (no bypass). Mitigation: single entry point `deleteProject`; tests for inbox and missing id.
- **Task reassignment**: Callers may not expect tasks to move to inbox. Mitigation: documented in spec and API; no change to current repo behavior.
