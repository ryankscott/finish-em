import {
	addDays,
	endOfDay,
	format,
	isSameDay,
	parseISO,
	startOfDay,
	startOfWeek,
} from "date-fns";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { Task } from "@/server/types";

import { GoalsPanel } from "../components/GoalsPanel";
import { TaskRow } from "../components/TaskRow";
import { cn } from "../lib/cn";
import { useHotkeyScope } from "../lib/hotkeys";
import { useProjects, useTaskMutations, useTasks } from "../lib/queries";
import { useUi } from "../state/ui";
import { ViewTitle } from "./SimpleViews";

type ViewMode = "day" | "work-week" | "week";

const dateKey = (date: Date) => format(date, "yyyy-MM-dd");

// Mirrors src/tui/UpcomingPanel.tsx (which is Ink-coupled and can't be imported).
function columnStartDate(anchorDate: Date, viewMode: ViewMode): Date {
	if (viewMode === "work-week")
		return startOfWeek(anchorDate, { weekStartsOn: 1 });
	return anchorDate;
}

function daysToShow(viewMode: ViewMode): number {
	if (viewMode === "day") return 1;
	if (viewMode === "work-week") return 5;
	return 7;
}

const nextMode: Record<ViewMode, ViewMode> = {
	day: "work-week",
	"work-week": "week",
	week: "day",
};

export function UpcomingView() {
	const ui = useUi();
	const { data: projects = [] } = useProjects();
	const { completeTask, deleteTask } = useTaskMutations();
	const [anchorDate, setAnchorDate] = useState(() => startOfDay(new Date()));
	const [viewMode, setViewMode] = useState<ViewMode>("work-week");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [goalAddSignal, setGoalAddSignal] = useState(0);

	const goalPeriodType = viewMode === "day" ? "daily" : "weekly";
	const goalPeriodStart =
		viewMode === "day"
			? dateKey(anchorDate)
			: dateKey(startOfWeek(anchorDate, { weekStartsOn: 1 }));

	const colStart = columnStartDate(anchorDate, viewMode);
	const days = daysToShow(viewMode);
	const rangeEnd = addDays(colStart, days - 1);

	const { data: rangeTasks = [] } = useTasks({
		status: "open",
		from: startOfDay(colStart).toISOString(),
		to: endOfDay(rangeEnd).toISOString(),
	});
	const { data: pastTasks = [] } = useTasks({
		status: "open",
		to: startOfDay(colStart).toISOString(),
	});

	const projectById = useMemo(
		() => new Map(projects.map((p) => [p.id, p])),
		[projects],
	);

	const columns = useMemo(() => {
		const overdue = pastTasks.filter(
			(t) => t.dueAt && parseISO(t.dueAt) < startOfDay(colStart),
		);
		const out: Array<{
			key: string;
			label: string;
			tasks: Task[];
			isToday: boolean;
		}> = [{ key: "overdue", label: "Overdue", tasks: overdue, isToday: false }];
		for (let i = 0; i < days; i++) {
			const date = addDays(colStart, i);
			out.push({
				key: format(date, "yyyy-MM-dd"),
				label: format(date, "EEE d MMM"),
				tasks: rangeTasks.filter(
					(t) => t.dueAt && isSameDay(parseISO(t.dueAt), date),
				),
				isToday: isSameDay(date, new Date()),
			});
		}
		return out;
	}, [pastTasks, rangeTasks, colStart, days]);

	const flatTasks = useMemo(
		() =>
			columns.flatMap((col, ci) =>
				col.tasks.map((task, ri) => ({ task, ci, ri })),
			),
		[columns],
	);

	const clampedIndex = Math.min(selectedIndex, Math.max(0, flatTasks.length - 1));
	const selectedFlat = flatTasks[clampedIndex];
	const selected = selectedFlat?.task;

	useHotkeyScope({
		j: () => setSelectedIndex((i) => Math.min(i + 1, Math.max(0, flatTasks.length - 1))),
		arrowdown: () => setSelectedIndex((i) => Math.min(i + 1, Math.max(0, flatTasks.length - 1))),
		k: () => setSelectedIndex((i) => Math.max(i - 1, 0)),
		arrowup: () => setSelectedIndex((i) => Math.max(i - 1, 0)),
		"[": () => setAnchorDate((d) => addDays(d, -7)),
		"]": () => setAnchorDate((d) => addDays(d, 7)),
		t: () => {
			setAnchorDate(startOfDay(new Date()));
			setSelectedIndex(0);
		},
		v: () => setViewMode((mode) => nextMode[mode]),
		g: () => setGoalAddSignal((n) => n + 1),
		x: () => {
			if (!selected) return;
			completeTask.mutate(selected, {
				onSuccess: () => toast.success("Task completed"),
				onError: (err) => toast.error(err.message),
			});
		},
		d: () => {
			if (!selected) return;
			deleteTask.mutate(selected, {
				onSuccess: () => toast.success("Task deleted"),
				onError: (err) => toast.error(err.message),
			});
		},
		e: () => selected && ui.openTaskEditor(selected),
		enter: () => selected && ui.openTaskEditor(selected),
	});

	return (
		<>
			<ViewTitle
				title={`Upcoming · ${format(colStart, "d MMM")} - ${format(rangeEnd, "d MMM")}`}
			/>
			<div className="flex min-h-0 flex-1 flex-col">
				<div className="shrink-0 border-b border-border">
					<GoalsPanel
						periodType={goalPeriodType}
						periodStart={goalPeriodStart}
						addSignal={goalAddSignal}
					/>
				</div>
				<ScrollArea className="flex-1">
					<div className="flex flex-col gap-2 p-3">
						{columns.map((col, ci) => (
							<div
								key={col.key}
								className={cn(
									"flex flex-col rounded-lg border border-border/60 bg-surface/40",
									ci === selectedFlat?.ci && "border-accent/50",
								)}
							>
								<div
									className={cn(
										"border-b border-border/60 px-3 py-2 text-xs font-semibold",
										col.key === "overdue"
											? "text-p1"
											: col.isToday
												? "text-accent"
												: "text-muted",
									)}
								>
									{col.label}
									<span className="ml-2 font-normal text-muted">
										{col.tasks.length}
									</span>
								</div>
								<div className="flex flex-col gap-0.5 p-1.5">
									{col.tasks.length === 0 ? (
										<p className="px-2 py-1.5 text-xs text-muted/50">No tasks</p>
									) : (
										col.tasks.map((task, ri) => (
											<TaskRow
												key={task.id}
												task={task}
												project={projectById.get(task.projectId)}
												selected={ci === selectedFlat?.ci && ri === selectedFlat?.ri}
												depth={0}
												hasSubtasks={false}
												expanded={false}
												showProject
											/>
										))
									)}
								</div>
							</div>
						))}
					</div>
				</ScrollArea>
			</div>
		</>
	);
}
