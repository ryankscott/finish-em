import { expect, test } from "bun:test";
import type { Goal } from "@/server/types";
import { sortGoalsForDisplay, summarizeGoals } from "./goal-summary";

const goal: Goal = {
	id: 1,
	periodType: "weekly",
	periodStart: "2026-10-19",
	title: "First goal",
	done: false,
	createdAt: "",
	updatedAt: "",
};
test("the visible summary advances past completed goals in list order", () => {
	const goals = [
		{ ...goal, done: true },
		{ ...goal, id: 2, title: "Next goal" },
	];
	expect(summarizeGoals(goals, "weekly")).toMatchObject({
		title: "Next goal",
		completed: 1,
		total: 2,
		progress: 50,
	});
	expect(
		summarizeGoals(
			goals.map((g) => ({ ...g, done: true })),
			"weekly",
		).title,
	).toBe("All weekly goals complete");
});
test("empty daily and weekly goals have useful labels and finite progress", () => {
	expect(summarizeGoals([], "daily")).toMatchObject({
		title: "Add your first daily goal",
		progress: 0,
		allComplete: false,
	});
	expect(summarizeGoals([], "weekly").title).toBe("Add your first weekly goal");
});

test("display order puts open goals before done ones and keeps list order", () => {
	const goals = [
		{ ...goal, id: 1, done: true },
		{ ...goal, id: 2 },
		{ ...goal, id: 3, done: true },
		{ ...goal, id: 4 },
	];
	expect(sortGoalsForDisplay(goals).map((g) => g.id)).toEqual([2, 4, 1, 3]);
});
