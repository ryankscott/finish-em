/**
 * Canonical shortcode→emoji mapping for TUI project emoji autocomplete and parsing.
 * Single source of truth; consumers use lookup() and shortcodeListForAutocomplete().
 *
 * Backed by emojilib v2 (~1570 GitHub-compatible shortcodes).
 */
// @ts-expect-error - emojilib is a CJS package; static import lets Bun bundle it
import _emojilibRaw from "emojilib";

const _emojilib = _emojilibRaw as { lib: Record<string, { char: string }> };

/** Index built from emojilib v2: shortcode → emoji char. */
const EMOJILIB_INDEX: Record<string, string> = {};
for (const [shortcode, data] of Object.entries(_emojilib.lib)) {
	if (data?.char) EMOJILIB_INDEX[shortcode] = data.char;
}

/** Normalize shortcode for lookup: strip surrounding colons, lowercase. */
function normalizeShortcode(raw: string): string {
	return raw.replace(/^:|:$/g, "").toLowerCase();
}

/**
 * Look up emoji for a shortcode. Returns undefined if not found.
 * Input may be "cat", ":cat:", or "CAT"; matching is case-insensitive.
 */
export function lookup(shortcode: string): string | undefined {
	const key = normalizeShortcode(shortcode);
	if (!key) return undefined;
	return EMOJILIB_INDEX[key];
}

/** All shortcodes in :shortcode: form, sorted, for autocomplete prefix matching. */
const AUTOCOMPLETE_SHORTCODES: readonly string[] = Object.keys(EMOJILIB_INDEX)
	.map((s) => `:${s}:`)
	.sort();

/**
 * Return the list of shortcode strings (e.g. ":cat:") for prefix matching in autocomplete.
 * Do not mutate the returned array.
 */
export function shortcodeListForAutocomplete(): readonly string[] {
	return AUTOCOMPLETE_SHORTCODES;
}
