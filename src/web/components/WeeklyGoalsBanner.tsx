import { format } from "date-fns";

import { startOfWeek } from "@/lib/datetime";
import { cn } from "../lib/cn";
import { useGoals } from "../lib/queries";

/**
 * Shows the whole week's goals at once in a tinted banner across the very top
 * of the app, above the search header. This replaces the status-bar ticker,
 * which could only show one goal at a time at the bottom of the window.
 */
export function WeeklyGoalsBanner() {
	const weekStart = startOfWeek(new Date());
	const { data: goals = [] } = useGoals({
		periodType: "weekly",
		periodStart: format(weekStart, "yyyy-MM-dd"),
	});

	if (goals.length === 0) return null;

	const done = goals.filter((g) => g.done).length;

	return (
		<output
			aria-label={`Weekly goals: ${done} of ${goals.length} done`}
			className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-border border-b bg-surface-raised px-4 py-2 text-sm pt-[max(0.5rem,env(safe-area-inset-top))]"
		>
			<span className="shrink-0 font-semibold text-[10px] text-muted uppercase tracking-wider">
				This week
			</span>
			{goals.map((goal) => (
				<span
					key={goal.id}
					className={cn(
						"min-w-0 truncate rounded bg-surface px-2 py-0.5 font-medium text-foreground",
						goal.done && "text-muted line-through",
					)}
				>
					{goal.title}
				</span>
			))}
			<span className="ml-auto shrink-0 text-muted text-xs tabular-nums">
				{done}/{goals.length}
			</span>
		</output>
	);
}
