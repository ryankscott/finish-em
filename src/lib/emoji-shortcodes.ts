/**
 * Canonical shortcode→emoji mapping for TUI project emoji autocomplete and parsing.
 * Single source of truth; consumers use lookup() and shortcodeListForAutocomplete().
 */

const SHORTCODE_TO_EMOJI: Record<string, string> = {
	// Original set (kept for backward compatibility)
	cat: "🐱",
	dog: "🐶",
	rocket: "🚀",
	fire: "🔥",
	star: "⭐",
	check: "✅",
	bug: "🐛",
	sparkles: "✨",
	wrench: "🔧",
	// Extended set (common :shortcode: style)
	heart: "❤️",
	smile: "😊",
	grin: "😁",
	joy: "😂",
	thumbsup: "👍",
	thumbsdown: "👎",
	eyes: "👀",
	bulb: "💡",
	book: "📖",
	calendar: "📅",
	clock: "🕐",
	flag: "🚩",
	key: "🔑",
	lock: "🔒",
	memo: "📝",
	pencil: "✏️",
	chart: "📊",
	money: "💰",
	coffee: "☕",
	apple: "🍎",
	pizza: "🍕",
	house: "🏠",
	car: "🚗",
	plane: "✈️",
	ship: "🚢",
	ball: "⚽",
	music: "🎵",
	camera: "📷",
	phone: "📱",
	mail: "✉️",
	link: "🔗",
	zap: "⚡",
	boom: "💥",
	tada: "🎉",
	gift: "🎁",
	medal: "🏅",
	trophy: "🏆",
	compass: "🧭",
	gear: "⚙️",
	hammer: "🔨",
	magnifier: "🔍",
	question: "❓",
	exclamation: "❗",
	warning: "⚠️",
	no_entry: "⛔",
	recycle: "♻️",
	white_check_mark: "✅",
	red_circle: "🔴",
	green_circle: "🟢",
	blue_circle: "🔵",
	yellow_circle: "🟡",
	purple_circle: "🟣",
	orange_circle: "🟠",
};

/** Normalize shortcode for lookup: strip surrounding colons, lowercase. */
function normalizeShortcode(raw: string): string {
	return raw.replace(/^:|:$/g, "").toLowerCase();
}

/**
 * Look up emoji for a shortcode. Returns undefined if not in the canonical mapping.
 * Input may be "cat", ":cat:", or "CAT"; matching is case-insensitive.
 */
export function lookup(shortcode: string): string | undefined {
	const key = normalizeShortcode(shortcode);
	return key ? SHORTCODE_TO_EMOJI[key] : undefined;
}

/** List of shortcodes in :shortcode: form for autocomplete, sorted, consistent with lookup(). */
const AUTOCOMPLETE_SHORTCODES: string[] = Object.keys(SHORTCODE_TO_EMOJI)
	.sort()
	.map((s) => `:${s}:`);

/**
 * Return the list of shortcode strings (e.g. ":cat:") for prefix matching in autocomplete.
 * Same set as used by lookup(); do not mutate the returned array.
 */
export function shortcodeListForAutocomplete(): readonly string[] {
	return AUTOCOMPLETE_SHORTCODES;
}
