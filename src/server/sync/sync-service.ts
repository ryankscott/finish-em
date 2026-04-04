import { getDb } from "@/server/db/client";
import { listUnsyncedChanges } from "@/server/sync/changelog";
import type { DbLike } from "@/server/sync/db-like";
import {
	backfillUuids,
	fullSync,
	getOrCreateDeviceId,
	getSyncMeta,
	setSyncMeta,
} from "@/server/sync/engine";
import type { SyncBackend, SyncResult, SyncStatus } from "@/server/sync/types";

export const SYNC_ENABLED_KEY = "sync_enabled";
export const SYNC_BACKEND_KEY = "sync_backend";
export const SYNC_INTERVAL_KEY = "sync_interval_ms";
export const SYNC_PATH_KEY = "sync_path";

const DEFAULT_INTERVAL_MS = 30_000;

type SyncEventListener = (result: SyncResult | Error) => void;

export class SyncService {
	private db: DbLike;
	private backend: SyncBackend;
	private timer: ReturnType<typeof setInterval> | null = null;
	private listeners: SyncEventListener[] = [];
	private syncing = false;

	constructor(backend: SyncBackend, db?: DbLike) {
		this.db = db ?? getDb();
		this.backend = backend;
		// Ensure every existing row has a UUID
		backfillUuids(this.db);
	}

	getDeviceId(): string {
		return getOrCreateDeviceId(this.db);
	}

	isEnabled(): boolean {
		return getSyncMeta(this.db, SYNC_ENABLED_KEY) === "true";
	}

	enable(): void {
		setSyncMeta(this.db, SYNC_ENABLED_KEY, "true");
	}

	disable(): void {
		setSyncMeta(this.db, SYNC_ENABLED_KEY, "false");
		this.stopAutoSync();
	}

	getStatus(): SyncStatus {
		return {
			enabled: this.isEnabled(),
			deviceId: getSyncMeta(this.db, "device_id"),
			lastSyncAt: getSyncMeta(this.db, "last_sync_at"),
			lastPushAt: getSyncMeta(this.db, "last_push_at"),
			pendingChanges: listUnsyncedChanges(this.db).length,
		};
	}

	on(listener: SyncEventListener): () => void {
		this.listeners.push(listener);
		return () => {
			this.listeners = this.listeners.filter((l) => l !== listener);
		};
	}

	private emit(result: SyncResult | Error): void {
		for (const listener of this.listeners) {
			listener(result);
		}
	}

	async syncNow(): Promise<SyncResult> {
		if (this.syncing) {
			return { pushed: 0, pulled: 0 };
		}
		this.syncing = true;
		try {
			const result = await fullSync(this.db, this.backend);
			this.emit(result);
			return result;
		} catch (err) {
			const error = err instanceof Error ? err : new Error(String(err));
			this.emit(error);
			throw error;
		} finally {
			this.syncing = false;
		}
	}

	startAutoSync(intervalMs?: number): void {
		if (this.timer) return;
		const interval =
			intervalMs ??
			Number(getSyncMeta(this.db, SYNC_INTERVAL_KEY) ?? DEFAULT_INTERVAL_MS);

		this.timer = setInterval(() => {
			if (!this.isEnabled()) return;
			this.syncNow().catch(() => {
				// errors are emitted via listeners; swallow here to keep the interval alive
			});
		}, interval);
	}

	stopAutoSync(): void {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let _service: SyncService | null = null;

/**
 * Returns (and caches) the global SyncService instance, creating it with
 * the iCloud backend by default.
 */
export function getSyncService(): SyncService {
	if (_service) return _service;

	const { ICloudSyncBackend } =
		require("@/server/sync/backends/icloud") as typeof import("@/server/sync/backends/icloud");
	const db = getDb();
	const syncPath = getSyncMeta(db, SYNC_PATH_KEY) ?? undefined;
	const backend = new ICloudSyncBackend(syncPath);
	_service = new SyncService(backend, db);
	return _service;
}

/** Reset for tests only. */
export function resetSyncServiceForTests(): void {
	_service?.stopAutoSync();
	_service = null;
}
