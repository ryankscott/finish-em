import { describe, expect, it } from "bun:test";

import type { Task } from "@/server/types";

import {
	dayKey,
	dayWindow,
	formatElapsed,
	partitionDay,
	planCandidates,
} from "./day-plan";

const NOW = new Date("2026-08-20T10:00:00.000Z");

function task(overrides: Partial<Task> & { id: number }): Task {
	return {
		projectId: 1,
		parentTaskId: null,
		title: `task ${overrides.id}`,
		notes: "",
		priority: 4,
		scheduledAt: null,
		dueAt: null,
		dueTimezone: null,
		recurrencePreset: null,
		recurrenceRRule: null,
		status: "open",
		someday: false,
		planOrder: 0,
		startedAt: null,
		completedAt: null,
		deletedAt: null,
		calendarEventUid: null,
		createdAt: NOW.toISOString(),
		updatedAt: NOW.toISOString(),
		...overrides,
	};
}

describe("dayKey and dayWindow", () => {
	it("formats a local calendar day", () => {
		expect(dayKey(new Date(2026, 7, 20, 23, 30))).toBe("2026-08-20");
	});

	it("spans the whole local day", () => {
		const { from, to } = dayWindow(new Date(2026, 7, 20, 13, 0));
		expect(new Date(from).getHours()).toBe(0);
		expect(new Date(to).getHours()).toBe(23);
	});
});

describe("partitionDay", () => {
	it("keeps yesterday's commitments visible instead of dropping them", () => {
		const yesterday = task({
			id: 1,
			scheduledAt: new Date(2026, 7, 19, 9).toISOString(),
			planOrder: 1,
		});
		const todays = task({
			id: 2,
			scheduledAt: new Date(2026, 7, 20, 9).toISOString(),
			planOrder: 1,
		});

		const sections = partitionDay(
			[yesterday, todays],
			[],
			new Date(2026, 7, 20, 10),
		);

		expect(sections.leftover.map((t) => t.id)).toEqual([1]);
		expect(sections.today.map((t) => t.id)).toEqual([2]);
	});

	it("orders today's plan by plan_order, not by deadline", () => {
		const scheduledAt = new Date(2026, 7, 20, 9).toISOString();
		const third = task({ id: 3, scheduledAt, planOrder: 3 });
		const first = task({ id: 1, scheduledAt, planOrder: 1 });
		const second = task({ id: 2, scheduledAt, planOrder: 2 });

		const sections = partitionDay(
			[third, first, second],
			[],
			new Date(2026, 7, 20, 10),
		);

		expect(sections.today.map((t) => t.id)).toEqual([1, 2, 3]);
	});

	it("shows a missed deadline that was never committed to", () => {
		const overdue = task({ id: 9, dueAt: new Date(2026, 7, 18).toISOString() });

		const sections = partitionDay([], [overdue], new Date(2026, 7, 20, 10));

		expect(sections.unplannedOverdue.map((t) => t.id)).toEqual([9]);
	});

	it("does not list an overdue task twice when it is already in the plan", () => {
		const planned = task({
			id: 9,
			scheduledAt: new Date(2026, 7, 20, 9).toISOString(),
			dueAt: new Date(2026, 7, 18).toISOString(),
			planOrder: 1,
		});

		const sections = partitionDay(
			[planned],
			[planned],
			new Date(2026, 7, 20, 10),
		);

		expect(sections.today.map((t) => t.id)).toEqual([9]);
		expect(sections.unplannedOverdue).toEqual([]);
	});
});

describe("formatElapsed", () => {
	it("shows minutes under an hour", () => {
		expect(formatElapsed(23 * 60_000)).toBe("23m");
	});

	it("pads the minutes past an hour", () => {
		expect(formatElapsed(64 * 60_000)).toBe("1h 04m");
	});

	it("floors a fresh start to zero rather than going negative", () => {
		expect(formatElapsed(-5_000)).toBe("0m");
		expect(formatElapsed(500)).toBe("0m");
	});
});

describe("planCandidates", () => {
	it("keeps group order and drops duplicates", () => {
		const a = task({ id: 1 });
		const b = task({ id: 2 });
		const c = task({ id: 3 });

		expect(planCandidates([[a, b], [b, c], [a]]).map((t) => t.id)).toEqual([
			1, 2, 3,
		]);
	});
});

describe("ad-hoc commits", () => {
	it("puts a task committed without a rank at the end of the plan", () => {
		const scheduledAt = new Date(2026, 7, 20, 9).toISOString();
		const ranked = task({ id: 1, scheduledAt, planOrder: 1 });
		const alsoRanked = task({ id: 2, scheduledAt, planOrder: 2 });
		const adHoc = task({ id: 3, scheduledAt, planOrder: 0 });

		const sections = partitionDay(
			[adHoc, ranked, alsoRanked],
			[],
			new Date(2026, 7, 20, 10),
		);

		expect(sections.today.map((t) => t.id)).toEqual([1, 2, 3]);
	});
});
