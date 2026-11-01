import { summarizeGoals } from "../lib/goal-summary";
import { useGoals } from "../lib/queries";
import { GoalsPanel } from "./GoalsPanel";

/** Desktop Planning keeps every goal on screen next to the tasks. */
export function GoalsRail({
	periodType,
	periodStart,
	addSignal = 0,
}: {
	periodType: "daily" | "weekly";
	periodStart: string;
	addSignal?: number;
}) {
	const { data: goals = [] } = useGoals({ periodType, periodStart });
	const summary = summarizeGoals(goals, periodType);
	return (
		<aside
			aria-label={
				periodType === "weekly" ? "This week’s goals" : "Today’s goals"
			}
			className="w-72 shrink-0 self-start rounded-xl border border-border bg-surface-raised"
		>
			<header className="flex flex-col gap-2 px-4 pt-3.5">
				<div className="flex items-baseline justify-between gap-2">
					<h2 className="text-sm font-medium">
						{periodType === "weekly" ? "This week’s goals" : "Today’s goals"}
					</h2>
					<span className="text-xs text-muted tabular-nums">
						{summary.completed} of {summary.total}
					</span>
				</div>
				<span
					className="block h-1 overflow-hidden rounded-full bg-border"
					aria-hidden="true"
				>
					<span
						className="block h-full rounded-full bg-accent"
						style={{ width: `${summary.progress}%` }}
					/>
				</span>
			</header>
			<GoalsPanel
				key={`${periodType}:${periodStart}`}
				periodType={periodType}
				periodStart={periodStart}
				addSignal={addSignal}
				showHeading={false}
				className="px-4 pt-1 pb-4"
			/>
		</aside>
	);
}
