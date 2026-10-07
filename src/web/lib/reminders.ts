import { formatDistanceStrict, parseISO } from "date-fns";

import type { SnoozePreset } from "@/server/services/reminders";
import type { Reminder } from "@/server/types";

export type DueReminder = Reminder & { taskTitle: string };

export type SnoozeOption = {
	label: string;
	preset: SnoozePreset;
	customMinutes?: number;
};

/** The same short list Things and Apple Reminders offer from a notification. */
export const SNOOZE_OPTIONS: SnoozeOption[] = [
	{ label: "15 minutes", preset: "custom", customMinutes: 15 },
	{ label: "1 hour", preset: "custom", customMinutes: 60 },
	{ label: "This evening", preset: "this_evening" },
	{ label: "Tomorrow morning", preset: "tomorrow_morning" },
	{ label: "Next week", preset: "next_week" },
];

export function reminderTime(reminder: Reminder): Date {
	return parseISO(reminder.snoozedUntil ?? reminder.remindAt);
}

/** Due reminders no device has delivered yet. */
export function undelivered(due: DueReminder[]): DueReminder[] {
	return due.filter((r) => r.firedAt === null);
}

export function missedLabel(reminder: Reminder, now = new Date()): string {
	const when = reminderTime(reminder);
	if (now.getTime() - when.getTime() < 60_000) return "just now";
	return `${formatDistanceStrict(when, now)} ago`;
}

/** "(3) finish-em" so a missed count is visible from the tab strip or Dock. */
export function titleWithCount(base: string, count: number): string {
	const stripped = base.replace(/^\(\d+\)\s*/, "");
	return count > 0 ? `(${count}) ${stripped}` : stripped;
}
