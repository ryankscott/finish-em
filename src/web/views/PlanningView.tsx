import {
	addDays,
	endOfDay,
	format,
	isSameDay,
	parseISO,
	startOfDay,
	startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, Columns3, Rows3 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { CalendarEvent, Task } from "@/server/types";

import { EventRow } from "../components/EventRow";
import { GoalsPanel } from "../components/GoalsPanel";
import { TaskRow } from "../components/TaskRow";
import { cn } from "../lib/cn";
import { useHotkeyScope } from "../lib/hotkeys";
import {
	useCalendarEvents,
	useProjects,
	useTaskMutations,
	useTasks,
} from "../lib/queries";
import { useAddTodoFromEvent } from "../lib/use-add-todo-from-event";
import { useIsMobile } from "../lib/use-is-mobile";
import { useUi } from "../state/ui";
import { ViewTitle } from "./SimpleViews";

type ViewMode = "day" | "work-week" | "week";
type Layout = "vertical" | "horizontal";

const dateKey = (date: Date) => format(date, "yyyy-MM-dd");

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

/** Shown on the mobile view-mode button, which cycles through the same order. */
const VIEW_MODE_LABELS: Record<ViewMode, string> = {
	day: "Day",
	"work-week": "Work week",
	week: "Week",
};

export function PlanningView() {
	const ui = useUi();
	const isMobile = useIsMobile();
	const { data: projects = [] } = useProjects();
	const { completeTask, deleteTask } = useTaskMutations();
	const { onAddTodo, addingUid } = useAddTodoFromEvent();
	const [anchorDate, setAnchorDate] = useState(() => startOfDay(new Date()));
	const [viewMode, setViewMode] = useState<ViewMode>("work-week");
	const [layout, setLayout] = useState<Layout>("vertical");
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
	const { data: events = [] } = useCalendarEvents({
		from: startOfDay(colStart).toISOString(),
		to: endOfDay(rangeEnd).toISOString(),
	});
	const inboxProject = projects.find((p) => p.isInbox);
	const { data: inboxTasks = [] } = useTasks(
		{ status: "open", projectId: inboxProject?.id },
		inboxProject != null,
	);

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
			events: CalendarEvent[];
			isToday: boolean;
		}> = [
			{
				key: "inbox",
				// Unscheduled captures needing triage; dated inbox tasks already
				// show in their day / overdue column, so exclude them here.
				label: "Inbox",
				tasks: inboxTasks.filter((t) => t.dueAt === null),
				events: [],
				isToday: false,
			},
			{
				key: "overdue",
				label: "Overdue",
				tasks: overdue,
				events: [],
				isToday: false,
			},
		];
		for (let i = 0; i < days; i++) {
			const date = addDays(colStart, i);
			out.push({
				key: format(date, "yyyy-MM-dd"),
				label: format(date, "EEE d MMM"),
				tasks: rangeTasks.filter(
					(t) => t.dueAt && isSameDay(parseISO(t.dueAt), date),
				),
				events: events
					.filter((e) => isSameDay(parseISO(e.startAt), date))
					.sort((a, b) => {
						if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
						return a.startAt.localeCompare(b.startAt);
					}),
				isToday: isSameDay(date, new Date()),
			});
		}
		return out;
	}, [inboxTasks, pastTasks, rangeTasks, events, colStart, days]);

	const flatTasks = useMemo(
		() =>
			columns.flatMap((col, ci) =>
				col.tasks.map((task, ri) => ({ task, ci, ri })),
			),
		[columns],
	);

	const clampedIndex = Math.min(
		selectedIndex,
		Math.max(0, flatTasks.length - 1),
	);
	const selectedFlat = flatTasks[clampedIndex];
	const selected = selectedFlat?.task;

	useHotkeyScope({
		j: () =>
			setSelectedIndex((i) =>
				Math.min(i + 1, Math.max(0, flatTasks.length - 1)),
			),
		arrowdown: () =>
			setSelectedIndex((i) =>
				Math.min(i + 1, Math.max(0, flatTasks.length - 1)),
			),
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
				title={`Planning · ${format(colStart, "d MMM")} - ${format(rangeEnd, "d MMM")}`}
			/>
			<div className="flex min-h-0 flex-1 flex-col">
				<div className="shrink-0 border-b border-border">
					<GoalsPanel
						periodType={goalPeriodType}
						periodStart={goalPeriodStart}
						addSignal={goalAddSignal}
					/>
				</div>
				<div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
					{/* Week paging, "today", and the day/work-week/week toggle were all
					    hotkey-only ([ ] t v), which left the Planning view stuck on the
					    current week with no way to change range on a phone. */}
					{isMobile ? (
						<div className="flex min-w-0 flex-1 items-center gap-1">
							<button
								type="button"
								aria-label="Previous week"
								onClick={() => setAnchorDate((d) => addDays(d, -7))}
								className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted"
							>
								<ChevronLeft className="h-4 w-4" />
							</button>
							<button
								type="button"
								onClick={() => {
									setAnchorDate(startOfDay(new Date()));
									setSelectedIndex(0);
								}}
								className="h-9 shrink-0 rounded-md border border-border px-3 text-xs text-muted"
							>
								Today
							</button>
							<button
								type="button"
								aria-label="Next week"
								onClick={() => setAnchorDate((d) => addDays(d, 7))}
								className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted"
							>
								<ChevronRight className="h-4 w-4" />
							</button>
							<button
								type="button"
								onClick={() => setViewMode((mode) => nextMode[mode])}
								className="ml-1 h-9 min-w-0 flex-1 truncate rounded-md border border-border px-2 text-xs text-muted"
							>
								{VIEW_MODE_LABELS[viewMode]}
							</button>
						</div>
					) : null}
					<div
						className={cn(
							"flex items-center rounded-md border border-border p-0.5",
							!isMobile && "ml-auto",
						)}
					>
						<button
							type="button"
							onClick={() => setLayout("vertical")}
							aria-label="Stack columns vertically"
							title="Stack columns vertically"
							className={cn(
								"flex items-center gap-1 rounded px-2 py-1",
								layout === "vertical"
									? "bg-accent/15 text-accent"
									: "text-muted hover:text-foreground",
							)}
						>
							<Rows3 className="h-3.5 w-3.5" />
						</button>
						<button
							type="button"
							onClick={() => setLayout("horizontal")}
							aria-label="Arrange columns horizontally"
							title="Arrange columns horizontally"
							className={cn(
								"flex items-center gap-1 rounded px-2 py-1",
								layout === "horizontal"
									? "bg-accent/15 text-accent"
									: "text-muted hover:text-foreground",
							)}
						>
							<Columns3 className="h-3.5 w-3.5" />
						</button>
					</div>
				</div>
				<ScrollArea className="flex-1" horizontal={layout === "horizontal"}>
					<div
						className={cn(
							"w-full min-w-0 gap-2 p-3",
							layout === "vertical"
								? "flex flex-col"
								: "flex flex-row items-start overflow-x-auto",
						)}
					>
						{columns.map((col, ci) => {
							const itemCount = col.tasks.length + col.events.length;
							return (
								<div
									key={col.key}
									className={cn(
										"flex min-w-0 flex-col rounded-lg border border-border/60 bg-surface/40",
										layout === "horizontal" && "w-80 shrink-0",
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
											{itemCount}
										</span>
									</div>
									<div className="flex min-w-0 flex-col gap-0.5 p-1.5">
										{col.events.length > 0 ? (
											<div className="flex min-w-0 flex-col gap-1.5 px-1 pb-1.5">
												{col.events.map((event) => (
													<EventRow
														key={`${event.uid}-${event.recurrenceId}`}
														event={event}
														onAddTodo={onAddTodo}
														adding={addingUid === event.uid}
													/>
												))}
											</div>
										) : null}
										{itemCount === 0 ? (
											<p className="px-2 py-1.5 text-xs text-muted/50">
												No tasks
											</p>
										) : (
											col.tasks.map((task, ri) => (
												<TaskRow
													key={task.id}
													task={task}
													project={projectById.get(task.projectId)}
													selected={
														ci === selectedFlat?.ci && ri === selectedFlat?.ri
													}
													depth={0}
													hasSubtasks={false}
													expanded={false}
													showProject
													onOpen={() => ui.openTaskEditor(task)}
												/>
											))
										)}
									</div>
								</div>
							);
						})}
					</div>
				</ScrollArea>
			</div>
		</>
	);
}
