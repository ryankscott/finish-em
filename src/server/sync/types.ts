export type SyncEntityType = "task" | "project" | "goal" | "reminder";

export type FieldChange = {
	entityType: SyncEntityType;
	entityUuid: string;
	/** '*' means a full create/delete tombstone record; otherwise a specific field name */
	field: string;
	value: string | null;
	updatedAt: string;
};

export type Changeset = {
	deviceId: string;
	timestamp: string;
	changes: FieldChange[];
};

export type SyncStatus = {
	enabled: boolean;
	deviceId: string | null;
	lastSyncAt: string | null;
	lastPushAt: string | null;
	pendingChanges: number;
};

export interface SyncBackend {
	push(deviceId: string, changeset: Changeset): Promise<void>;
	pull(deviceId: string, since: string | null): Promise<Changeset[]>;
	listDevices(): Promise<string[]>;
}
