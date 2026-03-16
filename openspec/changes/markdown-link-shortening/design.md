## Context

`TaskPanel.tsx` uses `toDisplayString` from `src/lib/task-links.ts` to shorten links in the task title and expanded notes view. Two surfaces were missed:

1. **Collapsed notes preview** (line 118): renders `task.notes` via `truncate(task.notes, 80)` without first applying `toDisplayString`, so raw markdown link syntax and bare URLs appear in the one-line preview.
2. **Project description** (line 181 in the expanded panel): renders `activeProject.description` as plain text with no link processing.

The `toDisplayString` utility already exists and handles both `[label](url)` and bare URL forms. No new logic is needed.

## Goals / Non-Goals

**Goals:**
- Apply `toDisplayString` to the collapsed notes preview so links appear as `[label]` before truncation
- Apply `toDisplayString` to project description display in the expanded task panel

**Non-Goals:**
- Making project descriptions or notes link-openable/interactive (that is a separate TUI interaction concern)
- Changing the storage format of task notes or project descriptions
- Applying link shortening to any surface outside `TaskPanel.tsx`

## Decisions

### Apply `toDisplayString` before `truncate` in the collapsed preview

The collapsed preview truncates to 80 characters. If we truncate the raw string first, long URLs waste most of the 80-char budget. By applying `toDisplayString` before `truncate`, the preview shows the human-readable label and uses the character budget more effectively.

**Alternative considered**: truncate raw first, then convert. Rejected because a link like `[Fix](https://github.com/org/repo/issues/1234)` would be rendered as `[Fix](https://github.com/org/re...` instead of `[Fix]`.

### No changes to `task-links.ts`

All needed utilities (`toDisplayString`, `getLinkDisplayLabel`) already exist. This change is purely a rendering-site fix.

## Risks / Trade-offs

- **Truncation boundary shift**: After `toDisplayString`, the string is shorter, so `truncate(80)` may show slightly more text than before for notes with long URLs. This is desirable behavior.
- **Project description is stored as plain text**: If a project description contains `[label](url)`, it will be displayed as `[label]` -- consistent with task notes. No data is lost.

## Open Questions

_(none)_
