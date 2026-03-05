## 1. Quick Add default project

- [x] 1.1 In `useSubmitInput` Quick Add branch (parsed-token path), set projectId fallback to `parsed.input.projectId ?? activeProjectId ?? inboxId ?? 1` so selected project is used when user does not specify a project in input
- [x] 1.2 Add or extend tests for Quick Add project default: selected project used when no project in input; explicit project in input wins; no project selected uses Inbox/default
