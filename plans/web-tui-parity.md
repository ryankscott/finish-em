# Web App TUI Parity

## Goal

Bring the React web app (`src/web`) up to feature parity with the Ink TUI (`src/tui`). Both apps share the same HTTP API (`src/server/http`) wrapped by `src/shared/api-client.ts`, so most gaps are missing web UI rather than missing backend. The one backend gap is iCloud sync, which is exposed via new HTTP endpoints.

## Functionality diff (TUI vs Web)

At parity already: task CRUD, subtasks (1 level), blocked tasks, soft delete/restore, priorities, due/scheduled dates, recurrence presets, token Quick Add, the 8 built-in views + project + search, Upcoming board, global search, sidebar toggle, link opening, help, refresh.

Present in TUI, missing from Web (all backend-ready unless noted):
- Goals (daily/weekly, scoped to Upcoming): add, toggle, edit, delete
- Reminders: add (date + time slot), delete, reminders view, due notifications
- Settings: timezone edit, iCloud sync toggle (sync needs new API)
- Project create / edit / delete
- Project metadata (emoji, description, dates, Jira/Confluence/Teams links + statuses) and project view header
- Visual calendar date picker (web uses free-text phrases)
- Reminder notifications (TUI uses terminal bell + macOS notifier)

Web ahead of TUI: command palette, numeric view jumps.

Out of scope unless requested: AI quick add (no HTTP endpoint exists), labels/tags, manual reorder, custom RRULE editor, multi-level nesting, project archive.

## Decisions

- Build phases 1-4 in sequence.
- iCloud sync: expose via the API and build the web toggle (new `/api/sync/*` endpoints).
- Plan tracked in this doc.

## Implementation Phases

1. Sync API: add `getSyncStatus`/`enableSync`/`disableSync`/`syncNow` to the repo-agnostic surface, HTTP routes, `ApiClient`, `http-api`, and web queries. Server process owns the sync service instance.
2. Phase 1 - Projects: project create/edit dialog (all metadata fields incl. Jira statuses), `useProjectMutations`, sidebar add/edit/delete affordances, command-palette entries, and an enriched project view header (description, dates, Discovery/Delivery link blocks with status colors).
3. Phase 2 - Goals: goals panel in the Upcoming view (daily when day mode, weekly otherwise; period start = anchor day or Monday week start), with add (`g`), toggle (`x`), edit (`e`), delete; wired to `useGoals` + new `useGoalMutations`.
4. Phase 3 - Reminders: `/reminders` route + sidebar entry (`useAllReminders`), per-task reminder add (date + time slot picker)/delete from the edit dialog and task hotkeys (`n`/`z`), reminder indicator on `TaskRow`, optional browser Notification polling of `listDueReminders`.
5. Phase 4 - Settings: `/settings` route + sidebar entry for timezone (`updateSettings`) and the iCloud sync toggle (sync API), plus a small sync status indicator.
6. Polish: update Help dialog + command palette with new actions; reconcile keybinding docs.

## Verification

`bun run check` and `bun test` after each phase; manual web pass via `bun run desktop:dev` against a temp `TODO_DB_PATH`.
