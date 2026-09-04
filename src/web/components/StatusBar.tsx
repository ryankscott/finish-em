import { Link } from "@tanstack/react-router";
import { startOfDay, startOfWeek } from "@/lib/datetime";
import { cn } from "../lib/cn";
import { useTasks } from "../lib/queries";
import {
	countCompletionsSince,
	countOverdue,
	nyanProgress,
} from "../lib/status-metrics";
import { useUi } from "../state/ui";
import { NyanCat } from "./NyanCat";

export function StatusBar() {
	const ui = useUi();
	const now = new Date();
	const dayStart = startOfDay(now);
	const weekStart = startOfWeek(now);

	const { data: openPast = [] } = useTasks({
		status: "open",
		to: dayStart.toISOString(),
	});
	// completedAt isn't a due-date field, so it can't go through the tasks
	// endpoint's from/to filter (that filters due_at); all completed tasks are
	// fetched and the date range applied client-side, same as LogbookView does.
	const { data: completedTasks = [] } = useTasks({ status: "completed" });
	const overdue = countOverdue(openPast, now);
	const completedToday = countCompletionsSince(completedTasks, dayStart);
	const completedWeek = countCompletionsSince(completedTasks, weekStart);
	const progress = nyanProgress(completedToday, ui.dailyTarget);
	// The cat stops at the goal, so the counter stops there too: showing 13/10
	// next to a cat parked at the end of its track reads as a stuck cat.
	const shownToday = Math.min(completedToday, ui.dailyTarget);

	return (
		<output
			aria-label={`${overdue} overdue, ${completedToday} completed today, ${completedWeek} completed this week, ${completedToday} of ${ui.dailyTarget} toward today's goal`}
			className="flex h-8 shrink-0 items-center gap-4 px-4 text-xs text-muted"
		>
			<Link
				to="/overdue"
				className={cn(
					"shrink-0 hover:text-foreground",
					overdue > 0 && "text-p1",
				)}
			>
				{overdue} overdue
			</Link>
			<span className="shrink-0">{completedToday} today</span>
			<span className="shrink-0">{completedWeek} this week</span>
			<div className="flex min-w-0 flex-1 items-center justify-end gap-2">
				<div className="min-w-0 max-w-64 flex-1">
					<NyanCat progress={progress} />
				</div>
				<button
					type="button"
					onClick={() => {
						const next = window.prompt(
							"Daily task goal",
							String(ui.dailyTarget),
						);
						if (next === null) return;
						const parsed = Number.parseInt(next, 10);
						if (!Number.isNaN(parsed)) ui.setDailyTarget(parsed);
					}}
					className="shrink-0 tabular-nums hover:text-foreground"
					title="Set daily goal"
				>
					{shownToday}/{ui.dailyTarget}
				</button>
			</div>
		</output>
	);
}
