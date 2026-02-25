## 1. OpenAPI

- [x] 1.1 Add DELETE handler for /api/projects/:projectId in openapi.ts that calls project repo deleteProject; return 204 on success, 404 when project missing or is inbox
- [x] 1.2 Add or extend tests for DELETE /api/projects/:id (success, not found, inbox)

## 2. TUI API

- [x] 2.1 Add deleteProject(projectId: number): Promise<void> to TUI API type and HTTP implementation in api.ts (call DELETE endpoint; throw on non-2xx)
- [x] 2.2 Implement deleteProject in direct-api.ts using projectRepo.deleteProject; throw on failure (not found or inbox)
- [x] 2.3 Expose deleteProject on mcp-api.ts by calling delete_project tool and mapping result to resolve/reject
- [x] 2.4 Add tests for deleteProject in api.test.ts and direct-api integration tests as needed

## 3. Assistant

- [x] 3.1 Add delete_project action schema (z.object with projectId) and register in assistant action schemas
- [x] 3.2 Add delete_project branch in executeAssistantAction that calls deleteProject and returns structured success/failure (not_found, cannot_delete_inbox)
- [x] 3.3 Add assistant tests for delete_project (success, non-existent project, inbox)
