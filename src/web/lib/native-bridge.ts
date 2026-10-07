import type { DueReminder } from "./reminders";
import { reminderTime } from "./reminders";

/**
 * Bridge to the macOS app (desktop/FinishEmApp.swift). WKWebView has no web
 * Notification API, so the page hands its reminders to Swift, which schedules
 * them with UNUserNotificationCenter. Those fire even when the app is quit.
 */

type NativeReminder = {
	id: number;
	taskId: number;
	title: string;
	at: string;
	fired: boolean;
};

type NativeMessage =
	| { kind: "sync"; reminders: NativeReminder[]; missed: number }
	| { kind: "deliver"; reminders: NativeReminder[] };

type WebkitWindow = Window & {
	webkit?: {
		messageHandlers?: {
			reminders?: { postMessage: (body: NativeMessage) => void };
		};
	};
};

export type NativeReminderAction =
	| "DONE"
	| "SNOOZE_15"
	| "SNOOZE_60"
	| "TOMORROW";

function handler() {
	return (window as WebkitWindow).webkit?.messageHandlers?.reminders;
}

export function hasNativeReminders(): boolean {
	return handler() !== undefined;
}

export function toNative(reminder: DueReminder): NativeReminder {
	return {
		id: reminder.id,
		taskId: reminder.taskId,
		title: reminder.taskTitle,
		at: reminderTime(reminder).toISOString(),
		fired: reminder.status === "fired",
	};
}

/** Replace the macOS schedule with every active reminder and set the badge. */
export function syncNativeReminders(all: DueReminder[]) {
	handler()?.postMessage({
		kind: "sync",
		reminders: all.map(toNative),
		missed: all.filter((r) => r.status === "fired").length,
	});
}

/** Show these due reminders as macOS notifications now. */
export function deliverNativeReminders(due: DueReminder[]) {
	if (due.length === 0) return;
	handler()?.postMessage({ kind: "deliver", reminders: due.map(toNative) });
}

/** Swift calls window.finishEmNative.reminderAction(...) for notification buttons. */
export function registerNativeActionHandler(
	onAction: (
		reminderId: number,
		taskId: number,
		action: NativeReminderAction,
	) => void,
): () => void {
	const target = window as Window & {
		finishEmNative?: { reminderAction: typeof onAction };
	};
	target.finishEmNative = { reminderAction: onAction };
	return () => {
		delete target.finishEmNative;
	};
}
