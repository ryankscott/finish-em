import { describe, expect, it } from "bun:test";

import { isModalEnumTarget } from "./useSubmitInput";

// Pure logic tests for modal enum/calendar picker return detection.

describe("isModalEnumTarget", () => {
	it("returns true for modal:createTaskModal:priority", () => {
		expect(isModalEnumTarget("modal:createTaskModal:priority")).toBe(true);
	});

	it("returns true for modal:createProjectModal:startAt", () => {
		expect(isModalEnumTarget("modal:createProjectModal:startAt")).toBe(true);
	});

	it("returns false for editPriority (normal task edit)", () => {
		expect(isModalEnumTarget("editPriority")).toBe(false);
	});

	it("returns false for editMoveProject", () => {
		expect(isModalEnumTarget("editMoveProject")).toBe(false);
	});

	it("returns false for null", () => {
		expect(isModalEnumTarget(null)).toBe(false);
	});

	it("returns false for empty string", () => {
		expect(isModalEnumTarget("")).toBe(false);
	});
});

// Test modal submit validation logic independently.

function validateTaskModalSubmit(modalValues: Record<string, string>): {
	valid: boolean;
	error: string | null;
} {
	const title = modalValues.title?.trim();
	if (!title) return { valid: false, error: "Title is required" };
	return { valid: true, error: null };
}

function validateProjectModalSubmit(modalValues: Record<string, string>): {
	valid: boolean;
	error: string | null;
} {
	const name = modalValues.name?.trim();
	if (!name) return { valid: false, error: "Name is required" };
	return { valid: true, error: null };
}

describe("createTaskModal submit validation", () => {
	it("is valid when title is set", () => {
		expect(validateTaskModalSubmit({ title: "Buy milk" }).valid).toBe(true);
	});

	it("is invalid when title is empty", () => {
		const result = validateTaskModalSubmit({ title: "" });
		expect(result.valid).toBe(false);
		expect(result.error).toBe("Title is required");
	});

	it("is invalid when title is whitespace only", () => {
		const result = validateTaskModalSubmit({ title: "   " });
		expect(result.valid).toBe(false);
	});

	it("is valid with title and other fields", () => {
		expect(
			validateTaskModalSubmit({
				title: "Task",
				priority: "2",
				dueAt: "2026-03-15",
			}).valid,
		).toBe(true);
	});
});

describe("createProjectModal submit validation", () => {
	it("is valid when name is set", () => {
		expect(validateProjectModalSubmit({ name: "Roadmap" }).valid).toBe(true);
	});

	it("is invalid when name is empty", () => {
		const result = validateProjectModalSubmit({ name: "" });
		expect(result.valid).toBe(false);
		expect(result.error).toBe("Name is required");
	});

	it("is invalid when name is whitespace only", () => {
		expect(validateProjectModalSubmit({ name: "  " }).valid).toBe(false);
	});
});
