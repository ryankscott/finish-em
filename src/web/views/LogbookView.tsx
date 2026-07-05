import { startOfMonth, startOfWeek } from "date-fns";
import { useMemo, useState } from "react";

import { TaskListView } from "../components/TaskListView";
import {
	dayKeyInZone,
	formatDayLabel,
	groupCompletedTasksByDate,
} from "../lib/logbook-helpers";
import { useGoals, useSettings, useTasks } from "../lib/queries";
import { ViewTitle } from "./SimpleViews";

type RangeMode = "week" | "month";

function dateKey(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

export function LogbookView() {
	const [mode, setMode] = useState<RangeMode>("week");
	const { data: settings } = useSettings();
	const timeZone =
		settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

	const { data: completed = [] } = useTasks({ status: "completed" });

	const now = new Date();
	const rangeStart = useMemo(
		() =>
			mode === "week"
				? startOfWeek(now, { weekStartsOn: 1 })
				: startOfMonth(now),
		[mode, now],
	);
	const startKey = dayKeyInZone(rangeStart.toISOString(), timeZone);
	const todayKey = dayKeyInZone(now.toISOString(), timeZone);

	const groups = useMemo(() => {
		const inRange = completed.filter((task) => {
			const stamp = task.completedAt ?? task.updatedAt;
			return dayKeyInZone(stamp, timeZone) >= startKey;
		});
		return groupCompletedTasksByDate(inRange, timeZone);
	}, [completed, timeZone, startKey]);

	const total = groups.reduce((sum, g) => sum + g.tasks.length, 0);

	// Weekly goal summary for the current week.
	const weekStartKey = dateKey(startOfWeek(now, { weekStartsOn: 1 }));
	const { data: weekGoals = [] } = useGoals({
		periodType: "weekly",
		periodStart: weekStartKey,
	});
	const goalsDone = weekGoals.filter((g) => g.done).length;

	return (
		<>
			<ViewTitle title="Logbook" count={total} />
			<div className="flex flex-col gap-4 px-4 py-3">
				<div className="flex items-center gap-2">
					{(["week", "month"] as const).map((m) => (
						<button
							key={m}
							type="button"
							onClick={() => setMode(m)}
							className={
								mode === m
									? "rounded-md bg-accent px-3 py-1 text-xs font-medium text-background"
									: "rounded-md border border-border px-3 py-1 text-xs text-muted hover:bg-surface"
							}
						>
							{m === "week" ? "This week" : "This month"}
						</button>
					))}
					{weekGoals.length > 0 ? (
						<span className="ml-auto text-xs text-muted">
							Weekly goals: {goalsDone}/{weekGoals.length} done
						</span>
					) : null}
				</div>

				{groups.length === 0 ? (
					<p className="text-sm text-muted">
						Nothing completed{" "}
						{mode === "week" ? "this week" : "this month"} yet.
					</p>
				) : (
					groups.map((group) => (
						<div key={group.dayKey} className="flex flex-col gap-1">
							<h2 className="text-xs font-semibold tracking-wide text-muted uppercase">
								{formatDayLabel(group.dayKey, todayKey)}
								<span className="ml-2 font-normal normal-case">
									{group.tasks.length}
								</span>
							</h2>
							<TaskListView
								tasks={group.tasks}
								emptyMessage=""
								showProject={true}
							/>
						</div>
					))
				)}
			</div>
		</>
	);
}
