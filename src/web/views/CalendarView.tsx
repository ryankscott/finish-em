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
	MapPin,
	Plus,
	RefreshCw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { CalendarEvent, Task } from "@/server/types";

import { TaskRow } from "../components/TaskRow";
import {
	useCalendarEvents,
	useCalendarMutations,
	useProjects,
	useSettings,
	useTaskMutations,
	useTasks,
} from "../lib/queries";
import { ViewTitle } from "./SimpleViews";

function formatTimeRange(event: CalendarEvent): string {
	if (event.allDay) return "All day";
	try {
		const start = format(parseISO(event.startAt), "h:mm a");
		if (!event.endAt) return start;
		return `${start} – ${format(parseISO(event.endAt), "h:mm a")}`;
	} catch {
		return "";
	}
}

function startLabel(event: CalendarEvent): string {
	if (event.allDay) return "All day";
	try {
		return format(parseISO(event.startAt), "h:mm a");
	} catch {
		return "";
	}
}

function EventRow({
	event,
	onAddTodo,
	adding,
}: {
	event: CalendarEvent;
	onAddTodo: (event: CalendarEvent) => void;
	adding: boolean;
}) {
	return (
		<div className="group flex items-stretch gap-3">
			<div className="w-16 shrink-0 pt-0.5 text-right text-xs font-medium text-muted">
				{startLabel(event)}
			</div>
			<div className="relative flex flex-1 items-start gap-2 rounded-md border border-border/60 bg-surface/60 px-3 py-2">
				<div className="absolute inset-y-0 left-0 w-1 rounded-l-md bg-accent/70" />
				<div className="min-w-0 flex-1">
					<span className="block truncate text-sm font-medium">
						{event.summary}
					</span>
					<span className="mt-0.5 flex items-center gap-2 text-xs text-muted">
						<span>{formatTimeRange(event)}</span>
						{event.location ? (
							<span className="flex items-center gap-1 truncate">
								<MapPin className="h-3 w-3 shrink-0" />
								<span className="truncate">{event.location}</span>
							</span>
						) : null}
					</span>
				</div>
				<button
					type="button"
					onClick={() => onAddTodo(event)}
					disabled={adding}
					title="Add a todo linked to this meeting"
					className="flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted opacity-0 transition-opacity hover:bg-surface hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-50"
				>
					<Plus className="h-3.5 w-3.5" />
					Todo
				</button>
			</div>
		</div>
	);
}

export function CalendarView() {
	const { data: settings } = useSettings();
	const { data: projects = [] } = useProjects();
	const { refreshCalendar, linkTaskToEvent } = useCalendarMutations();
	const { createTask } = useTaskMutations();

	const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
	const [addingUid, setAddingUid] = useState<string | null>(null);

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
			tasks.filter((t) => t.dueAt && isSameDay(parseISO(t.dueAt), selectedDate)),
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

	const onAddTodo = async (event: CalendarEvent) => {
		const projectId =
			projects.find((p) => p.isInbox)?.id ?? projects[0]?.id ?? null;
		if (projectId === null) {
			toast.error("No project available to add the todo to.");
			return;
		}
		setAddingUid(event.uid);
		try {
			const task = await createTask.mutateAsync({
				projectId,
				title: event.summary,
			});
			// Linking pins the todo's due date to the meeting start, so the todo
			// depends on ("finish before") this calendar item.
			await linkTaskToEvent.mutateAsync({ taskId: task.id, eventUid: event.uid });
			toast.success(`Added todo for “${event.summary}”`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to add todo");
		} finally {
			setAddingUid(null);
		}
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
