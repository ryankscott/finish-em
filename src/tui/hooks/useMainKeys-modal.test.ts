import { describe, expect, it } from "bun:test";

import {
	getModalFields,
	TASK_CREATE_FIELDS,
	PROJECT_CREATE_FIELDS,
} from "../modal-field-defs";

// Pure logic tests for modal navigation computed separately from useInput hooks.

function navigateModal(
	fieldIndex: number,
	direction: "next" | "prev",
	mode: "createTaskModal" | "createProjectModal",
): number {
	const fields = getModalFields(mode);
	const count = fields.length;
	if (direction === "next") return (fieldIndex + 1) % count;
	return (fieldIndex - 1 + count) % count;
}

describe("modal field definitions", () => {
	it("TASK_CREATE_FIELDS has title as first field", () => {
		expect(TASK_CREATE_FIELDS[0]?.key).toBe("title");
		expect(TASK_CREATE_FIELDS[0]?.type).toBe("text");
	});

	it("TASK_CREATE_FIELDS has submit as last field", () => {
		const last = TASK_CREATE_FIELDS[TASK_CREATE_FIELDS.length - 1];
		expect(last?.type).toBe("submit");
	});

	it("TASK_CREATE_FIELDS includes enum fields for project, priority, recurrence", () => {
		const enumKeys = TASK_CREATE_FIELDS.filter((f) => f.type === "enum").map((f) => f.key);
		expect(enumKeys).toContain("project");
		expect(enumKeys).toContain("priority");
		expect(enumKeys).toContain("recurrence");
	});

	it("TASK_CREATE_FIELDS includes date fields for dueAt and scheduledAt", () => {
		const dateKeys = TASK_CREATE_FIELDS.filter((f) => f.type === "date").map((f) => f.key);
		expect(dateKeys).toContain("dueAt");
		expect(dateKeys).toContain("scheduledAt");
	});

	it("PROJECT_CREATE_FIELDS has name as first field", () => {
		expect(PROJECT_CREATE_FIELDS[0]?.key).toBe("name");
		expect(PROJECT_CREATE_FIELDS[0]?.type).toBe("text");
	});

	it("PROJECT_CREATE_FIELDS has submit as last field", () => {
		const last = PROJECT_CREATE_FIELDS[PROJECT_CREATE_FIELDS.length - 1];
		expect(last?.type).toBe("submit");
	});

	it("PROJECT_CREATE_FIELDS includes date fields for startAt and endAt", () => {
		const dateKeys = PROJECT_CREATE_FIELDS.filter((f) => f.type === "date").map((f) => f.key);
		expect(dateKeys).toContain("startAt");
		expect(dateKeys).toContain("endAt");
	});
});

describe("modal field navigation", () => {
	it("j/Tab advances to next field in task modal", () => {
		expect(navigateModal(0, "next", "createTaskModal")).toBe(1);
		expect(navigateModal(1, "next", "createTaskModal")).toBe(2);
	});

	it("k/Shift+Tab moves to previous field in task modal", () => {
		expect(navigateModal(2, "prev", "createTaskModal")).toBe(1);
		expect(navigateModal(1, "prev", "createTaskModal")).toBe(0);
	});

	it("j/Tab wraps from last field to first in task modal", () => {
		const lastIndex = TASK_CREATE_FIELDS.length - 1;
		expect(navigateModal(lastIndex, "next", "createTaskModal")).toBe(0);
	});

	it("k/Shift+Tab wraps from first field to last in task modal", () => {
		const lastIndex = TASK_CREATE_FIELDS.length - 1;
		expect(navigateModal(0, "prev", "createTaskModal")).toBe(lastIndex);
	});

	it("j/Tab advances to next field in project modal", () => {
		expect(navigateModal(0, "next", "createProjectModal")).toBe(1);
	});

	it("k/Shift+Tab wraps from first field to last in project modal", () => {
		const lastIndex = PROJECT_CREATE_FIELDS.length - 1;
		expect(navigateModal(0, "prev", "createProjectModal")).toBe(lastIndex);
	});
});
