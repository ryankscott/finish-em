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
