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
import type { Task } from "@/server/types";

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
