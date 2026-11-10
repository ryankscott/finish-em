import { addDays, format, isSameDay, parseISO, startOfDay } from "date-fns";
import type { CalendarEvent, Task } from "@/server/types";
import { type GridItem, taskEstimate } from "./day-plan";

export type PlanningMode = "agenda" | "week" | "timebox";

export function pagePlanningDate(
	date: Date,
	mode: PlanningMode,
	direction: number,
) {
	return addDays(date, direction * (mode === "week" ? 7 : 1));
}

export function planningGroups(tasks: Task[], today: Date) {
	const start = startOfDay(today);
	const needsAttention: Task[] = [];
	const unplanned: Task[] = [];

	for (const task of tasks) {
		if (task.scheduledAt) {
			if (parseISO(task.scheduledAt) < start) needsAttention.push(task);
		} else if (task.dueAt && parseISO(task.dueAt) < start) {
			needsAttention.push(task);
		} else if (!task.someday) {
			unplanned.push(task);
		}
	}

	return { needsAttention, unplanned };
}

export function plannedForDay(tasks: Task[], day: Date) {
	return tasks
		.filter(
			(task) => task.scheduledAt && isSameDay(parseISO(task.scheduledAt), day),
		)
		.sort((a, b) => (a.planOrder || Infinity) - (b.planOrder || Infinity));
}

export function planningBlocks(
	events: CalendarEvent[],
	tasks: Task[],
	day: Date,
	excludeTaskId: number,
): GridItem[] {
	const blocks: GridItem[] = [];
	const dayStart = startOfDay(day);
	const dayEnd = addDays(dayStart, 1);
	for (const event of events) {
		if (event.allDay) continue;
		const start = parseISO(event.startAt);
		const end = event.endAt
			? parseISO(event.endAt)
			: new Date(+start + 30 * 60_000);
		if (start >= dayEnd || end <= dayStart) continue;
		blocks.push({
			key: `event:${event.uid}:${event.recurrenceId}`,
			startAt: event.startAt,
			minutes: (+end - +start) / 60_000,
		});
	}
	for (const task of tasks) {
		if (
			task.id === excludeTaskId ||
			!task.plannedStartAt ||
			!isSameDay(parseISO(task.plannedStartAt), day)
		)
			continue;
		blocks.push({
			key: `task:${task.id}`,
			startAt: task.plannedStartAt,
			minutes: taskEstimate(task),
		});
	}
	return blocks;
}

export function planTaskPatch(task: Task, date: string, time?: string) {
	const day = parseISO(date);
	return {
		scheduledAt: day.toISOString(),
		plannedStartAt: time
			? parseISO(`${date}T${time}`).toISOString()
			: time === undefined &&
					task.plannedStartAt &&
					format(parseISO(task.plannedStartAt), "yyyy-MM-dd") === date
				? task.plannedStartAt
				: null,
	};
}

export const PLANNING_DRAG_TYPE = "text/finish-em-task";
