# Design: Project Jira / Confluence links

## Context

Projects currently have: name, emoji, description, startAt, endAt, color, isInbox. Editing is done via the project edit picker (e in project view): user selects a field (name, emoji, description, start date, end date), enters a value, and submit calls `updateProject`. The same pattern is used for create (tokenized input) and the TUI already shows description/start/end in project view (TaskPanel). We are adding three optional URL fields and making them editable from the same flow.

## Goals / Non-Goals

**Goals:**
- Store three optional URLs per project: Jira Product Discovery, Jira Delivery, Confluence.
- Edit all three from the existing project edit picker and per-field input (no new screens).
- Persist via existing project repo/API; optional display in project view when set.

**Non-Goals:**
- Validating URL format or restricting to Atlassian domains (store as text; optional basic URL validation later).
- Opening links from the TUI (e.g. open-in-browser); out of scope for this change.
- Changing project create CLI or other surfaces beyond TUI project edit and optional tokenized metadata.

## Decisions

**1. Three nullable columns**
- Add `jira_discovery_url`, `jira_delivery_url`, `confluence_url` (TEXT, nullable) to `projects`.
- Rationale: Clear semantics, simple edit UX (one field per link), straightforward display. Alternative of a single JSON/encoded column was rejected for complexity and TUI editing.

**2. No URL validation at persistence**
- Store whatever string the user enters. Optional client-side or server-side URL validation can be added later.
- Rationale: Keeps first version simple; paste-from-browser is the main use case.

**3. Edit flow: extend existing picker and input modes**
- Add three rows to `PROJECT_EDIT_FIELDS` in ProjectEditPicker (e.g. "Jira Discovery", "Jira Delivery", "Confluence") with hints like "URL or clear".
- Add three input modes (e.g. `editProjectJiraDiscovery`, `editProjectJiraDelivery`, `editProjectConfluence`) and wire them in useMainKeys (initial value, modeMap), useSubmitInput (patch and api.updateProject), and InputBar prompts.
- Rationale: Same pattern as name/emoji/description/dates; no new concepts.

**4. Display in project view**
- When any of the three URLs is set, show them in the project metadata block in TaskPanel (e.g. "Jira Discovery: <url>", "Jira Delivery: …", "Confluence: …"). Only show lines for set links.
- Rationale: Makes links visible and copyable; opening in browser can be a follow-up.

**5. Tokenized metadata (optional for this change)**
- Proposal allows extending tui-project-metadata-entry with tokens like `jiraDiscovery:`, `jiraDelivery:`, `confluence:`. Design: implement if spec requires it; otherwise defer to a follow-up so first deliverable stays minimal.

## Risks / Trade-offs

- **Stale or wrong URLs** → User responsibility; we don’t validate or refresh. Mitigation: keep storage as plain text so users can fix anytime.
- **Long URLs in TUI** → May wrap or truncate in project view. Mitigation: display as single line or truncate with ellipsis; full URL still in edit field.

## Migration Plan

1. Add migration `00N_project_external_links.sql`: `ALTER TABLE projects ADD COLUMN jira_discovery_url TEXT;` (and same for `jira_delivery_url`, `confluence_url`).
2. Update Drizzle schema, types, mapper, and project repo (create/update) to include the three fields.
3. Deploy TUI changes (picker, input modes, submit, prompts, optional TaskPanel display).
4. Run `bun run db:migrate` for existing installs; new installs get schema from bootstrap. No rollback needed beyond reverting code and ignoring the new columns.

## Open Questions

- None for initial implementation. Tokenized tokens and "open in browser" can be decided in follow-up changes.
