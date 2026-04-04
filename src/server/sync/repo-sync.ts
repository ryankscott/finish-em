/**
 * Thin helpers used by repos to integrate with the sync changelog.
 * Lazy-loads the device ID so no circular dependency is created between
 * client.ts and the sync modules.
 */
import { trackChange } from "@/server/sync/changelog";
import type { DbLike } from "@/server/sync/db-like";
import type { SyncEntityType } from "@/server/sync/types";

export function getDeviceIdForRepo(db: DbLike): string {
	const row = db
		.prepare("SELECT value FROM sync_meta WHERE key = 'device_id'")
		.get() as { value: string } | undefined;
	if (row?.value) return row.value;

	const id = crypto.randomUUID();
	db.prepare(
		"INSERT INTO sync_meta (key, value) VALUES ('device_id', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
	).run(id);
	return id;
}

/** Track a full-row create or delete (field='*'). */
export function trackCreate(
	db: DbLike,
	entityType: SyncEntityType,
	entityUuid: string,
	rowJson: string,
	updatedAt: string,
): void {
	const deviceId = getDeviceIdForRepo(db);
	trackChange(db, entityType, entityUuid, "*", rowJson, updatedAt, deviceId);
}

/** Track a delete tombstone (field='*', value=null). */
export function trackDelete(
	db: DbLike,
	entityType: SyncEntityType,
	entityUuid: string,
	updatedAt: string,
): void {
	const deviceId = getDeviceIdForRepo(db);
	trackChange(db, entityType, entityUuid, "*", null, updatedAt, deviceId);
}

/** Track a set of field-level changes (one changelog entry per field). */
export function trackFieldChanges(
	db: DbLike,
	entityType: SyncEntityType,
	entityUuid: string,
	fields: Record<string, string | null>,
	updatedAt: string,
): void {
	const deviceId = getDeviceIdForRepo(db);
	for (const [field, value] of Object.entries(fields)) {
		trackChange(db, entityType, entityUuid, field, value, updatedAt, deviceId);
	}
}
