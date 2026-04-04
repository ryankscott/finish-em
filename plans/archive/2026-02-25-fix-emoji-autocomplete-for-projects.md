# Fix Emoji Autocomplete For Projects

_Archived change: `2026-02-25-fix-emoji-autocomplete-for-projects`_

## Summary

Project emoji input currently supports only a small fixed set of shortcodes (e.g. `:cat:`, `:rocket:`). Autocomplete and parsing use duplicate, hardcoded lists, so users cannot discover or use a wider range of emojis and the two code paths could drift. We should support a broader set of emoji shortcodes and use a single source of truth so autocomplete suggestions and parsed results stay consistent.

## Scope

- Replace the hardcoded emoji shortcode list with a shared mapping (e.g. from a library such as `@kvpasupuleti/text-to-emoji-converter` or a maintained single module) so many more shortcodes are available.
- Use that same mapping for both (1) TUI autocomplete when the user types after `emoji:` and (2) parsing `emoji::shortcode:` into the final emoji character.
- Ensure behaviour is consistent: any shortcode offered in autocomplete resolves to the same emoji when parsed; unknown shortcodes continue to produce a warning and fall back to literal value.
- One canonical shortcode→emoji mapping used by both autocomplete and parsing.
- Support a much larger set of shortcodes (e.g. tens or hundreds) so users can pick many more emojis.
- Preserve current behaviour for unknown shortcodes: warning and literal fallback.
- Keep the same UX: `emoji:` token, `:shortcode:` syntax, tab-complete.
- Changing project or task APIs; emoji remains a string field.
- Supporting emoji in other surfaces (e.g. task title) in this change.
- Custom user-defined shortcodes or themes.
- Impact: **Code:** `src/tui/input-autocomplete.ts` (autocomplete suggestions), `src/tui/parse-project-input.ts` (shortcode resolution). Possibly a new shared module or dependency for the mapping.
- Impact: **Dependencies:** Optional npm dependency (e.g. `@kvpasupuleti/text-to-emoji-converter`) if we adopt it; otherwise a small in-repo mapping or generator.
- Impact: **APIs:** No API changes; project create/update payloads and MCP already accept emoji strings.
- Impact: **Tests:** Update/add tests for autocomplete and parsing to cover the shared mapping and additional shortcodes.
- Related capabilities: `emoji-shortcode-source`, `tui-project-metadata-entry`

## Notes

- 1. Source of shortcode→emoji mapping: **Choice:** Use a shared in-app module that exposes a single map (or equivalent), populated either by (a) adopting `@kvpasupuleti/text-to-emoji-converter` and deriving the map from its default mappings, or (b) maintaining an in-repo map (e.g. generated or hand-curated) if we prefer no new dependency.
- 2. Where the shared module lives: **Choice:** New module under `src/lib/` (e.g. `emoji-shortcodes.ts`) that exports at least: (1) a map or function from shortcode (normalized, e.g. lowercase) to emoji character(s), and (2) a list of shortcodes (or shortcode strings like `:cat:`) for autocomplete. Parser and autocomplete both import from this module.
- 3. Unknown shortcode behaviour: **Choice:** Unchanged. If the user enters `emoji::unknown:` and "unknown" is not in the shared mapping, parsing adds a warning and uses the literal value `:unknown:` (or the raw input). No change to validation or submission rules.
- **Library dependency:** If we add `@kvpasupuleti/text-to-emoji-converter`, we take on its maintenance and bundle size. Mitigation: depend on it only in the shared module; if we later replace it with a static map, call sites stay the same.
- **Shortcode format:** Library and our current format might differ (e.g. "cat" vs ":cat:"). Mitigation: normalize in the shared module (e.g. strip colons for lookup, add colons for display/autocomplete) so the rest of the app sees a consistent shape.
- **Performance:** A very large map could make autocomplete filter slightly slower. Mitigation: autocomplete only needs to match prefix; we can derive a sorted or prefix-friendly list from the map and keep the implementation simple unless we see real slowness.
- Open questions: - Final decision: adopt `@kvpasupuleti/text-to-emoji-converter` vs in-repo static map (can be decided during implementation based on bundle size and coverage).

## Implementation Phases

1. Emoji shortcode source module
   - [done] Add shared module (e.g. `src/lib/emoji-shortcodes.ts`) that exposes a canonical shortcode→emoji map and a list of shortcodes for autocomplete; implement using `@kvpasupuleti/text-to-emoji-converter` or an in-repo static map
   - [done] Export at least: (1) lookup(shortcode) → emoji | undefined, (2) list of shortcode strings (e.g. `:cat:`) or shortcodes for prefix matching, with consistent normalization (e.g. lowercase)
2. Wire TUI autocomplete to shared source
   - [done] Update `src/tui/input-autocomplete.ts` to use the shared module for `emoji:` value suggestions instead of the hardcoded `EMOJI_SHORTCODES` array
   - [done] Ensure autocomplete suggests shortcodes in a form that matches what the parser expects (e.g. `:shortcode:`)
3. Wire project input parsing to shared source
   - [done] Update `src/tui/parse-project-input.ts` to resolve `:shortcode:` via the shared module instead of `EMOJI_SHORTCODE_MAP`
   - [done] Keep unknown shortcode behaviour: add warning and use literal value; no change to validation or submission
4. Tests
   - [done] Add or update unit tests for the shared emoji module (lookup known/unknown, list consistency)
   - [done] Update `input-autocomplete` tests so emoji suggestions come from the shared source and cover at least one additional shortcode
   - [done] Update `parse-project-input` tests so shortcode resolution uses the shared source; keep tests for unknown shortcode warning and literal fallback
