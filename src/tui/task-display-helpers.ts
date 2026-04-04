import { format, isBefore, isValid, parseISO } from "date-fns";

import type { Priority } from "../server/types";

export const priorityColor = (priority: Priority): string => {
	switch (priority) {
		case 1:
			return "red";
		case 2:
			return "yellow";
		case 3:
			return "green";
		default:
			return "blue";
	}
};

export const formatDueDate = (dueAt: string): string => {
	try {
		return format(parseISO(dueAt), "MMM dd");
	} catch {
		return dueAt;
	}
};

export const isOverdueDueDate = (dueAt: string): boolean => {
	try {
		const dueDate = parseISO(dueAt);
		return isValid(dueDate) && isBefore(dueDate, new Date());
	} catch {
		return false;
	}
};

export const formatScheduledDate = (scheduledAt: string): string => {
	try {
		return format(parseISO(scheduledAt), "MMM dd");
	} catch {
		return scheduledAt;
	}
};

export const recurrenceLabel = (preset: string | null): string => {
	if (!preset) return "Does not recur";
	return preset.replace(/_/g, " ");
};

export const blockedIndicator = (blockedReason: string | null): string =>
	blockedReason ? "⛔" : " ";

export const truncate = (text: string, maxLen: number): string => {
	if (text.length <= maxLen) return text.padEnd(maxLen);
	return `${text.slice(0, maxLen - 1)}…`;
};
