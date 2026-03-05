# Proposal: Project Jira / Confluence links

## Why

Projects I work on are often tied to Confluence spaces and Jira boards (Product Discovery and/or Delivery). I want to store the root page or doc for each and open it quickly from the TUI instead of hunting for the link.

## What Changes

- Add three optional URL fields to projects: **Jira Product Discovery**, **Jira Delivery**, and **Confluence**.
- Expose them in the existing project edit flow (project edit picker → choose field → enter or paste URL).
- Optionally show the links in project view when set (e.g. in the metadata block with description / start / end) so they’re visible and easy to open.
- Persist and load the fields via the existing project repo and API; no new endpoints.

## Capabilities

### New Capabilities

- **project-external-links**: Projects can store optional Jira Product Discovery, Jira Delivery, and Confluence URLs; TUI project edit screen supports editing these fields; project view may display them when set.

### Modified Capabilities

- **tui-project-metadata-entry**: Extend supported editable project metadata to include the three link fields (and optional tokenized input tokens for them, e.g. `jiraDiscovery:`, `jiraDelivery:`, `confluence:`).

## Impact

- **Database**: New migration adding three nullable URL columns to `projects`.
- **Server**: Types, Drizzle schema, mapper, and project repo (`createProject` / `updateProject`) extended for the new fields.
- **TUI**: Project edit picker fields, input modes, submit handling, and InputBar prompts; optionally TaskPanel project view for display. Tokenized project create/edit may be extended for the new tokens.
