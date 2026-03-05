## 1. Link parsing and display helpers

- [x] 1.1 Add shared helper to parse a string into segments (plain text vs link with url and optional label); support `[[label]](url)` and bare URL detection
- [x] 1.2 Add helper to derive display label for a link (custom label if present, else domain from URL; fallback to `link` for invalid URLs)
- [x] 1.3 Add helper that, given title or notes string, returns a structure suitable for TUI rendering (e.g. segments with type and display text/url)
- [x] 1.4 Add unit tests for link parsing, domain extraction, and display-label derivation (edge cases: invalid URL, nested brackets, multiple links)

## 2. Display links in task panels

- [x] 2.1 In TaskPanel, render task title and notes using link-aware helper so URLs appear as `[[label]]` (domain or custom)
- [x] 2.2 In UpcomingPanel, render task title and notes using the same link-aware helper

## 3. Open link from TUI

- [x] 3.1 Add key binding or action to open the link under cursor (or selected link) in system browser
- [x] 3.2 When user invokes open-link, resolve displayed `[[label]]` to URL and open it (e.g. via `open` on macOS / platform-appropriate command)

## 4. Editable notes and link labels

- [x] 4.1 Extend task edit flow so notes are editable (e.g. include notes in serialized edit input and in parseTaskEditInput or separate notes-edit step)
- [x] 4.2 Ensure editing task title or notes preserves URLs when user changes only the `[[...]]` label text; store result as `[[newlabel]](url)` or bare URL unchanged

## 5. Optional: paste normalization

- [x] 5.1 When user pastes a bare URL into title or notes (create or edit), optionally normalize to `[[domain]](url)` before storing
