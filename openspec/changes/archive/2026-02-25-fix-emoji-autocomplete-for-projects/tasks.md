## 1. Emoji shortcode source module

- [x] 1.1 Add shared module (e.g. `src/lib/emoji-shortcodes.ts`) that exposes a canonical shortcode→emoji map and a list of shortcodes for autocomplete; implement using `@kvpasupuleti/text-to-emoji-converter` or an in-repo static map
- [x] 1.2 Export at least: (1) lookup(shortcode) → emoji | undefined, (2) list of shortcode strings (e.g. `:cat:`) or shortcodes for prefix matching, with consistent normalization (e.g. lowercase)

## 2. Wire TUI autocomplete to shared source

- [x] 2.1 Update `src/tui/input-autocomplete.ts` to use the shared module for `emoji:` value suggestions instead of the hardcoded `EMOJI_SHORTCODES` array
- [x] 2.2 Ensure autocomplete suggests shortcodes in a form that matches what the parser expects (e.g. `:shortcode:`)

## 3. Wire project input parsing to shared source

- [x] 3.1 Update `src/tui/parse-project-input.ts` to resolve `:shortcode:` via the shared module instead of `EMOJI_SHORTCODE_MAP`
- [x] 3.2 Keep unknown shortcode behaviour: add warning and use literal value; no change to validation or submission

## 4. Tests

- [x] 4.1 Add or update unit tests for the shared emoji module (lookup known/unknown, list consistency)
- [x] 4.2 Update `input-autocomplete` tests so emoji suggestions come from the shared source and cover at least one additional shortcode
- [x] 4.3 Update `parse-project-input` tests so shortcode resolution uses the shared source; keep tests for unknown shortcode warning and literal fallback
