// URLs and email addresses contain colons and slashes that look like tokens
// ("https:", "p2" inside a path). They are masked out before token parsing and
// restored afterwards.
const URL_PATTERN =
	/(?:[a-z][a-z0-9+.-]*:\/\/|mailto:|www\.)\S+|\b[^\s:@]+@[^\s:@]+\.[a-z]{2,}\b/gi;

// Private-use characters, so they can never collide with real input.
const MASK_OPEN = "\u{E000}";
const MASK_CLOSE = "\u{E001}";

export type UrlMask = {
	masked: string;
	restore: (text: string) => string;
};

/**
 * Replaces URLs and email addresses with opaque placeholders so token parsing
 * never sees their colons. `restore` puts the originals back into any string
 * derived from the masked text.
 */
export function maskUrls(input: string): UrlMask {
	const found: string[] = [];
	const masked = input.replace(URL_PATTERN, (match) => {
		const index = found.push(match) - 1;
		return `${MASK_OPEN}${index}${MASK_CLOSE}`;
	});

	if (found.length === 0) {
		return { masked: input, restore: (text) => text };
	}

	return {
		masked,
		restore: (text) =>
			text.replace(
				new RegExp(`${MASK_OPEN}(\\d+)${MASK_CLOSE}`, "g"),
				(placeholder, index) => found[Number(index)] ?? placeholder,
			),
	};
}

/** Ranges of `input` occupied by URLs or email addresses. */
export function findUrlRanges(input: string): [number, number][] {
	const ranges: [number, number][] = [];
	for (const match of input.matchAll(URL_PATTERN)) {
		if (match.index !== undefined) {
			ranges.push([match.index, match.index + match[0].length]);
		}
	}
	return ranges;
}

type ExtractTokenValueOptions = {
	tokenPrefixes: string[];
	extraStopPattern?: RegExp;
	caseInsensitive?: boolean;
};

export function extractTokenValue(
	input: string,
	startIndex: number,
	options: ExtractTokenValueOptions,
): [string, number] {
	let end = input.length;
	const searchSource = options.caseInsensitive ? input.toLowerCase() : input;

	for (const prefix of options.tokenPrefixes) {
		const searchPrefix = options.caseInsensitive
			? prefix.toLowerCase()
			: prefix;
		let pos = startIndex;
		while (pos < input.length) {
			const idx = searchSource.indexOf(searchPrefix, pos);
			if (idx === -1) {
				break;
			}
			if (idx > 0 && input[idx - 1] !== " ") {
				pos = idx + 1;
				continue;
			}
			if (idx < end) {
				end = idx;
			}
			break;
		}
	}

	const extraStopMatch = options.extraStopPattern
		? input.slice(startIndex).match(options.extraStopPattern)
		: null;
	if (extraStopMatch?.index !== undefined) {
		const extraStopIndex = startIndex + extraStopMatch.index;
		if (extraStopIndex < end) {
			end = extraStopIndex;
		}
	}

	return [input.slice(startIndex, end).trim(), end];
}
