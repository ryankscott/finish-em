import { describe, expect, it } from "bun:test";

import { applyTextEdit } from "@/tui/App";

const noKeys = {
	backspace: false,
	delete: false,
	leftArrow: false,
	rightArrow: false,
};

describe("applyTextEdit", () => {
	it("inserts a character at the cursor position", () => {
		const result = applyTextEdit("a", noKeys, "", 0);
		expect(result).toEqual({ value: "a", cursor: 1 });
	});

	it("inserts a character in the middle of existing text", () => {
		const result = applyTextEdit("x", noKeys, "abcd", 2);
		expect(result).toEqual({ value: "abxcd", cursor: 3 });
	});

	it("inserts a multi-character paste at the cursor", () => {
		const result = applyTextEdit("hello", noKeys, "ab", 1);
		expect(result).toEqual({ value: "ahellob", cursor: 6 });
	});

	it("handles backspace (key.backspace) removing character before cursor", () => {
		const result = applyTextEdit("", { ...noKeys, backspace: true }, "abc", 2);
		expect(result).toEqual({ value: "ac", cursor: 1 });
	});

	it("handles backspace at end of string", () => {
		const result = applyTextEdit("", { ...noKeys, backspace: true }, "abc", 3);
		expect(result).toEqual({ value: "ab", cursor: 2 });
	});

	it("handles backspace at beginning of string (no-op)", () => {
		const result = applyTextEdit("", { ...noKeys, backspace: true }, "abc", 0);
		expect(result).toEqual({ value: "abc", cursor: 0 });
	});

	it("handles key.delete as backspace (Ink v6 maps physical Backspace to key.delete)", () => {
		const result = applyTextEdit("", { ...noKeys, delete: true }, "abc", 3);
		expect(result).toEqual({ value: "ab", cursor: 2 });
	});

	it("handles key.delete in the middle of text as backspace", () => {
		const result = applyTextEdit("", { ...noKeys, delete: true }, "abc", 2);
		expect(result).toEqual({ value: "ac", cursor: 1 });
	});

	it("handles key.delete at beginning of string (no-op)", () => {
		const result = applyTextEdit("", { ...noKeys, delete: true }, "abc", 0);
		expect(result).toEqual({ value: "abc", cursor: 0 });
	});

	it("moves cursor left", () => {
		const result = applyTextEdit("", { ...noKeys, leftArrow: true }, "abc", 2);
		expect(result).toEqual({ value: "abc", cursor: 1 });
	});

	it("does not move cursor left past beginning", () => {
		const result = applyTextEdit("", { ...noKeys, leftArrow: true }, "abc", 0);
		expect(result).toEqual({ value: "abc", cursor: 0 });
	});

	it("moves cursor right", () => {
		const result = applyTextEdit(
			"",
			{ ...noKeys, rightArrow: true },
			"abc",
			1,
		);
		expect(result).toEqual({ value: "abc", cursor: 2 });
	});

	it("does not move cursor right past end", () => {
		const result = applyTextEdit(
			"",
			{ ...noKeys, rightArrow: true },
			"abc",
			3,
		);
		expect(result).toEqual({ value: "abc", cursor: 3 });
	});

	it("returns null for empty input with no special keys", () => {
		const result = applyTextEdit("", noKeys, "abc", 1);
		expect(result).toBeNull();
	});

	it("clamps cursor to value length when cursor exceeds it", () => {
		const result = applyTextEdit("x", noKeys, "ab", 10);
		expect(result).toEqual({ value: "abx", cursor: 3 });
	});

	it("handles special characters like colons and slashes", () => {
		const result = applyTextEdit(":", noKeys, "due", 3);
		expect(result).toEqual({ value: "due:", cursor: 4 });
	});

	it("handles emoji input", () => {
		const result = applyTextEdit("🎯", noKeys, "goal ", 5);
		expect(result).toEqual({ value: "goal 🎯", cursor: 7 });
	});

	it("handles successive backspaces clearing the whole string", () => {
		let value = "hi";
		let cursor = 2;
		for (let i = 0; i < 2; i++) {
			const result = applyTextEdit(
				"",
				{ ...noKeys, delete: true },
				value,
				cursor,
			);
			if (result) {
				value = result.value;
				cursor = result.cursor;
			}
		}
		expect(value).toBe("");
		expect(cursor).toBe(0);
	});
});
