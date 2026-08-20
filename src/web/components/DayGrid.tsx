import { format, isSameDay, parseISO } from "date-fns";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { toDisplayString } from "@/lib/task-links";
import type { CalendarEvent, Task } from "@/server/types";

import { cn } from "../lib/cn";
import {
	dayWindow,
	formatMinutes,
	GRID_END_HOUR,
	GRID_PX_PER_HOUR,
	GRID_START_HOUR,
	layoutBlocks,
	minutesFromGridTop,
	pxFromMinutes,
	snapToSlot,
	taskEstimate,
} from "../lib/day-plan";
import { useCalendarEvents, useTaskMutations, useTasks } from "../lib/queries";
import { useUi } from "../state/ui";
import { formatTimeRange } from "./EventRow";

/** The MIME type is our own, so a drag from elsewhere cannot land on the grid. */
const DRAG_TYPE = "text/finish-em-task";

const HOURS = Array.from(
	{ length: GRID_END_HOUR - GRID_START_HOUR },
	(_, i) => GRID_START_HOUR + i,
);

const eventMinutes = (event: CalendarEvent) =>
	event.endAt
		? Math.max(
				15,
				(new Date(event.endAt).getTime() - new Date(event.startAt).getTime()) /
					60_000,
			)
		: 30;

/**
 * The day as hours rather than as a list.
 *
 * Meetings come from the read-only ICS cache and cannot be moved here. Tasks
 * committed to this day can be dragged onto a slot; the block's height is its
 * estimate, so the grid shows whether the plan physically fits between the
 * meetings rather than only whether it adds up.
 */
export function DayGrid({ day }: { day: Date }) {
	const ui = useUi();
	const { updateTask } = useTaskMutations();
	const window = dayWindow(day);
	const columnRef = useRef<HTMLDivElement | null>(null);
	const [ghostTop, setGhostTop] = useState<number | null>(null);

	const { data: committed = [] } = useTasks({
		status: "open",
		scheduledFrom: window.from,
		scheduledTo: window.to,
	});
	const { data: events = [] } = useCalendarEvents(window);

	const timed = events.filter((event) => !event.allDay);
	const allDay = events.filter((event) => event.allDay);

	const boxed = committed.filter((task) => task.plannedStartAt !== null);
	const rail = committed.filter((task) => task.plannedStartAt === null);

	const gridOpts = {
		startHour: GRID_START_HOUR,
		pxPerHour: GRID_PX_PER_HOUR,
	};

	const meetingBlocks = layoutBlocks(
		timed.map((event) => ({
			key: `${event.uid}-${event.recurrenceId}`,
			startAt: event.startAt,
			minutes: eventMinutes(event),
		})),
		gridOpts,
	);
	const taskBlocks = layoutBlocks(
		boxed.map((task) => ({
			key: String(task.id),
			// Non-null by construction: `boxed` filters on it.
			startAt: task.plannedStartAt as string,
			minutes: taskEstimate(task),
		})),
		gridOpts,
	);

	const byId = new Map(committed.map((task) => [task.id, task]));
	const eventByKey = new Map(
		timed.map((event) => [`${event.uid}-${event.recurrenceId}`, event]),
	);

	const height = (GRID_END_HOUR - GRID_START_HOUR) * GRID_PX_PER_HOUR;
	const now = new Date();
	// Only while the clock is actually inside the grid: pinning the line to the
	// top edge at 06:00 would claim the day had already started.
	const nowMinutes = minutesFromGridTop(now, GRID_START_HOUR);
	const nowTop =
		isSameDay(day, now) &&
		nowMinutes >= 0 &&
		nowMinutes <= (GRID_END_HOUR - GRID_START_HOUR) * 60
			? pxFromMinutes(nowMinutes, GRID_PX_PER_HOUR)
			: null;

	const offsetFrom = (clientY: number) => {
		const rect = columnRef.current?.getBoundingClientRect();
		return rect ? clientY - rect.top : 0;
	};

	const place = (task: Task, offsetPx: number) => {
		const start = snapToSlot(offsetPx, {
			day,
			startHour: GRID_START_HOUR,
			endHour: GRID_END_HOUR,
			pxPerHour: GRID_PX_PER_HOUR,
		});
		updateTask.mutate(
			{
				taskId: task.id,
				// scheduledAt is untouched: the task is already committed to this day,
				// and a drop only decides when within it.
				input: { plannedStartAt: start.toISOString() },
				before: task,
			},
			{
				onSuccess: () =>
					toast.success(`Timeboxed for ${format(start, "HH:mm")}`),
				onError: (err) => toast.error(err.message),
			},
		);
	};

	const onDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setGhostTop(null);
		const raw = e.dataTransfer.getData(DRAG_TYPE);
		const task = byId.get(Number(raw));
		if (task) place(task, offsetFrom(e.clientY));
	};

	return (
		<div className="flex min-h-0 flex-1 gap-3 p-3">
			<div className="flex min-w-0 flex-1 flex-col rounded-lg border border-border/60 bg-surface/40">
				{allDay.length > 0 ? (
					<div className="flex flex-wrap gap-1.5 border-b border-border/60 px-3 py-2">
						{allDay.map((event) => (
							<span
								key={`${event.uid}-${event.recurrenceId}`}
								className="rounded bg-surface-raised px-2 py-0.5 text-xs text-muted"
							>
								{event.summary}
							</span>
						))}
					</div>
				) : null}

				<div className="flex min-h-0 flex-1 overflow-y-auto">
					<div className="w-14 shrink-0 select-none pt-0">
						{HOURS.map((hour) => (
							<div
								key={hour}
								className="pr-2 text-right text-[10px] text-muted/70"
								style={{ height: GRID_PX_PER_HOUR }}
							>
								{format(new Date(2026, 0, 1, hour), "h a")}
							</div>
						))}
					</div>

					{/* biome-ignore lint/a11y/noStaticElementInteractions: a drop target has no keyboard equivalent, so the column stays inert to assistive tech; timeboxing by keyboard is the `b` hotkey, which does not go through the DOM */}
					<div
						ref={columnRef}
						className="relative min-w-0 flex-1 border-l border-border/60"
						style={{ height }}
						onDragOver={(e) => {
							if (!e.dataTransfer.types.includes(DRAG_TYPE)) return;
							e.preventDefault();
							const start = snapToSlot(offsetFrom(e.clientY), {
								day,
								startHour: GRID_START_HOUR,
								endHour: GRID_END_HOUR,
								pxPerHour: GRID_PX_PER_HOUR,
							});
							setGhostTop(
								pxFromMinutes(
									minutesFromGridTop(start, GRID_START_HOUR),
									GRID_PX_PER_HOUR,
								),
							);
						}}
						onDragLeave={() => setGhostTop(null)}
						onDrop={onDrop}
					>
						{HOURS.map((hour) => (
							<div
								key={hour}
								className="absolute inset-x-0 border-t border-border/40"
								style={{
									top: pxFromMinutes(
										(hour - GRID_START_HOUR) * 60,
										GRID_PX_PER_HOUR,
									),
								}}
							/>
						))}
						{HOURS.map((hour) => (
							<div
								key={`half-${hour}`}
								className="absolute inset-x-0 border-t border-border/20"
								style={{
									top: pxFromMinutes(
										(hour - GRID_START_HOUR) * 60 + 30,
										GRID_PX_PER_HOUR,
									),
								}}
							/>
						))}

						{nowTop !== null ? (
							<div
								className="absolute inset-x-0 z-20 border-t border-p1"
								style={{ top: nowTop }}
							/>
						) : null}

						{/* Meetings: read-only, because the ICS feed is input only. */}
						{meetingBlocks.map((block) => {
							const event = eventByKey.get(block.key);
							return (
								<div
									key={block.key}
									className="absolute cursor-default overflow-hidden rounded-r border-l-2 border-accent bg-accent/10 px-2 py-0.5 text-xs"
									style={blockStyle(block)}
									title={event ? formatTimeRange(event) : undefined}
								>
									<span className="block truncate font-medium">
										{event?.summary}
									</span>
								</div>
							);
						})}

						{/* Intentions, filled differently so they never read as appointments. */}
						{taskBlocks.map((block) => {
							const task = byId.get(Number(block.key));
							if (!task) return null;
							return (
								<button
									type="button"
									key={block.key}
									draggable
									onDragStart={(e) =>
										e.dataTransfer.setData(DRAG_TYPE, block.key)
									}
									onDoubleClick={() => ui.openTaskEditor(task)}
									className={cn(
										"absolute cursor-grab overflow-hidden rounded border border-dashed px-2 py-0.5 text-left text-xs active:cursor-grabbing",
										task.startedAt
											? "border-accent bg-accent/25"
											: "border-border bg-surface-raised",
									)}
									style={blockStyle(block)}
								>
									<span className="block truncate font-medium">
										{toDisplayString(task.title)}
									</span>
									<span className="block truncate text-muted">
										{format(parseISO(block.startAt), "HH:mm")} ·{" "}
										{formatMinutes(block.minutes)}
									</span>
								</button>
							);
						})}

						{ghostTop !== null ? (
							<div
								className="pointer-events-none absolute inset-x-0 z-10 border-y border-dashed border-accent bg-accent/10"
								style={{ top: ghostTop, height: 2 }}
							/>
						) : null}
					</div>
				</div>
			</div>

			{/* The rail is the point of the screen: it empties as the day gets times. */}
			<div className="flex w-56 shrink-0 flex-col rounded-lg border border-border/60 bg-surface/40">
				<div className="border-b border-border/60 px-3 py-2 text-xs font-semibold text-muted">
					Not yet timeboxed
					<span className="ml-2 font-normal">{rail.length}</span>
				</div>
				<div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-1.5">
					{rail.length === 0 ? (
						<p className="px-2 py-1.5 text-xs text-muted/50">
							{committed.length === 0
								? "Nothing committed to this day yet."
								: "Every task has a time."}
						</p>
					) : null}
					{rail.map((task) => (
						<button
							key={task.id}
							type="button"
							draggable
							onDragStart={(e) =>
								e.dataTransfer.setData(DRAG_TYPE, String(task.id))
							}
							onDoubleClick={() => ui.openTaskEditor(task)}
							className="cursor-grab rounded-md border border-border/60 bg-surface-raised px-2 py-1.5 text-left text-xs active:cursor-grabbing"
						>
							<span className="block truncate">
								{toDisplayString(task.title)}
							</span>
							<span className="block text-muted">
								{formatMinutes(taskEstimate(task))}
							</span>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

function blockStyle(block: {
	top: number;
	height: number;
	lane: number;
	lanes: number;
}) {
	const width = 100 / block.lanes;
	return {
		top: block.top,
		height: block.height,
		left: `${block.lane * width}%`,
		width: `calc(${width}% - 4px)`,
	};
}
