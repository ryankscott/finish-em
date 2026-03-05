## Why

Tasks often contain URLs (specs, tickets, docs). Raw URLs clutter the UI and cannot be relabeled. Users need links in task title and notes to be shown as short, readable placeholders (default: domain) and to be able to edit that label.

## What Changes

- **Display**: In task title and notes, URLs are shown as `[[label]]` instead of raw URLs. Default label is the link’s domain (e.g. `https://docs.example.com/path` → `[[docs.example.com]]`). Custom labels supported via `[[label]](url)`.
- **Editing**: Users can edit the label (the text inside `[[...]]`); the URL is preserved. Editing applies in both title and notes.
- **Scope**: Links supported in both task title and task notes. No new columns or tables; links remain inline in existing `title` and `notes` text.
- **Optional**: When pasting a raw URL, normalize to `[[domain]](url)` so stored form is consistent and the label is editable.

## Capabilities

### New Capabilities

- `task-links-inline`: Display and editing of links in task title and notes—inline convention `[[label]](url)`, display as `[[label]]` (or `[[domain]]` when no label), editable label, domain as default.

### Modified Capabilities

- None. (Notes editing may be extended in the TUI; that can be treated as implementation in design/tasks rather than a requirement change to an existing spec.)

## Impact

- **TUI**: TaskPanel and UpcomingPanel (where task title and notes are rendered); task edit flow (title already editable; notes may need to be added or extended for link-label editing).
- **Parsing/display**: New or shared helpers to detect URLs and `[[...]](url)` in strings, derive domain for bare URLs, and render as `[[label]]` with open-in-browser behavior where applicable.
- **Storage**: No schema change. Title and notes remain plain text; link syntax is convention within that text.
- **APIs**: No change to task API contract; title and notes continue as strings.
