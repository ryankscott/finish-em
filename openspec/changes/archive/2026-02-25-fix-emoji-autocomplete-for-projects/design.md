## Context

Project creation in the TUI accepts tokenized input (e.g. `name:Work emoji::rocket:`). Today, emoji handling is duplicated: `src/tui/input-autocomplete.ts` has a hardcoded list of shortcodes for tab-completion, and `src/tui/parse-project-input.ts` has a separate `EMOJI_SHORTCODE_MAP` for resolving `:shortcode:` to a Unicode emoji. Only nine shortcodes are supported. Adding more requires editing both places and risks drift. The proposal calls for a single source of shortcode→emoji mappings and consistent behaviour between autocomplete and parsing.

## Goals / Non-Goals

**Goals:**
- One canonical shortcode→emoji mapping used by both autocomplete and parsing.
- Support a much larger set of shortcodes (e.g. tens or hundreds) so users can pick many more emojis.
- Preserve current behaviour for unknown shortcodes: warning and literal fallback.
- Keep the same UX: `emoji:` token, `:shortcode:` syntax, tab-complete.

**Non-Goals:**
- Changing project or task APIs; emoji remains a string field.
- Supporting emoji in other surfaces (e.g. task title) in this change.
- Custom user-defined shortcodes or themes.

## Decisions

### 1. Source of shortcode→emoji mapping

**Choice:** Use a shared in-app module that exposes a single map (or equivalent), populated either by (a) adopting `@kvpasupuleti/text-to-emoji-converter` and deriving the map from its default mappings, or (b) maintaining an in-repo map (e.g. generated or hand-curated) if we prefer no new dependency.

**Rationale:** Both autocomplete and parser need the same list. A dedicated module (e.g. `src/lib/emoji-shortcodes.ts`) keeps one source of truth and allows swapping the implementation (library vs static map) without touching TUI code. The library offers a ready-made, broad set of mappings and a simple API (`getMappings()` or equivalent); if bundle size or control is a concern, we can instead ship a static map and still use one module.

**Alternatives considered:** (1) Keep two lists but generate one from the other via a build step — still two concepts and easy to forget to regenerate. (2) Only expand the hardcoded list in both files — no single source, more maintenance.

### 2. Where the shared module lives

**Choice:** New module under `src/lib/` (e.g. `emoji-shortcodes.ts`) that exports at least: (1) a map or function from shortcode (normalized, e.g. lowercase) to emoji character(s), and (2) a list of shortcodes (or shortcode strings like `:cat:`) for autocomplete. Parser and autocomplete both import from this module.

**Rationale:** `src/lib` already holds shared utilities; this is shared data + trivial helpers, not UI. No new top-level package boundary.

### 3. Unknown shortcode behaviour

**Choice:** Unchanged. If the user enters `emoji::unknown:` and "unknown" is not in the shared mapping, parsing adds a warning and uses the literal value `:unknown:` (or the raw input). No change to validation or submission rules.

**Rationale:** Proposal explicitly required keeping this behaviour; it avoids breaking existing or accidental input.

## Risks / Trade-offs

- **Library dependency:** If we add `@kvpasupuleti/text-to-emoji-converter`, we take on its maintenance and bundle size. Mitigation: depend on it only in the shared module; if we later replace it with a static map, call sites stay the same.
- **Shortcode format:** Library and our current format might differ (e.g. "cat" vs ":cat:"). Mitigation: normalize in the shared module (e.g. strip colons for lookup, add colons for display/autocomplete) so the rest of the app sees a consistent shape.
- **Performance:** A very large map could make autocomplete filter slightly slower. Mitigation: autocomplete only needs to match prefix; we can derive a sorted or prefix-friendly list from the map and keep the implementation simple unless we see real slowness.

## Migration Plan

- No data migration. Emoji is already stored as a string; existing projects keep their current emoji.
- Deploy: ship the new shared module, then update `input-autocomplete.ts` and `parse-project-input.ts` to use it; run tests and manual smoke check. Rollback: revert the commit; no schema or API change.

## Open Questions

- Final decision: adopt `@kvpasupuleti/text-to-emoji-converter` vs in-repo static map (can be decided during implementation based on bundle size and coverage).
