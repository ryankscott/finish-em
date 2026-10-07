import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { api } from "../lib/api";
import {
	deliverNativeReminders,
	hasNativeReminders,
	registerNativeActionHandler,
	syncNativeReminders,
} from "../lib/native-bridge";
import {
	useAllReminders,
	useDueReminders,
	useReminderMutations,
} from "../lib/queries";
import {
	type DueReminder,
	titleWithCount,
	undelivered,
} from "../lib/reminders";

function showSystemNotification(reminder: DueReminder) {
	if (
		typeof Notification === "undefined" ||
		Notification.permission !== "granted"
	) {
		return;
	}
	try {
		new Notification("finish-em", {
			body: reminder.taskTitle,
			tag: `reminder-${reminder.id}`,
			requireInteraction: true,
		});
	} catch {
		// Some browsers throw when constructing notifications without a SW.
	}
}

/**
 * Delivers due reminders while the app is open: a toast that stays until it is
 * closed, plus a system notification where the browser allows one. Delivery is
 * recorded on the server (fired_at), so a reminder is delivered once across
 * reloads and devices. Delivered reminders that nobody acted on stay in the
 * missed-reminders banner, the sidebar count and the app badge.
 */
export function ReminderWatcher() {
	const queryClient = useQueryClient();
	const delivered = useRef(new Set<number>());
	const { data: due = [] } = useDueReminders();
	const { snoozeReminder, completeFromReminder } = useReminderMutations();

	useEffect(() => {
		// Acted on elsewhere (banner, another device): close its toast here too.
		const dueIds = new Set(due.map((r) => r.id));
		for (const id of delivered.current) {
			if (!dueIds.has(id)) {
				toast.dismiss(`reminder-${id}`);
				delivered.current.delete(id);
			}
		}

		const fresh = undelivered(due).filter((r) => !delivered.current.has(r.id));
		if (fresh.length === 0) return;

		for (const reminder of fresh) {
			delivered.current.add(reminder.id);
			toast(reminder.taskTitle, {
				id: `reminder-${reminder.id}`,
				description: "Reminder",
				duration: Number.POSITIVE_INFINITY,
				closeButton: true,
				action: {
					label: "Done",
					onClick: () =>
						completeFromReminder.mutate({
							taskId: reminder.taskId,
							title: reminder.taskTitle,
						}),
				},
				cancel: {
					label: "Snooze 1h",
					onClick: () =>
						snoozeReminder.mutate({
							reminderId: reminder.id,
							preset: "custom",
							customMinutes: 60,
						}),
				},
			});
			showSystemNotification(reminder);
		}
		deliverNativeReminders(fresh);

		api
			.markRemindersFired(fresh.map((r) => r.id))
			.then(() => queryClient.invalidateQueries({ queryKey: ["reminders"] }))
			.catch(() => {
				// Delivery is retried on the next poll: the ids leave the local set.
				for (const r of fresh) delivered.current.delete(r.id);
			});
	}, [due, queryClient, snoozeReminder, completeFromReminder]);

	const { data: all } = useAllReminders();
	useEffect(() => {
		if (all && hasNativeReminders()) syncNativeReminders(all);
	}, [all]);

	const actions = useRef({ snoozeReminder, completeFromReminder });
	actions.current = { snoozeReminder, completeFromReminder };
	useEffect(
		() =>
			registerNativeActionHandler((reminderId, taskId, action) => {
				const { snoozeReminder, completeFromReminder } = actions.current;
				if (action === "DONE") {
					const title =
						queryClient
							.getQueryData<DueReminder[]>(["reminders"])
							?.find((r) => r.id === reminderId)?.taskTitle ?? "task";
					completeFromReminder.mutate({ taskId, title });
					return;
				}
				snoozeReminder.mutate(
					action === "TOMORROW"
						? { reminderId, preset: "tomorrow_morning" }
						: {
								reminderId,
								preset: "custom",
								customMinutes: action === "SNOOZE_15" ? 15 : 60,
							},
				);
			}),
		[queryClient],
	);

	const missedCount = due.length;
	useEffect(() => {
		document.title = titleWithCount(document.title, missedCount);
		const nav = navigator as Navigator & {
			setAppBadge?: (n: number) => Promise<void>;
			clearAppBadge?: () => Promise<void>;
		};
		if (missedCount > 0) nav.setAppBadge?.(missedCount).catch(() => {});
		else nav.clearAppBadge?.().catch(() => {});
	}, [missedCount]);

	return null;
}
