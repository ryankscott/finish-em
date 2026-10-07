import { nowIso } from "@/lib/datetime";
import type { Db } from "@/server/db/types";
import type { PushSubscriptionKeys } from "@/server/push/web-push";

export type PushSubscriptionRow = PushSubscriptionKeys & { id: number };

export async function upsertPushSubscription(
	db: Db,
	input: PushSubscriptionKeys & { userAgent?: string | null },
): Promise<void> {
	await db
		.prepare(
			`INSERT INTO push_subscriptions (endpoint, p256dh, auth, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth,
         user_agent = excluded.user_agent`,
		)
		.run(
			input.endpoint,
			input.p256dh,
			input.auth,
			input.userAgent ?? null,
			nowIso(),
		);
}

export async function deletePushSubscription(db: Db, endpoint: string) {
	await db
		.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?")
		.run(endpoint);
}

export async function listPushSubscriptions(
	db: Db,
): Promise<PushSubscriptionRow[]> {
	return db
		.prepare("SELECT id, endpoint, p256dh, auth FROM push_subscriptions")
		.all<PushSubscriptionRow>();
}

export async function markPushSuccess(db: Db, ids: number[]) {
	if (ids.length === 0) return;
	await db
		.prepare(
			`UPDATE push_subscriptions SET last_success_at = ? WHERE id IN (${ids.map(() => "?").join(",")})`,
		)
		.run(nowIso(), ...ids);
}
