## Context

Task title and notes are plain text (no schema change). Today URLs appear as raw strings. The TUI renders them in TaskPanel and UpcomingPanel; task edit updates title (and metadata) via `parseTaskEditInput`; notes are set on create only (no notes edit in TUI yet). This change adds link-aware display and editable labels using an inline convention.

## Goals / Non-Goals

**Goals:**
- Display URLs in title and notes as `[[label]]` with domain as default label; support custom labels via `[[label]](url)`.
- Allow users to edit the label (text inside `[[...]]`) without changing the URL.
- Keep storage inline in existing `title` and `notes` fields; no new columns or tables.
- Optional: normalize pasted bare URLs to `[[domain]](url)` for consistent storage.

**Non-Goals:**
- Rich link previews, favicons, or server-side fetch of link content.
- Changing the task API or database schema.
- Link support outside task title and notes (e.g. projects, goals).

## Decisions

1. **Inline convention**
   - **Choice:** Store links as `[[label]](url)` in title/notes; bare URLs allowed and displayed using domain as label.
   - **Rationale:** No migration, works with existing APIs. Matches proposal. Alternatives: separate links column (schema change, more complexity) or URL-only with label in a map (two sources of truth, URL normalization issues).

2. **Domain extraction**
   - **Choice:** Use `new URL(url).hostname` (or equivalent) for default label. Handle invalid URLs by falling back to a fixed label (e.g. `link`).
   - **Rationale:** Simple, predictable. Long hostnames can be truncated in display if needed (implementation detail).

3. **Where to parse and render**
   - **Choice:** Shared helper(s) that (a) parse a string into segments (text vs link with url + label), (b) derive display label (custom or domain), (c) render for TUI (e.g. `[[label]]` plus open-URL behavior). Used by TaskPanel and UpcomingPanel; edit flow uses same parsing so label edits only change the `[[...]]` part.
   - **Rationale:** Single place for regex/URL handling and edge cases (nested brackets, multiple links).

4. **Notes editing**
   - **Choice:** Extend TUI task edit so notes are editable (e.g. in the same or a follow-up edit flow). Link-label editing applies to both title and notes.
   - **Rationale:** Proposal requires editable labels in notes; currently notes are create-only. Design calls out adding notes to edit flow; exact UX (separate mode vs combined) is left to tasks.

5. **Paste normalization**
   - **Choice:** Optional: when a bare URL is inserted (e.g. paste), normalize to `[[domain]](url)` so stored form is consistent. Not required for display to work.
   - **Rationale:** Improves consistency and makes every link editable; can be a follow-up task if we ship display + edit first.

## Risks / Trade-offs

- **Parsing edge cases:** Malformed or nested `[[...]](...)` could misparse. Mitigation: strict regex or small state machine; treat ambiguous content as plain text.
- **TUI link interaction:** In terminal, "open link" means opening URL in system browser (e.g. `open` on macOS). Mitigation: use existing or standard TUI pattern for opening URLs.
- **Edit UX for "label only":** Editing just the label in a single-line title is fiddly. Mitigation: allow full string edit (user can change the `[[...]]` part); optional future "focus link → edit label" sub-mode.

## Migration Plan

No data migration. Deploy as feature: new helpers and panel/edit changes; existing content continues to work (bare URLs gain domain display; existing `[[label]](url)` if any gains display/editing).

## Open Questions

- Whether to truncate very long domain labels in display (e.g. max length + ellipsis).
- Whether paste normalization is in initial scope or a follow-up task.
