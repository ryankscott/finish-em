import type { Goal } from "@/server/types";

export function summarizeGoals(goals: Goal[], periodType: "daily" | "weekly") {
	const next = goals.find((goal) => !goal.done);
	const completed = goals.filter((goal) => goal.done).length;
	const period = periodType === "weekly" ? "weekly" : "daily";
	return {
		title:
			next?.title ??
			(goals.length
				? `All ${period} goals complete`
				: `Add your first ${period} goal`),
		completed,
		total: goals.length,
		progress: goals.length ? (completed / goals.length) * 100 : 0,
		allComplete: goals.length > 0 && !next,
	};
}
