/**
 * Pure helpers for the day plan. Kept out of the components because there is no
 * DOM test environment -- see src/web/lib/status-metrics.ts for the same split.
 *
 * The client always decides what "today" is and sends explicit dates to the
 * server. Every other view already does this (SimpleViews, StatusBar, Sidebar
 * all use device-local startOfDay), and it keeps the Worker out of the business
 * of resolving a timezone it has no host clock for.
 */

import { endOfDay, format, isSameDay, startOfDay } from "date-fns";
import type { CalendarEvent, Task } from "@/server/types";

export const dayKey = (date: Date) => format(date, "yyyy-MM-dd");

/** The ISO window to hand to the scheduledFrom/scheduledTo filters. */
export function dayWindow(date: Date) {
	return {
		from: startOfDay(date).toISOString(),
		to: endOfDay(date).toISOString(),
	};
}

export type DaySections = {
	/** Committed to an earlier day and never dealt with. */
	leftover: Task[];
	/** Committed to today, in the order they were planned. */
	today: Task[];
	/** Past its deadline but never committed to a day. */
	unplannedOverdue: Task[];
};

/**
 * planDay assigns 1..n, so a 0 means "committed but never explicitly ranked" --
 * a task pulled into today with `c` from another view. Those belong at the end
 * of the plan, not ahead of everything that was ranked deliberately.
 */
const rank = (task: Task) =>
	task.planOrder === 0 ? Number.POSITIVE_INFINITY : task.planOrder;

const byPlanOrder = (a: Task, b: Task) => rank(a) - rank(b);

/**
 * Split what the Today view shows.
 *
 * `committed` is every open task with a scheduledAt at or before end of today,
 * so leftovers surface themselves the next morning instead of silently
 * disappearing. That is the whole no-silent-rollover guarantee, and it needs no
 * cron to enforce.
 */
export function partitionDay(
	committed: Task[],
	overdue: Task[],
	now: Date,
): DaySections {
	const leftover: Task[] = [];
	const today: Task[] = [];

	for (const task of committed) {
		if (!task.scheduledAt) continue;
		if (isSameDay(new Date(task.scheduledAt), now)) today.push(task);
		else if (new Date(task.scheduledAt) < startOfDay(now)) leftover.push(task);
	}

	const committedIds = new Set(committed.map((t) => t.id));
	const unplannedOverdue = overdue.filter(
		(t) => t.scheduledAt === null && !committedIds.has(t.id),
	);

	return {
		leftover: leftover.sort(byPlanOrder),
		today: today.sort(byPlanOrder),
		unplannedOverdue,
	};
}

/**
 * Honest wall-clock time since the task was started. Sleeping the laptop
 * inflates it, which is why the UI labels it "started 09:14 - 23m" rather than
 * presenting it as a stopwatch.
 */
export function formatElapsed(ms: number): string {
	const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	if (hours === 0) return `${minutes}m`;
	return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

/**
 * Everything worth offering when planning a day, most pressing first, with no
 * duplicates. Order matters more than completeness here: a list that opens with
 * what you already failed to finish is the one that gets planned honestly.
 */
export function planCandidates(groups: Task[][]): Task[] {
	const seen = new Set<number>();
	const out: Task[] = [];
	for (const group of groups) {
		for (const task of group) {
			if (seen.has(task.id)) continue;
			seen.add(task.id);
			out.push(task);
		}
	}
	return out;
}

/**
 * An unestimated task is not a free task. Counting it as 30m is a guess, but a
 * guess that shows up in the capacity total is what stops a day being planned
 * as though half its work costs nothing.
 */
export const DEFAULT_ESTIMATE_MINUTES = 30;

/** Six hours of actual focus, not eight hours of being at a desk. */
export const DEFAULT_WORKDAY_MINUTES = 360;

export const GRID_START_HOUR = 7;
export const GRID_END_HOUR = 20;
export const GRID_PX_PER_HOUR = 56;
export const SNAP_MINUTES = 15;
/** Below this a block cannot hold its own title, so short tasks stay legible. */
export const MIN_BLOCK_PX = 20;

export const taskEstimate = (task: Task) =>
	task.estimateMinutes ?? DEFAULT_ESTIMATE_MINUTES;

export const plannedMinutes = (tasks: Task[]) =>
	tasks.reduce((total, task) => total + taskEstimate(task), 0);

/** "1h 30m", "45m", "2h". Reads as a duration, unlike formatElapsed's clock. */
export function formatMinutes(minutes: number): string {
	const safe = Math.max(0, Math.round(minutes));
	const hours = Math.floor(safe / 60);
	const rest = safe % 60;
	if (hours === 0) return `${rest}m`;
	if (rest === 0) return `${hours}h`;
	return `${hours}h ${rest}m`;
}

/**
 * Minutes of real meetings on `day`.
 *
 * All-day events are excluded: they are labels for a day ("Leave", "Conference")
 * rather than time taken out of it, and counting them would zero the capacity of
 * any day carrying one. Events are clipped to the day, so something spanning
 * midnight only spends the part that lands here, and overlaps are merged so a
 * double-booked hour is charged once.
 */
export function meetingMinutes(events: CalendarEvent[], day: Date): number {
	const dayStart = startOfDay(day).getTime();
	const dayEnd = endOfDay(day).getTime();

	const spans: Array<[number, number]> = [];
	for (const event of events) {
		if (event.allDay || !event.endAt) continue;
		const start = Math.max(new Date(event.startAt).getTime(), dayStart);
		const end = Math.min(new Date(event.endAt).getTime(), dayEnd);
		if (Number.isNaN(start) || Number.isNaN(end) || end <= start) continue;
		spans.push([start, end]);
	}

	spans.sort((a, b) => a[0] - b[0]);

	let total = 0;
	let cursor = -1;
	for (const [start, end] of spans) {
		const from = Math.max(start, cursor);
		if (end > from) total += end - from;
		cursor = Math.max(cursor, end);
	}

	return Math.round(total / 60_000);
}

export type Capacity = {
	workdayMinutes: number;
	meetingMinutes: number;
	/** What is left for tasks once meetings are paid for. Never negative. */
	capacityMinutes: number;
	plannedMinutes: number;
	/** Negative once the plan exceeds capacity. */
	remainingMinutes: number;
	overBy: number;
	isOver: boolean;
	/** Planned as a fraction of capacity, for the bar. Capacity 0 reads as over. */
	ratio: number;
};

/**
 * The honest arithmetic behind "will this fit". Meetings come out of the day
 * before tasks get any of it, because that is the order reality applies them.
 */
export function dayCapacity(input: {
	workdayMinutes: number;
	events: CalendarEvent[];
	day: Date;
	tasks: Task[];
}): Capacity {
	const meetings = meetingMinutes(input.events, input.day);
	const capacity = Math.max(0, input.workdayMinutes - meetings);
	const planned = plannedMinutes(input.tasks);
	const remaining = capacity - planned;

	return {
		workdayMinutes: input.workdayMinutes,
		meetingMinutes: meetings,
		capacityMinutes: capacity,
		plannedMinutes: planned,
		remainingMinutes: remaining,
		overBy: Math.max(0, -remaining),
		isOver: remaining < 0,
		ratio: capacity === 0 ? (planned > 0 ? 1 : 0) : planned / capacity,
	};
}

/** Minutes from the top of the grid, which starts at `startHour`, not midnight. */
export const minutesFromGridTop = (date: Date, startHour: number) =>
	(date.getHours() - startHour) * 60 + date.getMinutes();

export const pxFromMinutes = (minutes: number, pxPerHour: number) =>
	(minutes / 60) * pxPerHour;

/**
 * The inverse, for a drop: a pixel offset inside the column becomes a real
 * instant, snapped to the nearest slot and clamped to the grid so a drop just
 * past either edge lands on the last usable slot rather than off the day.
 */
export function snapToSlot(
	offsetPx: number,
	opts: {
		day: Date;
		startHour: number;
		endHour: number;
		pxPerHour: number;
		snapMinutes?: number;
	},
): Date {
	const snap = opts.snapMinutes ?? SNAP_MINUTES;
	const rawMinutes = (offsetPx / opts.pxPerHour) * 60;
	const snapped = Math.round(rawMinutes / snap) * snap;
	const lastSlot = (opts.endHour - opts.startHour) * 60 - snap;
	const clamped = Math.min(Math.max(snapped, 0), Math.max(0, lastSlot));

	const result = startOfDay(opts.day);
	result.setHours(opts.startHour);
	result.setMinutes(clamped);
	return result;
}

export type GridItem = {
	key: string;
	startAt: string;
	minutes: number;
};

export type PlacedBlock = GridItem & {
	top: number;
	height: number;
	lane: number;
	/** Lanes in this item's overlap cluster, so width is 1/lanes. */
	lanes: number;
};

/**
 * Place items on the grid, side by side where they overlap.
 *
 * Every item in a connected run of overlaps reports the same `lanes` count, so
 * a cluster divides the column evenly instead of each block guessing its own
 * width and leaving ragged edges.
 */
export function layoutBlocks(
	items: GridItem[],
	opts: { startHour: number; pxPerHour: number; minHeight?: number },
): PlacedBlock[] {
	const minHeight = opts.minHeight ?? MIN_BLOCK_PX;

	const sorted = [...items]
		.map((item) => {
			const start = new Date(item.startAt);
			return {
				item,
				start: start.getTime(),
				end: start.getTime() + item.minutes * 60_000,
				top: pxFromMinutes(
					minutesFromGridTop(start, opts.startHour),
					opts.pxPerHour,
				),
				height: Math.max(
					minHeight,
					pxFromMinutes(item.minutes, opts.pxPerHour),
				),
				lane: 0,
			};
		})
		.sort((a, b) => a.start - b.start || a.end - b.end);

	// One pass: assign the lowest free lane, and close off a cluster as soon as
	// nothing overlaps it any more so the lane count does not leak into the next.
	let cluster: typeof sorted = [];
	let clusterEnd = -1;
	const out: PlacedBlock[] = [];

	const flush = () => {
		const lanes = cluster.reduce((max, c) => Math.max(max, c.lane + 1), 1);
		for (const c of cluster) {
			out.push({ ...c.item, top: c.top, height: c.height, lane: c.lane, lanes });
		}
		cluster = [];
	};

	for (const entry of sorted) {
		if (cluster.length > 0 && entry.start >= clusterEnd) flush();

		const taken = new Set(
			cluster.filter((c) => c.end > entry.start).map((c) => c.lane),
		);
		let lane = 0;
		while (taken.has(lane)) lane += 1;
		entry.lane = lane;

		cluster.push(entry);
		clusterEnd = Math.max(clusterEnd, entry.end);
	}
	if (cluster.length > 0) flush();

	return out;
}

/**
 * The first slot at or after `after` where `minutes` of work fits without
 * colliding with a meeting or an existing block. Null when the day is full.
 *
 * This is what makes the one-keystroke timebox possible: a decent slot chosen
 * now beats a perfect slot chosen never.
 */
export function nextFreeSlot(
	occupied: GridItem[],
	opts: {
		day: Date;
		after: Date;
		minutes: number;
		startHour: number;
		endHour: number;
		snapMinutes?: number;
	},
): Date | null {
	const snap = opts.snapMinutes ?? SNAP_MINUTES;

	const gridStart = startOfDay(opts.day);
	gridStart.setHours(opts.startHour);
	const gridEnd = startOfDay(opts.day);
	gridEnd.setHours(opts.endHour);

	const spans = occupied
		.map((item) => {
			const start = new Date(item.startAt).getTime();
			return { start, end: start + item.minutes * 60_000 };
		})
		.sort((a, b) => a.start - b.start);

	const earliest = Math.max(gridStart.getTime(), opts.after.getTime());
	const snapMs = snap * 60_000;
	let candidate =
		Math.ceil((earliest - gridStart.getTime()) / snapMs) * snapMs +
		gridStart.getTime();
	const durationMs = opts.minutes * 60_000;

	while (candidate + durationMs <= gridEnd.getTime()) {
		const clash = spans.find(
			(span) => span.end > candidate && span.start < candidate + durationMs,
		);
		if (!clash) return new Date(candidate);
		// Jump to the end of what blocked us, snapped forward.
		candidate =
			Math.ceil((clash.end - gridStart.getTime()) / snapMs) * snapMs +
			gridStart.getTime();
	}

	return null;
}
