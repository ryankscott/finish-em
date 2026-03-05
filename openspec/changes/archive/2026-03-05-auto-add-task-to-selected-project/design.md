## Context

Quick Add creates tasks from the input bar. Today the projectId fallback is: `parsed.input.projectId ?? inboxId ?? 1`. The TUI already has navigation state (`activeProjectId` / `activeProject`) and passes it into `useSubmitInput`. No new dependencies or data model changes are required; this is a single-point change in the fallback chain at submit time.

## Goals / Non-Goals

**Goals:**

- Use the currently selected project as the default project for Quick Add when the user does not specify a project in the input.
- Preserve explicit input: if the user types `project: X`, that project wins.
- Keep existing behavior when no project is selected (e.g. Inbox or other views): default to Inbox.

**Non-Goals:**

- Changing how project selection works or adding new UI.
- Changing `parseTaskCreateInput` (no new tokens; defaulting is submit-time only).
- Extending the plain-text Quick Add API in this change (can be done later if desired).

## Decisions

1. **Where to apply the default**  
   Apply in `useSubmitInput` in the Quick Add branch when building `projectId` for `api.createTask()`. Use: `parsed.input.projectId ?? activeProjectId ?? inboxId ?? 1`.  
   *Alternative:* Pass default from App and let a lower layer decide; rejected to keep the single place that already has both `parsed` and `activeProjectId`.

2. **Definition of "project selected"**  
   Use `activeProjectId != null` (and optionally ensure it’s a valid project). When the user is on Inbox, `activeProjectId` may still be set to the Inbox project id; that is acceptable (Inbox remains the default). No change to navigation or sidebar logic.

3. **Plain-text Quick Add (`createQuickAdd`)**  
   Out of scope for this change. That path does not accept a project today; adding a default would require API/backend changes. Spec and implementation focus on the parsed-token create path only unless we explicitly add the API extension.

## Risks / Trade-offs

- **Risk:** User forgets they have a project selected and creates "Inbox" tasks in that project.  
  **Mitigation:** No change to explicit project in input; user can type `project: Inbox` to force Inbox. Behavior matches "selected project = context for new work."

- **Trade-off:** Plain-text Quick Add (no tokens) still goes to Inbox. Acceptable for a minimal first step; can be revisited with an API change.

## Migration Plan

No migration. TUI-only change; deploy as usual. Rollback: revert the fallback change to restore Inbox-only default.

## Open Questions

- None. Optional follow-up: add `defaultProjectId` to `createQuickAdd` so plain-text Quick Add also respects the selected project.
