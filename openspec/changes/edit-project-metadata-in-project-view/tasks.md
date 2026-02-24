## 1. Extend TUI project update API contract

- [x] 1.1 Add `updateProject(projectId, patch)` to `ApiClient` in `src/tui/api.ts`
- [x] 1.2 Implement HTTP project update call (`PATCH /api/projects/:projectId`) in `src/tui/api.ts`
- [x] 1.3 Implement `updateProject` passthrough in `src/tui/direct-api.ts`
- [x] 1.4 Implement `updateProject` MCP tool call wiring in `src/tui/mcp-api.ts`

## 2. Add project-view edit interaction in App

- [x] 2.1 Add `editProject` input mode and submit branch in `src/tui/App.tsx`
- [x] 2.2 Route `e` key to project edit when `view === "project"` and `activeProjectId` is set
- [x] 2.3 Keep existing task edit behavior unchanged for non-project views
- [x] 2.4 Prefill project edit input with tokenized current metadata (`name`, `emoji`, `description`, `start`, `end`)
- [x] 2.5 Reuse project metadata parser for edit submission and map parsed values into project patch payload
- [x] 2.6 Surface clear status/error messages for successful update, no-op edits, and validation failures

## 3. Update discoverability and UX copy

- [x] 3.1 Update `src/tui/HelpModal.tsx` shortcut text to describe project-view `e` behavior
- [x] 3.2 Update bottom input label text in `src/tui/App.tsx` to include project edit context

## 4. Verify behavior with tests

- [x] 4.1 Add/extend TUI tests for project-view edit key handling and input mode transitions
- [x] 4.2 Add/extend parser/edit-flow tests for tokenized project update input and validation feedback
- [x] 4.3 Add/extend API adapter tests to verify `updateProject` availability across HTTP/direct/MCP paths
- [x] 4.4 Run targeted TUI tests covering project create/edit flows and ensure no regression in task edit behavior
