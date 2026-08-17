import { describe, expect, test } from "bun:test";

import type { Task } from "@/server/types";

import {
	countCompletionsSince,
	countOverdue,
	nyanProgress,
} from "./status-metrics";

function task(dueAt: string | null): Task {
	return { dueAt } as Task;
}

function completedTask(completedAt: string | null): Task {
	return { completedAt } as Task;
}

describe("countOverdue", () => {
	const now = new Date("2026-08-05T12:00:00.000Z");

	test("counts a task due yesterday", () => {
		expect(countOverdue([task("2026-08-04T09:00:00.000Z")], now)).toBe(1);
	});

	test("excludes a task due later today", () => {
		expect(countOverdue([task("2026-08-05T20:00:00.000Z")], now)).toBe(0);
	});

	test("excludes a task due in the future", () => {
		expect(countOverdue([task("2026-08-06T09:00:00.000Z")], now)).toBe(0);
	});

	test("excludes a task with no due date", () => {
		expect(countOverdue([task(null)], now)).toBe(0);
	});
});

describe("countCompletionsSince", () => {
	const startOfDay = new Date("2026-08-05T00:00:00.000Z");

	test("counts a completion exactly at the boundary", () => {
		expect(
			countCompletionsSince(
				[completedTask("2026-08-05T00:00:00.000Z")],
				startOfDay,
			),
		).toBe(1);
	});

	test("excludes a completion before the boundary", () => {
		expect(
			countCompletionsSince(
				[completedTask("2026-08-04T23:59:59.999Z")],
				startOfDay,
			),
		).toBe(0);
	});

	test("counts multiple completions after the boundary", () => {
		expect(
			countCompletionsSince(
				[
					completedTask("2026-08-05T09:00:00.000Z"),
					completedTask("2026-08-05T18:00:00.000Z"),
					completedTask("2026-08-04T09:00:00.000Z"),
				],
				startOfDay,
			),
		).toBe(2);
	});

	test("excludes an open task with no completedAt", () => {
		expect(countCompletionsSince([completedTask(null)], startOfDay)).toBe(0);
	});
});

describe("nyanProgress", () => {
	test("returns a fraction between 0 and 1", () => {
		expect(nyanProgress(3, 10)).toBeCloseTo(0.3);
	});

	test("clamps at 1 when completed exceeds target", () => {
		expect(nyanProgress(15, 10)).toBe(1);
	});

	test("returns 0 for a zero target", () => {
		expect(nyanProgress(5, 0)).toBe(0);
	});

	test("returns 0 for a negative target", () => {
		expect(nyanProgress(5, -3)).toBe(0);
	});

	test("returns 0 for zero completed", () => {
		expect(nyanProgress(0, 10)).toBe(0);
	});
});
