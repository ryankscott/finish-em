## 1. Database and server

- [x] 1.1 Add migration: three nullable columns `jira_discovery_url`, `jira_delivery_url`, `confluence_url` on `projects`
- [x] 1.2 Extend Drizzle schema and raw schema (if used) for the three project URL columns
- [x] 1.3 Add `jiraDiscoveryUrl`, `jiraDeliveryUrl`, `confluenceUrl` to `Project` type in `src/server/types.ts`
- [x] 1.4 Update `mapProjectRow` in mappers to map the three new columns
- [x] 1.5 Extend `createProject` and `updateProject` in project repo to accept and persist the three fields
- [x] 1.6 Add schema guard in db client for the new columns (if used for backward compatibility)

## 2. TUI project edit flow

- [x] 2.1 Add three entries to `PROJECT_EDIT_FIELDS` in ProjectEditPicker (Jira Discovery, Jira Delivery, Confluence) with hint e.g. "URL or clear"
- [x] 2.2 Add input modes `editProjectJiraDiscovery`, `editProjectJiraDelivery`, `editProjectConfluence` to InputMode type and useInputBar
- [x] 2.3 In useMainKeys (projectEditPicker): set initial value and modeMap for the three link fields when user selects them
- [x] 2.4 In useSubmitInput: handle the three modes and call api.updateProject with the corresponding patch (value or null)
- [x] 2.5 Add INPUT_MODE_LABELS in InputBar for the three new modes
- [x] 2.6 Add unit tests for new project-edit link field submit behavior (e.g. in useSubmitInput.test)

## 3. Project view display

- [x] 3.1 In TaskPanel project metadata block, when any of the three URLs is set, show lines for them (e.g. "Jira Discovery: <url>"); omit unset links

## 4. API surface

- [x] 4.1 Ensure API client and server project endpoints expose the three fields on get/list and accept them on create/update (if not already inferred from repo)

## 5. Optional: tokenized metadata

- [x] 5.1 Extend project create/edit parser to recognize `jiraDiscovery:`, `jiraDelivery:`, `confluence:` tokens and include in payload
- [x] 5.2 Add the three token keys to autocomplete suggestions for project metadata entry (create and edit)
