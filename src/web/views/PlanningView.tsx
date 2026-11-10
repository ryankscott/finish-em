import {
	addDays,
	endOfDay,
	format,
	isSameDay,
	parseISO,
	startOfDay,
	startOfWeek,
} from "date-fns";
import {
	CalendarDays,
	CalendarPlus,
	ChevronLeft,
	ChevronRight,
	Clock,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toDisplayString } from "@/lib/task-links";
import type { Task } from "@/server/types";
import { DayGrid } from "../components/DayGrid";
import { EventRow } from "../components/EventRow";
import { GoalsRail } from "../components/GoalsRail";
import { GoalsSummary } from "../components/GoalsSummary";
import { PlanningTaskDialog } from "../components/PlanningTaskDialog";
import { TaskRow } from "../components/TaskRow";
import { api } from "../lib/api";
import { cn } from "../lib/cn";
import {
	DEFAULT_WORKDAY_MINUTES,
	dayCapacity,
	dayKey,
	dayWindow,
	formatMinutes,
	GRID_END_HOUR,
	GRID_START_HOUR,
	nextFreeSlot,
	taskEstimate,
} from "../lib/day-plan";
import { useHotkeyScope } from "../lib/hotkeys";
import {
	PLANNING_DRAG_TYPE,
	type PlanningMode,
	pagePlanningDate,
	plannedForDay,
	planningBlocks,
	planningGroups,
	planTaskPatch,
} from "../lib/planning";
import {
	useCalendarEvents,
	useProjects,
	useTaskMutations,
	useTasks,
} from "../lib/queries";
import { peekUndo, useUndo } from "../lib/undo";
import { useAddTodoFromEvent } from "../lib/use-add-todo-from-event";
import { useIsMobile } from "../lib/use-is-mobile";
import { useUi } from "../state/ui";
import { ViewTitle } from "./SimpleViews";

const modes = [
	{ value: "agenda", label: "Agenda" },
	{ value: "week", label: "Week" },
	{ value: "timebox", label: "Timebox" },
] as const;

export function PlanningView() {
	const ui = useUi();
	const isMobile = useIsMobile();
	const { data: projects = [] } = useProjects();
	const {
		data: tasks = [],
		isPending: loadingTasks,
		isError: failedTasks,
	} = useTasks({ status: "open" });
	const { completeTask, deleteTask, updateTask } = useTaskMutations();
	const { undoLast } = useUndo();
	const { onAddTodo, addingUid } = useAddTodoFromEvent();
	const [day, setDay] = useState(() => startOfDay(new Date()));
	const [mode, setMode] = useState<PlanningMode>("agenda");
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const [editing, setEditing] = useState<{ id: number; day: Date } | null>(
		null,
	);
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);
	const savingRef = useRef(false);
	const [goalAddSignal, setGoalAddSignal] = useState(0);

	const today = startOfDay(new Date());
	const weekStart = startOfWeek(day, { weekStartsOn: 1 });
	const weekDays = Array.from({ length: 7 }, (_, index) =>
		addDays(weekStart, index),
	);
	const weekMode = mode === "week";
	const timebox = mode === "timebox";
	const rangeStart = weekMode ? weekStart : day;
	const rangeEnd = weekMode ? addDays(weekStart, 6) : day;
	const {
		data: events = [],
		isPending: loadingEvents,
		isError: failedEvents,
	} = useCalendarEvents({
		from: rangeStart.toISOString(),
		to: endOfDay(rangeEnd).toISOString(),
	});
	const { needsAttention, unplanned } = planningGroups(tasks, today);
	const committed = plannedForDay(tasks, day);
	const columns = (weekMode ? weekDays : [day]).map((date) => ({
		date,
		tasks: weekMode ? plannedForDay(tasks, date) : committed,
		events: events.filter((event) => isSameDay(parseISO(event.startAt), date)),
	}));
	const visibleIds = new Set(
		columns.flatMap((column) => column.tasks.map((task) => task.id)),
	);
	const attention = needsAttention.filter((task) => !visibleIds.has(task.id));
	const orderedTasks = [
		...columns.flatMap((column) => column.tasks),
		...attention,
		...unplanned,
	];
	const selected = orderedTasks.find((task) => task.id === selectedId);
	const editTask = editing
		? tasks.find((task) => task.id === editing.id)
		: undefined;
	const projectById = new Map(projects.map((project) => [project.id, project]));

	function changeDay(date: Date) {
		setDay(date);
		setSelectedId(null);
		scrollRef.current
			?.querySelector("[data-radix-scroll-area-viewport]")
			?.scrollTo({ top: 0 });
	}

	function goToToday() {
		changeDay(startOfDay(new Date()));
		if (weekMode) setMode("agenda");
	}

	function changeMode(next: PlanningMode) {
		setMode(next);
		setSelectedId(null);
		scrollRef.current
			?.querySelector("[data-radix-scroll-area-viewport]")
			?.scrollTo({ top: 0 });
	}

	function openPlan(task: Task, date: Date) {
		setError("");
		setEditing({ id: task.id, day: date });
	}

	async function savePlan(
		task: Task,
		date: string,
		time?: string,
		fromDialog = false,
	) {
		if (savingRef.current) return;
		savingRef.current = true;
		setSaving(true);
		setError("");
		try {
			const patch = date
				? planTaskPatch(task, date, time)
				: { scheduledAt: null, plannedStartAt: null };
			if (time && patch.plannedStartAt) {
				const targetDay = parseISO(date);
				const start = parseISO(patch.plannedStartAt);
				if (format(start, "HH:mm") !== time)
					throw new Error("Choose a valid local start time.");
				const targetEvents =
					isSameDay(targetDay, day) && !loadingEvents && !failedEvents
						? events
						: await api.listCalendarEvents(dayWindow(targetDay));
				const available = nextFreeSlot(
					planningBlocks(targetEvents, tasks, targetDay, task.id),
					{
						day: targetDay,
						after: start,
						minutes: taskEstimate(task),
						startHour: GRID_START_HOUR,
						endHour: GRID_END_HOUR,
						snapMinutes: 1,
					},
				);
				if (available?.getTime() !== start.getTime()) {
					throw new Error(
						"Choose a free slot between 7:00 and 20:00 that fits the task.",
					);
				}
			}
			await updateTask.mutateAsync({
				taskId: task.id,
				input: patch,
				before: task,
			});
			if (fromDialog) {
				if (date) changeDay(parseISO(date));
				setEditing(null);
			}
			const undo = peekUndo();
			toast.success(
				time
					? `Timeboxed for ${time}`
					: date
						? `Planned for ${format(parseISO(date), "d MMM")}`
						: "Removed from plan",
				undo && {
					action: { label: "Undo", onClick: () => void undoLast(undo) },
				},
			);
		} catch (failure) {
			const message =
				failure instanceof Error ? failure.message : String(failure);
			if (fromDialog) setError(message);
			else toast.error(message);
		} finally {
			savingRef.current = false;
			setSaving(false);
		}
	}

	function selectRelative(direction: number) {
		const index = orderedTasks.findIndex((task) => task.id === selectedId);
		const next = Math.min(
			Math.max(index + direction, 0),
			orderedTasks.length - 1,
		);
		setSelectedId(orderedTasks[next]?.id ?? null);
	}

	useHotkeyScope(
		{
			j: () => selectRelative(1),
			arrowdown: () => selectRelative(1),
			k: () => selectRelative(-1),
			arrowup: () => selectRelative(-1),
			"[": () => changeDay(pagePlanningDate(day, mode, -1)),
			"]": () => changeDay(pagePlanningDate(day, mode, 1)),
			t: goToToday,
			v: () =>
				changeMode(
					modes[
						(modes.findIndex((entry) => entry.value === mode) + 1) %
							modes.length
					].value,
				),
			g: () => setGoalAddSignal((n) => n + 1),
			x: () =>
				selected &&
				completeTask.mutate(selected, {
					onSuccess: () => toast.success("Task completed"),
					onError: (err) => toast.error(err.message),
				}),
			d: () =>
				selected &&
				deleteTask.mutate(selected, {
					onSuccess: () => toast.success("Task deleted"),
					onError: (err) => toast.error(err.message),
				}),
			e: () => selected && ui.openTaskEditor(selected),
			enter: (event) => {
				if (
					event.target instanceof HTMLElement &&
					event.target.closest("button, a")
				)
					return false;
				if (selected) ui.openTaskEditor(selected);
				else return false;
			},
			b: () => {
				const task =
					selected ??
					(timebox
						? committed.find((item) => !item.plannedStartAt)
						: undefined);
				if (!task || loadingEvents || failedEvents) return;
				const slot = nextFreeSlot(planningBlocks(events, tasks, day, task.id), {
					day,
					after: isSameDay(day, today) ? new Date() : day,
					minutes: taskEstimate(task),
					startHour: GRID_START_HOUR,
					endHour: GRID_END_HOUR,
				});
				if (!slot) toast.error("No free slot left in this day");
				else void savePlan(task, dayKey(day), format(slot, "HH:mm"));
			},
			"shift+b": () => {
				if (selected?.scheduledAt && selected.plannedStartAt) {
					void savePlan(selected, dayKey(parseISO(selected.scheduledAt)), "");
				}
			},
		},
		{ enabled: !editing },
	);

	function taskRow(task: Task, date: Date, inPlan = false) {
		const Icon = timebox
			? Clock
			: task.scheduledAt
				? CalendarDays
				: CalendarPlus;
		const label = timebox
			? "Set time"
			: task.scheduledAt
				? "Edit plan"
				: "Plan task";
		const draggable = timebox && inPlan;
		return (
			<TaskRow
				key={task.id}
				task={task}
				project={projectById.get(task.projectId)}
				selected={selected?.id === task.id}
				depth={0}
				hasSubtasks={false}
				expanded={false}
				showProject
				onOpen={() => ui.openTaskEditor(task)}
				planning={{
					showWorkDay: !inPlan,
					action: (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="-mt-1 size-11 shrink-0 text-muted hover:text-foreground md:size-8"
							aria-label={`${label} for ${toDisplayString(task.title)}`}
							title={label}
							draggable={draggable}
							onDragStart={
								draggable
									? (event) =>
											event.dataTransfer.setData(
												PLANNING_DRAG_TYPE,
												String(task.id),
											)
									: undefined
							}
							onClick={() => openPlan(task, date)}
						>
							<Icon aria-hidden="true" />
						</Button>
					),
				}}
			/>
		);
	}

	const goals = {
		periodType: weekMode ? ("weekly" as const) : ("daily" as const),
		periodStart: dayKey(rangeStart),
		addSignal: goalAddSignal,
	};
	const capacity = dayCapacity({
		workdayMinutes: DEFAULT_WORKDAY_MINUTES,
		events,
		day,
		tasks: committed,
	});

	return (
		<>
			<ViewTitle title="Planning" />
			<div className="flex min-h-0 flex-1 flex-col">
				<div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/60 pb-3">
					<div className="flex items-center gap-1">
						<Button
							variant="outline"
							size="icon"
							className="size-11 md:size-9"
							aria-label={weekMode ? "Previous week" : "Previous day"}
							onClick={() => changeDay(pagePlanningDate(day, mode, -1))}
						>
							<ChevronLeft />
						</Button>
						<Button variant="outline" onClick={goToToday}>
							Go to today
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="size-11 md:size-9"
							aria-label={weekMode ? "Next week" : "Next day"}
							onClick={() => changeDay(pagePlanningDate(day, mode, 1))}
						>
							<ChevronRight />
						</Button>
					</div>
					<span
						className="min-w-16 flex-1 font-medium md:min-w-32"
						aria-live="polite"
					>
						{weekMode
							? `${format(rangeStart, "d MMM")} – ${format(rangeEnd, "d MMM")}`
							: format(day, "EEE d MMM")}
					</span>
					<fieldset className="flex gap-1" aria-label="Planning view">
						{modes.map(({ value, label }) => (
							<Button
								key={value}
								variant={mode === value ? "default" : "ghost"}
								aria-pressed={mode === value}
								onClick={() => changeMode(value)}
							>
								{label}
							</Button>
						))}
					</fieldset>
					<fieldset
						className="grid w-full grid-cols-7 gap-1"
						aria-label="Choose a day"
					>
						{weekDays.map((date) => (
							<Button
								key={dayKey(date)}
								variant={isSameDay(date, day) ? "outline" : "ghost"}
								className={cn(
									"h-11 min-w-0 flex-col gap-0 px-0 text-xs md:h-10",
									isSameDay(date, day) && "border border-accent/50",
								)}
								aria-label={format(date, "EEEE d MMMM")}
								aria-current={isSameDay(date, today) ? "date" : undefined}
								aria-pressed={isSameDay(date, day)}
								onClick={() => {
									changeDay(date);
									if (weekMode) setMode("agenda");
								}}
							>
								<span>
									{isSameDay(date, today) ? "Today" : format(date, "EEE")}
								</span>
								<span>{format(date, "d")}</span>
							</Button>
						))}
					</fieldset>
				</div>
				<ScrollArea ref={scrollRef} className="min-h-0 flex-1">
					<div className="grid min-w-0 gap-3 py-3 xl:grid-cols-[minmax(0,1fr)_18rem]">
						{isMobile && <GoalsSummary {...goals} />}
						<div className="grid min-w-0 content-start gap-3">
							{loadingTasks && (
								<output className="text-sm text-muted">Loading tasks…</output>
							)}
							{failedTasks && (
								<p role="alert" className="text-sm text-p1">
									Couldn’t load tasks.
								</p>
							)}
							{failedEvents && (
								<p role="alert" className="text-sm text-p1">
									Couldn’t load calendar events.
								</p>
							)}
							{timebox && (
								<>
									{!failedEvents &&
										!loadingEvents &&
										!failedTasks &&
										!loadingTasks && (
											<p className="text-sm text-muted">
												{formatMinutes(capacity.plannedMinutes)} planned ·{" "}
												{formatMinutes(Math.abs(capacity.remainingMinutes))}{" "}
												{capacity.isOver ? "over capacity" : "available"}
											</p>
										)}
									<DayGrid
										key={dayKey(day)}
										day={day}
										committed={committed}
										events={events}
										onPlace={(task, start) =>
											void savePlan(task, dayKey(day), format(start, "HH:mm"))
										}
										onEdit={(task) => openPlan(task, day)}
									/>
								</>
							)}
							{columns.map((column) => (
								<section
									key={dayKey(column.date)}
									className="min-w-0 rounded-lg border border-border/60 bg-surface/40 p-2"
								>
									<h2 className="px-2 py-1 text-sm font-semibold">
										{timebox
											? "Planned tasks"
											: `${isSameDay(column.date, today) ? "Today · " : ""}${format(column.date, "EEEE d MMM")}`}
									</h2>
									{!timebox &&
										column.events.map((event) => (
											<EventRow
												key={`${event.uid}-${event.recurrenceId}`}
												event={event}
												onAddTodo={onAddTodo}
												adding={addingUid === event.uid}
											/>
										))}
									{column.tasks.map((task) => taskRow(task, column.date, true))}
									{!loadingTasks &&
										!failedTasks &&
										column.tasks.length === 0 && (
											<p className="px-2 py-1 text-xs text-muted">
												No tasks planned
											</p>
										)}
								</section>
							))}
						</div>
						<aside className="grid min-w-0 content-start gap-3">
							{[
								{ label: "Needs attention", tasks: attention },
								{ label: "Unplanned", tasks: unplanned },
							].map((section) => (
								<section
									key={section.label}
									className="min-w-0 rounded-lg border border-border/60 bg-surface/40 p-2"
								>
									<h2 className="px-2 py-1 text-sm font-semibold">
										{section.label}
									</h2>
									{section.tasks.map((task) => taskRow(task, day))}
									{!loadingTasks &&
										!failedTasks &&
										section.tasks.length === 0 && (
											<p className="px-2 py-1 text-xs text-muted">No tasks</p>
										)}
								</section>
							))}
							{!isMobile && <GoalsRail {...goals} />}
						</aside>
					</div>
				</ScrollArea>
			</div>
			{editing && editTask && (
				<PlanningTaskDialog
					key={editTask.id}
					task={editTask}
					day={editing.day}
					timebox={timebox}
					pending={saving}
					error={error}
					onClose={() => setEditing(null)}
					onSave={(date, time) => void savePlan(editTask, date, time, true)}
				/>
			)}
		</>
	);
}
