/**
 * Canonical shortcode→emoji mapping for TUI project emoji autocomplete and parsing.
 * Single source of truth; consumers use lookup() and shortcodeListForAutocomplete().
 *
 * Backed by emojilib v2 (~1570 GitHub-compatible shortcodes).
 */
// @ts-expect-error - emojilib is a CJS package; static import lets Bun bundle it
import _emojilibRaw from "emojilib";

const _emojilib = _emojilibRaw as {
	lib: Record<string, { char: string; keywords?: string[]; category?: string }>;
};

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

/* ------------------------------------------------------------------ */
/*  Picker support                                                     */
/* ------------------------------------------------------------------ */

export type EmojiEntry = {
	char: string;
	shortcode: string;
	keywords: string[];
	category: string;
};

/** Display order for the picker; anything unrecognised falls in at the end. */
const CATEGORY_ORDER = [
	"people",
	"animals_and_nature",
	"food_and_drink",
	"activity",
	"travel_and_places",
	"objects",
	"symbols",
	"flags",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
	people: "Smileys & people",
	animals_and_nature: "Animals & nature",
	food_and_drink: "Food & drink",
	activity: "Activity",
	travel_and_places: "Travel & places",
	objects: "Objects",
	symbols: "Symbols",
	flags: "Flags",
};

const ALL_EMOJI: readonly EmojiEntry[] = Object.entries(_emojilib.lib)
	.filter(([, data]) => Boolean(data?.char))
	.map(([shortcode, data]) => ({
		char: data.char,
		shortcode,
		keywords: data.keywords ?? [],
		category: data.category ?? "other",
	}))
	.sort((a, b) => {
		const ai = CATEGORY_ORDER.indexOf(a.category as never);
		const bi = CATEGORY_ORDER.indexOf(b.category as never);
		// Unknown categories sort last rather than to the front, which is what
		// indexOf's -1 would otherwise do.
		const an = ai === -1 ? CATEGORY_ORDER.length : ai;
		const bn = bi === -1 ? CATEGORY_ORDER.length : bi;
		return an - bn;
	});

/** Every emoji, ordered by category. Do not mutate. */
export function emojiList(): readonly EmojiEntry[] {
	return ALL_EMOJI;
}

/**
 * Substring search over shortcode and keywords, for the emoji picker.
 *
 * Shortcode matches rank above keyword matches, and prefix matches above
 * mid-word ones, so typing "hea" surfaces :heart: before :headphones: and well
 * before an emoji that merely lists "heavy" as a keyword.
 */
export function searchEmoji(query: string, limit = 300): EmojiEntry[] {
	const q = query.trim().toLowerCase();
	if (!q) return ALL_EMOJI.slice(0, limit);

	const scored: Array<{ entry: EmojiEntry; score: number }> = [];
	for (const entry of ALL_EMOJI) {
		let score = -1;
		if (entry.shortcode === q) score = 0;
		else if (entry.shortcode.startsWith(q)) score = 1;
		else if (entry.shortcode.includes(q)) score = 2;
		else if (entry.keywords.some((k) => k.toLowerCase().startsWith(q)))
			score = 3;
		else if (entry.keywords.some((k) => k.toLowerCase().includes(q))) score = 4;
		if (score >= 0) scored.push({ entry, score });
	}
	scored.sort((a, b) => a.score - b.score);
	return scored.slice(0, limit).map((s) => s.entry);
}
