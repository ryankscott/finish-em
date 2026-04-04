# Replace Emoji Shortcodes with node-emoji Library

## Status: in-progress

## What

Swap the 65-entry hand-curated emoji shortcode map in `src/lib/emoji-shortcodes.ts` for `node-emoji` v2 (~1800 emojis). The `lookup()` and `shortcodeListForAutocomplete()` exports are preserved unchanged — no changes to any consumer.

## Key files

- `src/lib/emoji-shortcodes.ts` — full rewrite
- `src/lib/emoji-shortcodes.test.ts` — update tests

## Consumers (no changes needed)

- `src/tui/input-autocomplete.ts` — uses `shortcodeListForAutocomplete()`
- `src/tui/parse-project-input.ts` — uses `lookup()`

## Approach

### Phase 1: Install

1. `bun add node-emoji`

### Phase 2: Rewrite emoji-shortcodes.ts

2. Import `node-emoji`
3. Define a small `LEGACY_ALIASES` object covering old shortcodes whose names differ from node-emoji's standard names
4. `lookup(shortcode)`: normalize (strip colons, lowercase) → check `LEGACY_ALIASES` first → then `nodeEmoji.get(key)` → `undefined` if both miss
5. `shortcodeListForAutocomplete()`: merge `nodeEmoji.names()` + legacy alias keys → sort, dedupe → return as `:shortcode:` array (pre-computed constant)

### Phase 3: Update tests

6. Update `emoji-shortcodes.test.ts`:
   - Keep legacy shortcode assertions (`:cat:`, `:rocket:`, `:heart:`)
   - Add assertion that list length is > 500 (confirms full library coverage)
   - Add coverage for a node-emoji native shortcode like `wave`

## Legacy aliases

These shortcodes existed in the old map but have different names in node-emoji. We keep them as aliases for backward compatibility:

| Old shortcode | Old emoji | node-emoji name  |
| ------------- | --------- | ---------------- |
| check         | ✅         | white_check_mark |
| magnifier     | 🔍         | mag              |
| ball          | ⚽         | soccer           |
| chart         | 📊         | bar_chart        |
| phone         | 📱         | iphone           |
| no_entry      | ⛔         | no_entry_sign    |
| memo          | 📝         | memo             |

## Verification

1. `bun test src/lib/emoji-shortcodes.test.ts` — all pass
2. `bun run check` — no lint errors
3. Manual TUI: `emoji::wave` → Tab → `:wave:` (wouldn't work with old 65-entry set)
4. Manual TUI: `emoji::ro` → Tab → `:rocket:` still works

## Decisions

- API stays identical — zero changes to the two consumers
- Legacy aliases kept small (only mismatches) — stored in the same file
- No changes to DB schema — emoji stored as Unicode chars, not shortcodes
- `node-emoji` v2 chosen for clean ESM API, GitHub-compatible shortcode names, and active maintenance
