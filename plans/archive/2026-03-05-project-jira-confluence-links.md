# Project Jira Confluence Links

_Archived change: `2026-03-05-project-jira-confluence-links`_

## Summary

Projects I work on are often tied to Confluence spaces and Jira boards (Product Discovery and/or Delivery). I want to store the root page or doc for each and open it quickly from the TUI instead of hunting for the link.

## Scope

- Add three optional URL fields to projects: **Jira Product Discovery**, **Jira Delivery**, and **Confluence**.
- Expose them in the existing project edit flow (project edit picker → choose field → enter or paste URL).
- Optionally show the links in project view when set (e.g. in the metadata block with description / start / end) so they’re visible and easy to open.
- Persist and load the fields via the existing project repo and API; no new endpoints.
- Store three optional URLs per project: Jira Product Discovery, Jira Delivery, Confluence.
- Edit all three from the existing project edit picker and per-field input (no new screens).
- Persist via existing project repo/API; optional display in project view when set.
- Validating URL format or restricting to Atlassian domains (store as text; optional basic URL validation later).
- Opening links from the TUI (e.g. open-in-browser); out of scope for this change.
- Changing project create CLI or other surfaces beyond TUI project edit and optional tokenized metadata.
- Impact: **Database**: New migration adding three nullable URL columns to `projects`.
- Impact: **Server**: Types, Drizzle schema, mapper, and project repo (`createProject` / `updateProject`) extended for the new fields.
- Impact: **TUI**: Project edit picker fields, input modes, submit handling, and InputBar prompts; optionally TaskPanel project view for display. Tokenized project create/edit may be extended for the new tokens.
- Related capabilities: `project-external-links`, `tui-project-metadata-entry`

## Notes

- **1. Three nullable columns** - Add `jira_discovery_url`, `jira_delivery_url`, `confluence_url` (TEXT, nullable) to `projects`. - Rationale: Clear semantics, simple edit UX (one field per link), straightforward display. Alternative of a single JSON/encoded column was rejected for complexity and TUI editing.
- **Stale or wrong URLs** → User responsibility; we don’t validate or refresh. Mitigation: keep storage as plain text so users can fix anytime.
- **Long URLs in TUI** → May wrap or truncate in project view. Mitigation: display as single line or truncate with ellipsis; full URL still in edit field.
- Open questions: - None for initial implementation. Tokenized tokens and "open in browser" can be decided in follow-up changes.

## Implementation Phases

1. Database and server
   - [done] Add migration: three nullable columns `jira_discovery_url`, `jira_delivery_url`, `confluence_url` on `projects`
   - [done] Extend Drizzle schema and raw schema (if used) for the three project URL columns
   - [done] Add `jiraDiscoveryUrl`, `jiraDeliveryUrl`, `confluenceUrl` to `Project` type in `src/server/types.ts`
   - [done] Update `mapProjectRow` in mappers to map the three new columns
   - [done] Extend `createProject` and `updateProject` in project repo to accept and persist the three fields
   - [done] Add schema guard in db client for the new columns (if used for backward compatibility)
2. TUI project edit flow
   - [done] Add three entries to `PROJECT_EDIT_FIELDS` in ProjectEditPicker (Jira Discovery, Jira Delivery, Confluence) with hint e.g. "URL or clear"
   - [done] Add input modes `editProjectJiraDiscovery`, `editProjectJiraDelivery`, `editProjectConfluence` to InputMode type and useInputBar
   - [done] In useMainKeys (projectEditPicker): set initial value and modeMap for the three link fields when user selects them
   - [done] In useSubmitInput: handle the three modes and call api.updateProject with the corresponding patch (value or null)
   - [done] Add INPUT_MODE_LABELS in InputBar for the three new modes
   - [done] Add unit tests for new project-edit link field submit behavior (e.g. in useSubmitInput.test)
3. Project view display
   - [done] In TaskPanel project metadata block, when any of the three URLs is set, show lines for them (e.g. "Jira Discovery: <url>"); omit unset links
4. API surface
   - [done] Ensure API client and server project endpoints expose the three fields on get/list and accept them on create/update (if not already inferred from repo)
5. Optional: tokenized metadata
   - [done] Extend project create/edit parser to recognize `jiraDiscovery:`, `jiraDelivery:`, `confluence:` tokens and include in payload
   - [done] Add the three token keys to autocomplete suggestions for project metadata entry (create and edit)
