import { useEffect, useState } from "react";

import type { Goal } from "@/server/types";

import { cn } from "../lib/cn";

const ROTATE_MS = 4000;

/**
 * Cycles through a list of goals one at a time, fading between them, so a
 * whole week's worth of goals can live in the width of a single status-bar
 * line instead of wrapping or getting truncated together.
 */
export function WeeklyGoalsTicker({ goals }: { goals: Goal[] }) {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		setIndex(0);
	}, []);

	useEffect(() => {
		if (goals.length < 2) return;
		const id = setInterval(() => {
			setIndex((i) => (i + 1) % goals.length);
		}, ROTATE_MS);
		return () => clearInterval(id);
	}, [goals.length]);

	if (goals.length === 0) return null;

	const goal = goals[index % goals.length];
	if (!goal) return null;

	return (
		<div
			className="hidden min-w-0 max-w-80 shrink-0 items-baseline gap-1 overflow-hidden sm:flex"
			title="Weekly goals"
		>
			<span className="shrink-0 text-[10px] tracking-wide text-muted uppercase">
				This week
			</span>
			<span
				key={goal.id}
				className={cn(
					"animate-goal-fade truncate",
					goal.done && "text-muted line-through",
				)}
			>
				{goal.title}
			</span>
		</div>
	);
}
