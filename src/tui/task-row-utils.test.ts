import { describe, expect, it } from "bun:test";
import type { Task } from "../server/types";
import { buildTaskRows } from "./task-row-utils";

const makeTask = (overrides: Partial<Task> & { id: number }): Task => ({
	title: `Task ${overrides.id}`,
	status: "open",
	priority: 4,
	projectId: 1,
	parentTaskId: null,
	notes: null,
	scheduledAt: null,
	dueAt: null,
	dueTimezone: null,
	recurrencePreset: null,
	recurrenceRRule: null,
	completedAt: null,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	...overrides,
});

describe("buildTaskRows", () => {
	it("returns empty array for empty input", () => {
		expect(buildTaskRows([])).toEqual([]);
	});

	it("returns root tasks with depth 0", () => {
		const tasks = [makeTask({ id: 1 }), makeTask({ id: 2 })];
		const rows = buildTaskRows(tasks);
		expect(rows).toHaveLength(2);
		expect(rows[0].depth).toBe(0);
		expect(rows[1].depth).toBe(0);
	});

	it("nests visible children after their parent with depth 1", () => {
		const parent = makeTask({ id: 1 });
		const child = makeTask({ id: 2, parentTaskId: 1 });
		const rows = buildTaskRows([parent, child]);
		expect(rows).toHaveLength(2);
		expect(rows[0].task.id).toBe(1);
		expect(rows[0].depth).toBe(0);
		expect(rows[1].task.id).toBe(2);
		expect(rows[1].depth).toBe(1);
		expect(rows[1].parentTitle).toBe("Task 1");
	});

	it("treats orphan subtasks (parent not in list) as roots", () => {
		const child = makeTask({ id: 2, parentTaskId: 99 });
		const rows = buildTaskRows([child]);
		expect(rows).toHaveLength(1);
		expect(rows[0].depth).toBe(0);
	});

	it("preserves the order of roots and nests children in insertion order", () => {
		const root1 = makeTask({ id: 1 });
		const root2 = makeTask({ id: 3 });
		const child1 = makeTask({ id: 2, parentTaskId: 1 });
		const rows = buildTaskRows([root1, root2, child1]);
		// root1, child1 (nested under root1), root2
		expect(rows.map((r) => r.task.id)).toEqual([1, 2, 3]);
	});
});
