## Why

Task notes and project descriptions can contain markdown-style links like `[My Doc](https://example.com/very/long/path)` or bare URLs, but several display surfaces still render the raw text rather than the shortened `[label]` form. This makes the TUI cluttered and harder to read, especially with long URLs.

## What Changes

- Apply `toDisplayString` to task notes in the **collapsed preview** (currently rendered raw with `truncate`)
- Apply `toDisplayString` to **project description** in the task panel expanded view (currently rendered raw)
- Ensure the existing `task-links-inline` behavior (title + expanded notes) is not regressed

## Capabilities

### New Capabilities

_(none — this extends existing display behavior, no new capability contracts needed)_

### Modified Capabilities

- `task-links-inline`: Add requirements covering the collapsed notes preview and project description display surfaces, which currently fall outside the spec's scope.

## Impact

- `src/tui/TaskPanel.tsx`: two display sites updated
- `src/lib/task-links.ts`: no changes expected (utility already exists)
- Tests for `TaskPanel` rendering may need updating if snapshot-based
