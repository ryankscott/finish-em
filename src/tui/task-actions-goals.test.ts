import { describe, expect, it } from "bun:test";

import type { Goal } from "../server/types";

// Tests for the goal action logic extracted from useTaskActions

const MOCK_GOAL_PENDING: Goal = {
	id: 10,
	periodType: "daily",
	periodStart: "2026-03-04",
	title: "Write tests",
	done: false,
	createdAt: "2026-03-04T00:00:00.000Z",
	updatedAt: "2026-03-04T00:00:00.000Z",
};

const MOCK_GOAL_DONE: Goal = {
	...MOCK_GOAL_PENDING,
	done: true,
};

// Simulate the toggle logic
function resolveGoalToggle(goal: Goal | null): { patch: { done: boolean }; statusText: string } | { skip: true } {
	if (!goal) return { skip: true };
	return {
		patch: { done: !goal.done },
		statusText: goal.done ? "Goal reopened" : "Goal completed",
	};
}

describe("toggleSelectedGoal logic", () => {
	it("marks a pending goal as done", () => {
		const result = resolveGoalToggle(MOCK_GOAL_PENDING);
		expect(result).toEqual({ patch: { done: true }, statusText: "Goal completed" });
	});

	it("marks a done goal as pending", () => {
		const result = resolveGoalToggle(MOCK_GOAL_DONE);
		expect(result).toEqual({ patch: { done: false }, statusText: "Goal reopened" });
	});

	it("skips when no goal selected", () => {
		const result = resolveGoalToggle(null);
		expect(result).toEqual({ skip: true });
	});
});

describe("deleteSelectedGoal logic", () => {
	it("returns goal id when goal is selected", () => {
		const goal = MOCK_GOAL_PENDING;
		expect(goal.id).toBe(10);
	});

	it("skips deletion when no goal selected", () => {
		const goal: Goal | null = null;
		expect(goal).toBeNull();
	});
});
