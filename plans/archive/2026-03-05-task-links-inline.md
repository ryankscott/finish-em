# Task Links Inline

_Archived change: `2026-03-05-task-links-inline`_

## Summary

Tasks often contain URLs (specs, tickets, docs). Raw URLs clutter the UI and cannot be relabeled. Users need links in task title and notes to be shown as short, readable placeholders (default: domain) and to be able to edit that label.

## Scope

- **Display**: In task title and notes, URLs are shown as `[[label]]` instead of raw URLs. Default label is the link’s domain (e.g. `https://docs.example.com/path` → `[[docs.example.com]]`). Custom labels supported via `[[label]](url)`.
- **Editing**: Users can edit the label (the text inside `[[...]]`); the URL is preserved. Editing applies in both title and notes.
- **Scope**: Links supported in both task title and task notes. No new columns or tables; links remain inline in existing `title` and `notes` text.
- **Optional**: When pasting a raw URL, normalize to `[[domain]](url)` so stored form is consistent and the label is editable.
- Display URLs in title and notes as `[[label]]` with domain as default label; support custom labels via `[[label]](url)`.
- Allow users to edit the label (text inside `[[...]]`) without changing the URL.
- Keep storage inline in existing `title` and `notes` fields; no new columns or tables.
- Optional: normalize pasted bare URLs to `[[domain]](url)` for consistent storage.
- Rich link previews, favicons, or server-side fetch of link content.
- Changing the task API or database schema.
- Link support outside task title and notes (e.g. projects, goals).
- Impact: **TUI**: TaskPanel and UpcomingPanel (where task title and notes are rendered); task edit flow (title already editable; notes may need to be added or extended for link-label editing).
- Impact: **Parsing/display**: New or shared helpers to detect URLs and `[[...]](url)` in strings, derive domain for bare URLs, and render as `[[label]]` with open-in-browser behavior where applicable.
- Impact: **Storage**: No schema change. Title and notes remain plain text; link syntax is convention within that text.
- Impact: **APIs**: No change to task API contract; title and notes continue as strings.
- Related capabilities: `task-links-inline`

## Notes

- 1. **Inline convention** - **Choice:** Store links as `[[label]](url)` in title/notes; bare URLs allowed and displayed using domain as label. - **Rationale:** No migration, works with existing APIs. Matches proposal. Alternatives: separate links column (schema change, more complexity) or URL-only with label in a map (two sources of truth, URL normalization issues).
- **Parsing edge cases:** Malformed or nested `[[...]](...)` could misparse. Mitigation: strict regex or small state machine; treat ambiguous content as plain text.
- **TUI link interaction:** In terminal, "open link" means opening URL in system browser (e.g. `open` on macOS). Mitigation: use existing or standard TUI pattern for opening URLs.
- **Edit UX for "label only":** Editing just the label in a single-line title is fiddly. Mitigation: allow full string edit (user can change the `[[...]]` part); optional future "focus link → edit label" sub-mode.
- Open questions: - Whether to truncate very long domain labels in display (e.g. max length + ellipsis). - Whether paste normalization is in initial scope or a follow-up task.

## Implementation Phases

1. Link parsing and display helpers
   - [done] Add shared helper to parse a string into segments (plain text vs link with url and optional label); support `[[label]](url)` and bare URL detection
   - [done] Add helper to derive display label for a link (custom label if present, else domain from URL; fallback to `link` for invalid URLs)
   - [done] Add helper that, given title or notes string, returns a structure suitable for TUI rendering (e.g. segments with type and display text/url)
   - [done] Add unit tests for link parsing, domain extraction, and display-label derivation (edge cases: invalid URL, nested brackets, multiple links)
2. Display links in task panels
   - [done] In TaskPanel, render task title and notes using link-aware helper so URLs appear as `[[label]]` (domain or custom)
   - [done] In UpcomingPanel, render task title and notes using the same link-aware helper
3. Open link from TUI
   - [done] Add key binding or action to open the link under cursor (or selected link) in system browser
   - [done] When user invokes open-link, resolve displayed `[[label]]` to URL and open it (e.g. via `open` on macOS / platform-appropriate command)
4. Editable notes and link labels
   - [done] Extend task edit flow so notes are editable (e.g. include notes in serialized edit input and in parseTaskEditInput or separate notes-edit step)
   - [done] Ensure editing task title or notes preserves URLs when user changes only the `[[...]]` label text; store result as `[[newlabel]](url)` or bare URL unchanged
5. Optional: paste normalization
   - [done] When user pastes a bare URL into title or notes (create or edit), optionally normalize to `[[domain]](url)` before storing
