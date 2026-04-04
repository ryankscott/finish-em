import { describe, expect, it } from "bun:test";

import { TASK_CREATE_FIELDS } from "./modal-field-defs";

// Structural tests for CreateTaskModal field definitions.
// Rendering tests would require a full Ink render environment; field definition
// correctness is verified here as the pure logic layer.

describe("TASK_CREATE_FIELDS structure", () => {
	it("contains exactly 9 fields (8 data fields + submit)", () => {
		expect(TASK_CREATE_FIELDS).toHaveLength(9);
	});

	it("first field is title (text)", () => {
		expect(TASK_CREATE_FIELDS[0]).toMatchObject({ key: "title", type: "text" });
	});

	it("last field is submit", () => {
		expect(TASK_CREATE_FIELDS[TASK_CREATE_FIELDS.length - 1]).toMatchObject({
			type: "submit",
			label: "Create Task",
		});
	});

	it("all field keys are unique", () => {
		const keys = TASK_CREATE_FIELDS.map((f) => f.key);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it("date fields have hints", () => {
		const dateFields = TASK_CREATE_FIELDS.filter((f) => f.type === "date");
		for (const field of dateFields) {
			expect(field.hint).toBeTruthy();
		}
	});

	it("enum fields cover project, priority, recurrence", () => {
		const enumKeys = TASK_CREATE_FIELDS.filter((f) => f.type === "enum").map((f) => f.key);
		expect(enumKeys).toContain("project");
		expect(enumKeys).toContain("priority");
		expect(enumKeys).toContain("recurrence");
	});

	it("includes blocked reason as a text field", () => {
		expect(
			TASK_CREATE_FIELDS.some(
				(field) => field.key === "blockedReason" && field.type === "text",
			),
		).toBe(true);
	});
});

describe("modal field active/inactive rendering logic", () => {
	it("active field index 0 corresponds to title", () => {
		expect(TASK_CREATE_FIELDS[0]?.key).toBe("title");
	});

	it("submit row is the last index", () => {
		const submitIndex = TASK_CREATE_FIELDS.findIndex((f) => f.type === "submit");
		expect(submitIndex).toBe(TASK_CREATE_FIELDS.length - 1);
	});

	it("validationError presence is a separate concern from field list", () => {
		// Modal renders validationError independently from the field list
		const nonSubmitFields = TASK_CREATE_FIELDS.filter((f) => f.type !== "submit");
		expect(nonSubmitFields.length).toBeGreaterThan(0);
	});
});
