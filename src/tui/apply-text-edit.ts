type TextEditKeys = {
	backspace: boolean;
	delete: boolean;
	leftArrow: boolean;
	rightArrow: boolean;
};

type TextEditResult = {
	value: string;
	cursor: number;
};

/**
 * Pure function that applies a single text edit operation to an input value.
 * Returns the new value and cursor position, or null if there is nothing to do.
 */
export function applyTextEdit(
	input: string,
	key: TextEditKeys,
	value: string,
	cursorOffset: number,
): TextEditResult | null {
	const len = value.length;
	const cur = Math.min(cursorOffset, len);

	if (key.leftArrow) {
		return { value, cursor: Math.max(0, cur - 1) };
	}
	if (key.rightArrow) {
		return { value, cursor: Math.min(len, cur + 1) };
	}
	if (key.backspace || key.delete) {
		if (cur <= 0) return { value, cursor: cur };
		const next = value.slice(0, cur - 1) + value.slice(cur);
		return { value: next, cursor: cur - 1 };
	}
	if (input.length > 0) {
		const next = value.slice(0, cur) + input + value.slice(cur);
		return { value: next, cursor: cur + input.length };
	}
	return null;
}
