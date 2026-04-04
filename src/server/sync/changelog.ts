import type { DbLike } from "@/server/sync/db-like";
import type { SyncEntityType } from "@/server/sync/types";

/**
 * Records a mutation in the sync_changelog table so the sync engine knows
 * what to push to other devices.
 *
 * Pass field='*' for creates and deletes (the entire row is the payload,
 * encoded as JSON in value). Pass a specific field name for field-level updates.
 */
export function trackChange(
	db: DbLike,
	entityType: SyncEntityType,
	entityUuid: string,
	field: string,
	value: string | null,
	updatedAt: string,
	deviceId: string,
): void {
	db.prepare(
		`INSERT INTO sync_changelog
       (entity_type, entity_uuid, field_name, new_value, updated_at, device_id, synced)
     VALUES (?, ?, ?, ?, ?, ?, 0)`,
	).run(entityType, entityUuid, field, value, updatedAt, deviceId);
}

export function markChangesSynced(db: DbLike, ids: number[]): void {
	if (ids.length === 0) return;
	const placeholders = ids.map(() => "?").join(",");
	db.prepare(
		`UPDATE sync_changelog SET synced = 1 WHERE id IN (${placeholders})`,
	).run(...ids);
}

export type ChangelogRow = {
	id: number;
	entity_type: SyncEntityType;
	entity_uuid: string;
	field_name: string;
	new_value: string | null;
	updated_at: string;
	device_id: string;
	synced: number;
};

export function listUnsyncedChanges(db: DbLike): ChangelogRow[] {
	return db
		.prepare("SELECT * FROM sync_changelog WHERE synced = 0 ORDER BY id ASC")
		.all() as ChangelogRow[];
}
