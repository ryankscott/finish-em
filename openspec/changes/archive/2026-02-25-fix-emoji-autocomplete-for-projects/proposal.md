## Why

Project emoji input currently supports only a small fixed set of shortcodes (e.g. `:cat:`, `:rocket:`). Autocomplete and parsing use duplicate, hardcoded lists, so users cannot discover or use a wider range of emojis and the two code paths could drift. We should support a broader set of emoji shortcodes and use a single source of truth so autocomplete suggestions and parsed results stay consistent.

## What Changes

- Replace the hardcoded emoji shortcode list with a shared mapping (e.g. from a library such as `@kvpasupuleti/text-to-emoji-converter` or a maintained single module) so many more shortcodes are available.
- Use that same mapping for both (1) TUI autocomplete when the user types after `emoji:` and (2) parsing `emoji::shortcode:` into the final emoji character.
- Ensure behaviour is consistent: any shortcode offered in autocomplete resolves to the same emoji when parsed; unknown shortcodes continue to produce a warning and fall back to literal value.

## Capabilities

### New Capabilities

- `emoji-shortcode-source`: Single source of shortcode→emoji mappings used by TUI autocomplete and project input parsing; may be provided by an external library or an internal shared module.

### Modified Capabilities

- `tui-project-metadata-entry`: Extend emoji token behaviour so that autocomplete and parsing both use the shared emoji shortcode source, supporting a broader set of shortcodes while keeping validation and warning behaviour (e.g. unknown shortcode → warning, literal fallback).

## Impact

- **Code:** `src/tui/input-autocomplete.ts` (autocomplete suggestions), `src/tui/parse-project-input.ts` (shortcode resolution). Possibly a new shared module or dependency for the mapping.
- **Dependencies:** Optional npm dependency (e.g. `@kvpasupuleti/text-to-emoji-converter`) if we adopt it; otherwise a small in-repo mapping or generator.
- **APIs:** No API changes; project create/update payloads and MCP already accept emoji strings.
- **Tests:** Update/add tests for autocomplete and parsing to cover the shared mapping and additional shortcodes.
