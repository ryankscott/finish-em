import {
	endOfDay as fnsEndOfDay,
	startOfDay as fnsStartOfDay,
	startOfWeek as fnsStartOfWeek,
	format,
	isBefore,
	isValid,
	parseISO,
	set,
} from "date-fns";

export function toDateInputValue(iso: string | null) {
	if (!iso) {
		return "";
	}
	const date = parseISO(iso);
	if (!isValid(date)) {
		return "";
	}
	return format(date, "yyyy-MM-dd");
}

export function fromDateInputValue(value: string): string | null {
	if (!value) {
		return null;
	}
	const date = parseISO(value);
	if (!isValid(date)) {
		return null;
	}
	return set(date, {
		hours: 9,
		minutes: 0,
		seconds: 0,
		milliseconds: 0,
	}).toISOString();
}

export function startOfDay(date = new Date()) {
	return fnsStartOfDay(date);
}

export function endOfDay(date = new Date()) {
	return fnsEndOfDay(date);
}

export function startOfWeek(date = new Date()) {
	return fnsStartOfWeek(date, { weekStartsOn: 1 });
}

export function formatDateLabel(iso: string | null) {
	if (!iso) {
		return "No date";
	}
	const date = parseISO(iso);
	if (!isValid(date)) {
		return "Invalid date";
	}
	return format(date, "EEE, MMM d");
}

export function isOverdueTask(
	task: { dueAt: string | null },
	now: Date,
): boolean {
	return !!task.dueAt && parseISO(task.dueAt) < fnsStartOfDay(now);
}

/**
 * Overdue to the exact moment, unlike isOverdueTask which is day-granular.
 * Used for styling an individual due-date label, where a task due earlier
 * today should already read as overdue.
 */
export function isOverdueDueDate(dueAt: string): boolean {
	try {
		const dueDate = parseISO(dueAt);
		return isValid(dueDate) && isBefore(dueDate, new Date());
	} catch {
		return false;
	}
}
