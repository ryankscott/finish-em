import { Link } from "@tanstack/react-router";
import {
	addDays,
	endOfDay,
	format,
	isSameDay,
	isToday as isTodayFn,
	parseISO,
	startOfDay,
	startOfWeek,
} from "date-fns";
import {
	CalendarClock,
	ChevronLeft,
	ChevronRight,
	Columns3,
	RefreshCw,
	Rows3,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { CalendarEvent, Task } from "@/server/types";

import { EventRow } from "../components/EventRow";
import { TaskRow } from "../components/TaskRow";
import { cn } from "../lib/cn";
import {
	useCalendarEvents,
	useCalendarMutations,
	useProjects,
	useSettings,
	useTasks,
} from "../lib/queries";
import { useAddTodoFromEvent } from "../lib/use-add-todo-from-event";
import { ViewTitle } from "./SimpleViews";

type ViewMode = "day" | "work-week" | "week";
type Layout = "vertical" | "horizontal";

const VIEW_MODES: Array<{ mode: ViewMode; label: string }> = [
	{ mode: "day", label: "Day" },
	{ mode: "work-week", label: "Work week" },
	{ mode: "week", label: "Week" },
];

function rangeStartDate(anchorDate: Date, viewMode: ViewMode): Date {
	if (viewMode === "day") return anchorDate;
	return startOfWeek(anchorDate, { weekStartsOn: 1 });
}

function daysToShow(viewMode: ViewMode): number {
	if (viewMode === "day") return 1;
	if (viewMode === "work-week") return 5;
	return 7;
}

export function CalendarView() {
	const { data: settings } = useSettings();
	const { data: projects = [] } = useProjects();
	const { refreshCalendar } = useCalendarMutations();
	const { onAddTodo, addingUid } = useAddTodoFromEvent();

	const [anchorDate, setAnchorDate] = useState(() => startOfDay(new Date()));
	const [viewMode, setViewMode] = useState<ViewMode>("day");
	const [layout, setLayout] = useState<Layout>("vertical");

	const colStart = rangeStartDate(anchorDate, viewMode);
	const days = daysToShow(viewMode);
	const rangeEnd = addDays(colStart, days - 1);

	const { data: events = [] } = useCalendarEvents({
		from: startOfDay(colStart).toISOString(),
		to: endOfDay(rangeEnd).toISOString(),
	});
	const { data: tasks = [] } = useTasks({
		status: "open",
		from: startOfDay(colStart).toISOString(),
		to: endOfDay(rangeEnd).toISOString(),
	});

	const projectById = useMemo(
		() => new Map(projects.map((p) => [p.id, p])),
		[projects],
	);

	const columns = useMemo(() => {
		const out: Array<{
			key: string;
			date: Date;
			label: string;
			tasks: Task[];
			events: CalendarEvent[];
			isToday: boolean;
		}> = [];
		for (let i = 0; i < days; i++) {
			const date = addDays(colStart, i);
			out.push({
				key: format(date, "yyyy-MM-dd"),
				date,
				label: format(date, days === 1 ? "EEEE" : "EEE d MMM"),
				tasks: tasks.filter(
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
	}, [tasks, events, colStart, days]);

	const isEmpty = columns.every(
		(col) => col.events.length === 0 && col.tasks.length === 0,
	);
	const selectedIsToday = isTodayFn(anchorDate);
	const hasUrl = Boolean(settings?.calendarIcsUrl);

	const goToRange = (delta: number) =>
		setAnchorDate((d) => startOfDay(addDays(d, delta * days)));
	const goToToday = () => setAnchorDate(startOfDay(new Date()));

	const onRefresh = () => {
		refreshCalendar.mutate(undefined, {
			onSuccess: (r) => toast.success(`Calendar refreshed (${r.count} events)`),
			onError: (err) => toast.error(err.message),
		});
	};

	return (
		<>
			<ViewTitle
				title={
					days === 1
						? "Calendar"
						: `Calendar · ${format(colStart, "d MMM")} - ${format(rangeEnd, "d MMM")}`
				}
			/>

			{/* Range switcher */}
			<div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
				<button
					type="button"
					onClick={() => goToRange(-1)}
					aria-label="Previous"
					className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-muted hover:bg-surface hover:text-foreground md:h-8 md:w-8"
				>
					<ChevronLeft className="h-4 w-4" />
				</button>
				<button
					type="button"
					onClick={() => goToRange(1)}
					aria-label="Next"
					className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-muted hover:bg-surface hover:text-foreground md:h-8 md:w-8"
				>
					<ChevronRight className="h-4 w-4" />
				</button>
				<div className="ml-1 flex min-w-0 flex-col">
					{days === 1 ? (
						<>
							<span className="truncate text-base font-semibold leading-tight text-foreground">
								{format(anchorDate, "EEEE")}
							</span>
							<span className="truncate text-xs text-muted">
								{format(anchorDate, "MMMM d, yyyy")}
							</span>
						</>
					) : (
						<span className="truncate text-base font-semibold leading-tight text-foreground">
							{format(colStart, "MMM d")} – {format(rangeEnd, "MMM d, yyyy")}
						</span>
					)}
				</div>
				{!selectedIsToday ? (
					<button
						type="button"
						onClick={goToToday}
						className="ml-auto flex min-h-11 items-center rounded-md border border-border px-3 text-xs text-foreground hover:bg-surface md:min-h-0 md:px-2.5 md:py-1"
					>
						Today
					</button>
				) : (
					<span className="ml-auto rounded-md bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
						Today
					</span>
				)}
			</div>

			{/* View mode / layout / refresh row */}
			<div className="flex flex-wrap items-center gap-3 px-4 py-2 text-xs text-muted">
				<div className="flex items-center rounded-md border border-border p-0.5">
					{VIEW_MODES.map(({ mode, label }) => (
						<button
							key={mode}
							type="button"
							onClick={() => setViewMode(mode)}
							className={cn(
								"rounded px-2 py-1 text-xs",
								viewMode === mode
									? "bg-accent/15 text-accent"
									: "text-muted hover:text-foreground",
							)}
						>
							{label}
						</button>
					))}
				</div>
				{days > 1 ? (
					<div className="flex items-center rounded-md border border-border p-0.5">
						<button
							type="button"
							onClick={() => setLayout("vertical")}
							aria-label="Stack days vertically"
							title="Stack days vertically"
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
							aria-label="Arrange days horizontally"
							title="Arrange days horizontally"
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
				) : null}
				<button
					type="button"
					onClick={onRefresh}
					disabled={refreshCalendar.isPending}
					className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-foreground hover:bg-surface disabled:opacity-50"
				>
					<RefreshCw
						className={
							refreshCalendar.isPending
								? "h-3.5 w-3.5 animate-spin"
								: "h-3.5 w-3.5"
						}
					/>
					{refreshCalendar.isPending ? "Refreshing…" : "Refresh"}
				</button>
				{settings?.calendarLastSyncedAt ? (
					<span>
						Last synced{" "}
						{format(parseISO(settings.calendarLastSyncedAt), "MMM d, h:mm a")}
					</span>
				) : null}
			</div>

			<ScrollArea
				className="flex-1"
				horizontal={days > 1 && layout === "horizontal"}
			>
				{!hasUrl ? (
					<div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted">
						<CalendarClock className="h-8 w-8" />
						<p>No calendar connected.</p>
						<p>
							Add a published Outlook ICS URL in{" "}
							<Link to="/settings" className="text-accent underline">
								Settings
							</Link>{" "}
							to see your meetings here.
						</p>
					</div>
				) : isEmpty ? (
					<div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted">
						<CalendarClock className="h-8 w-8" />
						<p>Nothing scheduled for this {days === 1 ? "day" : "range"}.</p>
					</div>
				) : days === 1 ? (
					<div className="flex flex-col gap-4 p-4">
						{columns[0].events.length > 0 ? (
							<div className="flex flex-col gap-2">
								{columns[0].events.map((event) => (
									<EventRow
										key={`${event.uid}-${event.recurrenceId}`}
										event={event}
										onAddTodo={onAddTodo}
										adding={addingUid === event.uid}
									/>
								))}
							</div>
						) : null}

						{columns[0].tasks.length > 0 ? (
							<div className="flex flex-col gap-1">
								<span className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">
									Due today
								</span>
								{columns[0].tasks.map((task) => (
									<TaskRow
										key={task.id}
										task={task}
										project={projectById.get(task.projectId)}
										selected={false}
										depth={0}
										hasSubtasks={false}
										expanded={false}
										showProject
									/>
								))}
							</div>
						) : null}
					</div>
				) : (
					<div
						className={cn(
							"gap-2 p-3",
							layout === "vertical"
								? "flex flex-col"
								: "flex flex-row items-start overflow-x-auto",
						)}
					>
						{columns.map((col) => {
							const itemCount = col.tasks.length + col.events.length;
							return (
								<div
									key={col.key}
									className={cn(
										"flex min-w-0 flex-col rounded-lg border border-border/60 bg-surface/40",
										layout === "horizontal" && "w-80 shrink-0",
									)}
								>
									<div
										className={cn(
											"border-b border-border/60 px-3 py-2 text-xs font-semibold",
											col.isToday ? "text-accent" : "text-muted",
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
												Nothing scheduled
											</p>
										) : (
											col.tasks.map((task) => (
												<TaskRow
													key={task.id}
													task={task}
													project={projectById.get(task.projectId)}
													selected={false}
													depth={0}
													hasSubtasks={false}
													expanded={false}
													showProject
												/>
											))
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</ScrollArea>
		</>
	);
}
