## 1. Define assistant mutation contracts

- [x] 1.1 Add typed assistant action schemas for supported task operations (`create_task`, `update_task`, `complete_task`, `uncomplete_task`, `set_task_due_date`)
- [x] 1.2 Add typed assistant action schemas for supported project operations (`create_project`, `update_project`)
- [x] 1.3 Add shared validation and normalized outcome types for assistant mutation execution (`success`/`failure`, action metadata, user-facing message)

## 2. Implement mutation executor wiring

- [x] 2.1 Implement assistant action dispatch that routes allowlisted action types to existing task/project backend service operations
- [x] 2.2 Enforce action allowlist and fail-fast validation before invoking any mutation service
- [x] 2.3 Implement due-date payload handling and validation path for assistant-driven task scheduling updates

## 3. Integrate assistant API responses

- [x] 3.1 Update assistant action orchestration route/service to execute mutation actions and collect per-action outcomes
- [x] 3.2 Return deterministic structured action results in assistant API responses for both single and multi-action turns
- [x] 3.3 Add user-visible summary formatting for success, partial success, and failure outcomes in assistant response payloads

## 4. Keep API contract and docs aligned

- [x] 4.1 Update assistant-related OpenAPI schemas/endpoints to reflect mutation action request/response structures
- [x] 4.2 Ensure task/project API integration points used by assistant match existing domain behavior and constraints

## 5. Verify behavior with tests

- [x] 5.1 Add/extend assistant integration tests for successful task and project mutation actions
- [x] 5.2 Add/extend tests for unsupported action types and invalid payload validation failures
- [x] 5.3 Add/extend tests for multi-action partial success with per-action outcome reporting
- [ ] 5.4 Run targeted assistant tests and confirm no regression in existing read-only assistant behavior
