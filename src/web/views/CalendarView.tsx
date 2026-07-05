import { Link } from "@tanstack/react-router";
import {
	addDays,
	endOfDay,
	format,
	isSameDay,
	isToday as isTodayFn,
	parseISO,
	startOfDay,
} from "date-fns";
import {
	CalendarClock,
	ChevronLeft,
	ChevronRight,
	RefreshCw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ScrollArea } from "@/components/ui/scroll-area";

import { EventRow } from "../components/EventRow";
import { TaskRow } from "../components/TaskRow";
import {
	useCalendarEvents,
	useCalendarMutations,
	useProjects,
	useSettings,
	useTasks,
} from "../lib/queries";
import { useAddTodoFromEvent } from "../lib/use-add-todo-from-event";
import { ViewTitle } from "./SimpleViews";

export function CalendarView() {
	const { data: settings } = useSettings();
	const { data: projects = [] } = useProjects();
	const { refreshCalendar } = useCalendarMutations();
	const { onAddTodo, addingUid } = useAddTodoFromEvent();

	const [selectedDate, setSelectedDate] = useState(() =>
		startOfDay(new Date()),
	);

	const rangeStart = startOfDay(selectedDate);
	const rangeEnd = endOfDay(selectedDate);

	const { data: events = [] } = useCalendarEvents({
		from: rangeStart.toISOString(),
		to: rangeEnd.toISOString(),
	});
	const { data: tasks = [] } = useTasks({
		status: "open",
		from: rangeStart.toISOString(),
		to: rangeEnd.toISOString(),
	});

	const projectById = useMemo(
		() => new Map(projects.map((p) => [p.id, p])),
		[projects],
	);

	const dayEvents = useMemo(
		() =>
			events
				.filter((e) => isSameDay(parseISO(e.startAt), selectedDate))
				.sort((a, b) => {
					if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
					return a.startAt.localeCompare(b.startAt);
				}),
		[events, selectedDate],
	);

	const dayTasks = useMemo(
		() =>
			tasks.filter(
				(t) => t.dueAt && isSameDay(parseISO(t.dueAt), selectedDate),
			),
		[tasks, selectedDate],
	);

	const isEmpty = dayEvents.length === 0 && dayTasks.length === 0;
	const selectedIsToday = isTodayFn(selectedDate);
	const hasUrl = Boolean(settings?.calendarIcsUrl);

	const goToDay = (delta: number) =>
		setSelectedDate((d) => startOfDay(addDays(d, delta)));
	const goToToday = () => setSelectedDate(startOfDay(new Date()));

	const onRefresh = () => {
		refreshCalendar.mutate(undefined, {
			onSuccess: (r) => toast.success(`Calendar refreshed (${r.count} events)`),
			onError: (err) => toast.error(err.message),
		});
	};

	return (
		<>
			<ViewTitle title="Calendar" />

			{/* Day switcher */}
			<div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
				<button
					type="button"
					onClick={() => goToDay(-1)}
					aria-label="Previous day"
					className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted hover:bg-surface hover:text-foreground"
				>
					<ChevronLeft className="h-4 w-4" />
				</button>
				<button
					type="button"
					onClick={() => goToDay(1)}
					aria-label="Next day"
					className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted hover:bg-surface hover:text-foreground"
				>
					<ChevronRight className="h-4 w-4" />
				</button>
				<div className="ml-1 flex min-w-0 flex-col">
					<span className="truncate text-base font-semibold leading-tight text-foreground">
						{format(selectedDate, "EEEE")}
					</span>
					<span className="truncate text-xs text-muted">
						{format(selectedDate, "MMMM d, yyyy")}
					</span>
				</div>
				{!selectedIsToday ? (
					<button
						type="button"
						onClick={goToToday}
						className="ml-auto rounded-md border border-border px-2.5 py-1 text-xs text-foreground hover:bg-surface"
					>
						Today
					</button>
				) : (
					<span className="ml-auto rounded-md bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
						Today
					</span>
				)}
			</div>

			{/* Refresh row */}
			<div className="flex items-center gap-3 px-4 py-2 text-xs text-muted">
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

			<ScrollArea className="flex-1">
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
						<p>Nothing scheduled for this day.</p>
					</div>
				) : (
					<div className="flex flex-col gap-4 p-4">
						{dayEvents.length > 0 ? (
							<div className="flex flex-col gap-2">
								{dayEvents.map((event) => (
									<EventRow
										key={`${event.uid}-${event.recurrenceId}`}
										event={event}
										onAddTodo={onAddTodo}
										adding={addingUid === event.uid}
									/>
								))}
							</div>
						) : null}

						{dayTasks.length > 0 ? (
							<div className="flex flex-col gap-1">
								<span className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">
									Due today
								</span>
								{dayTasks.map((task) => (
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
				)}
			</ScrollArea>
		</>
	);
}
