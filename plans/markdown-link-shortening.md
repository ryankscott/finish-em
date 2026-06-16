# Markdown Link Shortening

## Summary

Task notes and project descriptions can contain markdown-style links like `[My Doc](https://example.com/very/long/path)` or bare URLs, but several display surfaces still render the raw text rather than the shortened `[label]` form. This makes the TUI cluttered and harder to read, especially with long URLs.

## Scope

- Apply `toDisplayString` to task notes in the **collapsed preview** (currently rendered raw with `truncate`)
- Apply `toDisplayString` to **project description** in the task panel expanded view (currently rendered raw)
- Ensure the existing `task-links-inline` behavior (title + expanded notes) is not regressed
- Apply `toDisplayString` to the collapsed notes preview so links appear as `[label]` before truncation
- Apply `toDisplayString` to project description display in the expanded task panel
- Making project descriptions or notes link-openable/interactive (that is a separate TUI interaction concern)
- Changing the storage format of task notes or project descriptions
- Applying link shortening to any surface outside `TaskPanel.tsx`
- Impact: `src/tui/TaskPanel.tsx`: two display sites updated
- Impact: `src/lib/task-links.ts`: no changes expected (utility already exists)
- Impact: Tests for `TaskPanel` rendering may need updating if snapshot-based
- Related capabilities: `task-links-inline`

## Notes

- Apply `toDisplayString` before `truncate` in the collapsed preview: The collapsed preview truncates to 80 characters. If we truncate the raw string first, long URLs waste most of the 80-char budget. By applying `toDisplayString` before `truncate`, the preview shows the human-readable label and uses the character budget more effectively.
- No changes to `task-links.ts`: All needed utilities (`toDisplayString`, `getLinkDisplayLabel`) already exist. This change is purely a rendering-site fix.
- **Truncation boundary shift**: After `toDisplayString`, the string is shorter, so `truncate(80)` may show slightly more text than before for notes with long URLs. This is desirable behavior.
- **Project description is stored as plain text**: If a project description contains `[label](url)`, it will be displayed as `[label]` -- consistent with task notes. No data is lost.

## Implementation Phases

1. Fix TaskPanel Rendering
   - [done] Apply `toDisplayString` before `truncate` in the collapsed notes preview (`TaskPanel.tsx` line ~118)
   - [done] Apply `toDisplayString` to project description in the expanded panel view (`TaskPanel.tsx` line ~181)
2. Tests
   - [done] Add test: collapsed notes preview renders `[label]` for a markdown link (not raw syntax)
   - [done] Add test: collapsed notes preview renders `[label]` for a bare URL (not raw URL)
   - [done] Add test: expanded project description renders `[label]` for a markdown link
   - [done] Add test: expanded project description renders `[label]` for a bare URL
