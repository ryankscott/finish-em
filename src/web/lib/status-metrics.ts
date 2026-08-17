import { parseISO } from "date-fns";

import { isOverdueTask } from "@/lib/datetime";
import type { Task } from "@/server/types";

/** Count of open tasks whose due date has already passed (day-granular). */
export function countOverdue(tasks: Task[], now: Date): number {
	return tasks.filter((t) => isOverdueTask(t, now)).length;
}

/**
 * Count of tasks completed at or after `since`.
 *
 * Reads `completedAt` straight off the task rather than the completion log
 * (task_completion_log): that log only gets a row for recurring tasks, so it
 * can't answer "how many tasks did I complete today" for the common case of
 * one-off tasks. This mirrors how LogbookView derives its own counts.
 */
export function countCompletionsSince(tasks: Task[], since: Date): number {
	return tasks.filter((t) => t.completedAt && parseISO(t.completedAt) >= since)
		.length;
}

/** Progress toward a daily target, clamped to [0, 1]. A non-positive target is 0 progress. */
export function nyanProgress(completed: number, target: number): number {
	if (target <= 0) return 0;
	return Math.min(1, Math.max(0, completed / target));
}
