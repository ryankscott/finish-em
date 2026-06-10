import { describe, expect, it } from "bun:test";

import { applyTextEdit } from "../apply-text-edit";

// Test the modal routing logic in isolation by exercising applyTextEdit
// against a modalValues-style record — the same computation useTextInputKeys does.

function applyModalTextEdit(
	input: string,
	keys: {
		backspace?: boolean;
		delete?: boolean;
		leftArrow?: boolean;
		rightArrow?: boolean;
	},
	modalValues: Record<string, string>,
	fieldKey: string,
	cursor: number,
): { modalValues: Record<string, string>; cursor: number } | null {
	const currentValue = modalValues[fieldKey] ?? "";
	const result = applyTextEdit(input, keys, currentValue, cursor);
	if (!result) return null;
	return {
		modalValues: { ...modalValues, [fieldKey]: result.value },
		cursor: result.cursor,
	};
}

describe("useTextInputKeys modal routing", () => {
	it("typing appends to the active modal field value", () => {
		const result = applyModalTextEdit("H", {}, { title: "" }, "title", 0);
		expect(result?.modalValues.title).toBe("H");
		expect(result?.cursor).toBe(1);
	});

	it("typing does not affect other modal field values", () => {
		const result = applyModalTextEdit(
			"x",
			{},
			{ title: "hello", notes: "note" },
			"title",
			5,
		);
		expect(result?.modalValues.title).toBe("hellox");
		expect(result?.modalValues.notes).toBe("note");
	});

	it("backspace removes character before cursor in modal field", () => {
		const result = applyModalTextEdit(
			"",
			{ backspace: true },
			{ title: "abc" },
			"title",
			3,
		);
		expect(result?.modalValues.title).toBe("ab");
		expect(result?.cursor).toBe(2);
	});

	it("left arrow moves cursor left in modal field", () => {
		const result = applyModalTextEdit(
			"",
			{ leftArrow: true },
			{ title: "abc" },
			"title",
			3,
		);
		expect(result?.cursor).toBe(2);
		expect(result?.modalValues.title).toBe("abc");
	});

	it("right arrow moves cursor right in modal field", () => {
		const result = applyModalTextEdit(
			"",
			{ rightArrow: true },
			{ title: "abc" },
			"title",
			1,
		);
		expect(result?.cursor).toBe(2);
	});

	it("writes to the correct field when multiple modal fields exist", () => {
		const values = { title: "task", notes: "", dueAt: "" };
		const result = applyModalTextEdit("2", {}, values, "dueAt", 0);
		expect(result?.modalValues.dueAt).toBe("2");
		expect(result?.modalValues.title).toBe("task");
		expect(result?.modalValues.notes).toBe("");
	});

	it("returns null for no-op key (e.g. no input, no special key)", () => {
		const result = applyModalTextEdit("", {}, { title: "abc" }, "title", 1);
		expect(result).toBeNull();
	});
});
