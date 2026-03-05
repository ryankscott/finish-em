import { useEffect, useRef, useCallback } from "react";

import type { ApiClient } from "../api-client";

const POLL_INTERVAL_MS = 60_000;

export function dueReminderKey(
	reminder: { id: number; remindAt: string; snoozedUntil: string | null },
): string {
	return `${reminder.id}-${reminder.snoozedUntil ?? reminder.remindAt}`;
}

export function getNewlyDueReminders<T extends { id: number; remindAt: string; snoozedUntil: string | null }>(
	due: T[],
	notifiedKeys: Set<string>,
): T[] {
	return due.filter((r) => !notifiedKeys.has(dueReminderKey(r)));
}

export function useReminderBell(
	api: ApiClient,
	pushToast: (text: string, tone?: "info" | "success" | "warning" | "error") => void,
): void {
	const notifiedKeysRef = useRef<Set<string>>(new Set());

	const checkDueReminders = useCallback(async () => {
		const due = await api.listDueReminders();
		const notified = notifiedKeysRef.current;
		const newlyDue = getNewlyDueReminders(due, notified);

		for (const r of newlyDue) {
			const key = dueReminderKey(r);
			notified.add(key);
			process.stdout.write("\x07");
			pushToast(`Reminder: ${r.taskTitle || "Task"}`, "info");
		}
	}, [api, pushToast]);

	useEffect(() => {
		void checkDueReminders();
		const id = setInterval(checkDueReminders, POLL_INTERVAL_MS);
		return () => clearInterval(id);
	}, [checkDueReminders]);
}
