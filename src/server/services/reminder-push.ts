import { nowIso } from "@/lib/datetime";
import type { Db } from "@/server/db/types";
import {
	type PushResult,
	type PushSubscriptionKeys,
	sendWebPush,
	type VapidConfig,
} from "@/server/push/web-push";
import { bumpVersion } from "@/server/repos/change-version";
import {
	deletePushSubscription,
	listPushSubscriptions,
	markPushSuccess,
} from "@/server/repos/push-subscriptions";

/** Older than this and a reminder is shown as missed, not pushed. */
const MAX_LATENESS_MS = 24 * 60 * 60 * 1000;
const BATCH = 50;

export type ReminderPushPayload = {
	title: string;
	body: string;
	tag: string;
	reminderId: number;
	taskId: number;
};

export type SendFn = (
	subscription: PushSubscriptionKeys,
	payload: ReminderPushPayload,
) => Promise<PushResult>;

export function vapidSender(config: VapidConfig): SendFn {
	return (subscription, payload) => sendWebPush(subscription, payload, config);
}

/**
 * Push every due reminder that has not been pushed yet to every subscribed
 * browser, then mark it pushed (and fired, if no open tab got there first).
 * Runs from the every-minute cron. Writes outside HTTP, so it bumps the change
 * version itself.
 */
export async function dispatchDueReminderPushes(
	db: Db,
	send: SendFn,
	now = new Date(),
): Promise<{ reminders: number; sent: number; removed: number }> {
	const subscriptions = await listPushSubscriptions(db);
	if (subscriptions.length === 0) return { reminders: 0, sent: 0, removed: 0 };

	const nowText = now.toISOString();
	const due = await db
		.prepare(
			`SELECT r.id, r.task_id, t.title
       FROM reminders r
       INNER JOIN tasks t ON t.id = r.task_id
       WHERE r.pushed_at IS NULL
         AND r.status IN ('pending', 'snoozed', 'fired')
         AND COALESCE(r.snoozed_until, r.remind_at) <= ?
         AND COALESCE(r.snoozed_until, r.remind_at) > ?
         AND t.deleted_at IS NULL
         AND t.status = 'open'
       ORDER BY COALESCE(r.snoozed_until, r.remind_at) ASC
       LIMIT ${BATCH}`,
		)
		.all<{ id: number; task_id: number; title: string }>(
			nowText,
			new Date(now.getTime() - MAX_LATENESS_MS).toISOString(),
		);
	if (due.length === 0) return { reminders: 0, sent: 0, removed: 0 };

	let sent = 0;
	const gone = new Set<string>();
	const succeeded = new Set<number>();

	for (const reminder of due) {
		const payload: ReminderPushPayload = {
			title: reminder.title,
			body: "Reminder",
			tag: `reminder-${reminder.id}`,
			reminderId: reminder.id,
			taskId: reminder.task_id,
		};
		const results = await Promise.allSettled(
			subscriptions
				.filter((s) => !gone.has(s.endpoint))
				.map(async (s) => ({ s, result: await send(s, payload) })),
		);
		for (const outcome of results) {
			if (outcome.status === "rejected") {
				console.error("push failed:", outcome.reason);
				continue;
			}
			const { s, result } = outcome.value;
			if (result.ok) {
				sent += 1;
				succeeded.add(s.id);
			} else if (result.gone) {
				gone.add(s.endpoint);
			} else {
				console.error(`push rejected: ${result.status} for ${s.endpoint}`);
			}
		}
	}

	for (const endpoint of gone) await deletePushSubscription(db, endpoint);
	await markPushSuccess(db, [...succeeded]);

	// Marked pushed even if a send failed: retrying every minute against a
	// failing push service would repeat the same banner on the devices that
	// did get it. The reminder still shows as missed in the app.
	const stamp = nowIso();
	const ids = due.map((r) => r.id);
	await db
		.prepare(
			`UPDATE reminders SET pushed_at = ?,
         fired_at = COALESCE(fired_at, ?),
         status = CASE WHEN status IN ('pending', 'snoozed') THEN 'fired' ELSE status END,
         updated_at = ?
       WHERE id IN (${ids.map(() => "?").join(",")})`,
		)
		.run(stamp, stamp, stamp, ...ids);
	await bumpVersion(db);

	return { reminders: due.length, sent, removed: gone.size };
}
