import {
	listUnsyncedChanges,
	markChangesSynced,
} from "@/server/sync/changelog";
import type { DbLike } from "@/server/sync/db-like";
import type {
	Changeset,
	FieldChange,
	SyncBackend,
	SyncEntityType,
} from "@/server/sync/types";

// ---------------------------------------------------------------------------
// Meta helpers
// ---------------------------------------------------------------------------

export function getSyncMeta(db: DbLike, key: string): string | null {
	const row = db
		.prepare("SELECT value FROM sync_meta WHERE key = ?")
		.get(key) as { value: string } | undefined;
	return row?.value ?? null;
}

export function setSyncMeta(db: DbLike, key: string, value: string): void {
	db.prepare(
		"INSERT INTO sync_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
	).run(key, value);
}

export function getOrCreateDeviceId(db: DbLike): string {
	const existing = getSyncMeta(db, "device_id");
	if (existing) return existing;
	const id = crypto.randomUUID();
	setSyncMeta(db, "device_id", id);
	return id;
}

// ---------------------------------------------------------------------------
// Push
// ---------------------------------------------------------------------------

export async function pushChanges(
	db: DbLike,
	backend: SyncBackend,
): Promise<number> {
	const rows = listUnsyncedChanges(db);
	if (rows.length === 0) return 0;

	const deviceId = getOrCreateDeviceId(db);
	const changeset: Changeset = {
		deviceId,
		timestamp: new Date().toISOString(),
		changes: rows.map((r) => ({
			entityType: r.entity_type as SyncEntityType,
			entityUuid: r.entity_uuid,
			field: r.field_name,
			value: r.new_value,
			updatedAt: r.updated_at,
		})),
	};

	await backend.push(deviceId, changeset);
	markChangesSynced(
		db,
		rows.map((r) => r.id),
	);
	setSyncMeta(db, "last_push_at", changeset.timestamp);
	return rows.length;
}

// ---------------------------------------------------------------------------
// Pull & merge
// ---------------------------------------------------------------------------

type TableColumnMap = Record<SyncEntityType, string[]>;

const ALLOWED_FIELDS: TableColumnMap = {
	task: [
		"project_id",
		"parent_task_id",
		"title",
		"notes",
		"priority",
		"scheduled_at",
		"due_at",
		"due_timezone",
		"recurrence_preset",
		"recurrence_rrule",
		"status",
		"completed_at",
		"deleted_at",
	],
	project: [
		"name",
		"emoji",
		"description",
		"start_at",
		"end_at",
		"color",
		"is_inbox",
		"jira_discovery_url",
		"jira_delivery_url",
		"confluence_url",
	],
	goal: ["period_type", "period_start", "title", "done"],
	reminder: ["task_id", "remind_at", "status", "snoozed_until"],
};

const TABLE_FOR_ENTITY: Record<SyncEntityType, string> = {
	task: "tasks",
	project: "projects",
	goal: "goals",
	reminder: "reminders",
};

/**
 * Full create/delete tombstone: value is a JSON blob of the full row, or null
 * for a delete. We apply field-level last-write-wins for creates/upserts.
 */
function applyFullRecord(
	db: DbLike,
	change: FieldChange,
	ownDeviceId: string,
): void {
	if (change.device_id === ownDeviceId) return;

	const table = TABLE_FOR_ENTITY[change.entityType];
	if (!table) return;

	if (change.value === null) {
		// Tombstone delete
		const existing = db
			.prepare(`SELECT updated_at FROM ${table} WHERE uuid = ?`)
			.get(change.entityUuid) as { updated_at: string } | undefined;
		if (!existing) return;
		if (change.updatedAt <= existing.updated_at) return;

		if (change.entityType === "task") {
			db.prepare(
				"UPDATE tasks SET deleted_at = ?, updated_at = ? WHERE uuid = ?",
			).run(change.updatedAt, change.updatedAt, change.entityUuid);
		} else {
			db.prepare(`DELETE FROM ${table} WHERE uuid = ?`).run(change.entityUuid);
		}
		return;
	}

	// Upsert the full row JSON
	let incoming: Record<string, unknown>;
	try {
		incoming = JSON.parse(change.value) as Record<string, unknown>;
	} catch {
		return;
	}

	const existing = db
		.prepare(`SELECT updated_at FROM ${table} WHERE uuid = ?`)
		.get(change.entityUuid) as { updated_at: string } | undefined;

	if (existing) {
		// Only upsert if incoming is newer
		if (change.updatedAt <= existing.updated_at) return;
		const allowed = ALLOWED_FIELDS[change.entityType];
		const setClauses = allowed
			.filter((f) => f in incoming)
			.map((f) => `${f} = ?`);
		if (setClauses.length === 0) return;
		const values = allowed
			.filter((f) => f in incoming)
			.map((f) => incoming[f] ?? null);
		db.prepare(
			`UPDATE ${table} SET ${setClauses.join(", ")}, updated_at = ? WHERE uuid = ?`,
		).run(...values, change.updatedAt, change.entityUuid);
	} else {
		// Insert new row
		const allowed = ALLOWED_FIELDS[change.entityType];
		const fields = ["uuid", ...allowed.filter((f) => f in incoming)];
		const placeholders = fields.map(() => "?").join(", ");
		const values = [
			change.entityUuid,
			...allowed.filter((f) => f in incoming).map((f) => incoming[f] ?? null),
		];
		try {
			db.prepare(
				`INSERT INTO ${table} (${fields.join(", ")}, created_at, updated_at) VALUES (${placeholders}, ?, ?)`,
			).run(...values, change.updatedAt, change.updatedAt);
		} catch {
			// Row may have been inserted by a concurrent change; ignore
		}
	}
}

/**
 * Per-field last-write-wins: only overwrite the local field if the incoming
 * change is strictly newer than what we already have.
 */
function applyFieldChange(
	db: DbLike,
	change: FieldChange & { device_id: string },
	ownDeviceId: string,
): void {
	if (change.device_id === ownDeviceId) return;

	const table = TABLE_FOR_ENTITY[change.entityType];
	if (!table) return;

	const allowed = ALLOWED_FIELDS[change.entityType];
	if (!allowed.includes(change.field)) return;

	const existing = db
		.prepare(`SELECT updated_at FROM ${table} WHERE uuid = ?`)
		.get(change.entityUuid) as { updated_at: string } | undefined;
	if (!existing) return;

	// Field-level wins: apply only if strictly newer
	if (change.updatedAt <= existing.updated_at) return;

	db.prepare(
		`UPDATE ${table} SET ${change.field} = ?, updated_at = ? WHERE uuid = ?`,
	).run(change.value, change.updatedAt, change.entityUuid);
}

export async function pullAndMerge(
	db: DbLike,
	backend: SyncBackend,
): Promise<number> {
	const deviceId = getOrCreateDeviceId(db);
	const since = getSyncMeta(db, "last_sync_at");
	const changesets = await backend.pull(deviceId, since);

	let applied = 0;
	for (const cs of changesets) {
		for (const change of cs.changes) {
			const enriched = { ...change, device_id: cs.deviceId };
			if (change.field === "*") {
				applyFullRecord(db, enriched, deviceId);
			} else {
				applyFieldChange(db, enriched, deviceId);
			}
			applied++;
		}
	}

	setSyncMeta(db, "last_sync_at", new Date().toISOString());
	return applied;
}

// ---------------------------------------------------------------------------
// Full sync
// ---------------------------------------------------------------------------

export type SyncResult = {
	pushed: number;
	pulled: number;
	inboxImported: number;
};

/**
 * Push local changes first, then pull remote changes. Pushing first ensures
 * we don't re-import our own changes that haven't been marked synced yet.
 */
export async function fullSync(
	db: DbLike,
	backend: SyncBackend,
): Promise<SyncResult> {
	const pushed = await pushChanges(db, backend);
	const pulled = await pullAndMerge(db, backend);
	return { pushed, pulled, inboxImported: 0 };
}

// ---------------------------------------------------------------------------
// UUID backfill
// ---------------------------------------------------------------------------

/**
 * Assigns UUIDs to any existing rows that don't have one yet.
 * Should be called once on startup after ensureSyncSchema.
 */
export function backfillUuids(db: DbLike): void {
	const entities: Array<{ table: string; entityType: SyncEntityType }> = [
		{ table: "tasks", entityType: "task" },
		{ table: "projects", entityType: "project" },
		{ table: "goals", entityType: "goal" },
		{ table: "reminders", entityType: "reminder" },
	];

	for (const { table } of entities) {
		const rows = db
			.prepare(`SELECT id FROM ${table} WHERE uuid IS NULL`)
			.all() as Array<{ id: number }>;
		for (const row of rows) {
			db.prepare(`UPDATE ${table} SET uuid = ? WHERE id = ?`).run(
				crypto.randomUUID(),
				row.id,
			);
		}
	}
}
