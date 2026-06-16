import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { getDb, resetDbForTests } from "@/server/db/client";
import { createGoal, updateGoal } from "@/server/repos/goals";
import { createTask, deleteTask, updateTask } from "@/server/repos/tasks";
import {
	listUnsyncedChanges,
	markChangesSynced,
} from "@/server/sync/changelog";
import {
	backfillUuids,
	fullSync,
	getOrCreateDeviceId,
	pullAndMerge,
	pushChanges,
	setSyncMeta,
} from "@/server/sync/engine";
import type { Changeset, SyncBackend } from "@/server/sync/types";

// ---------------------------------------------------------------------------
// In-memory sync backend for tests
// ---------------------------------------------------------------------------

class MemorySyncBackend implements SyncBackend {
	private store: Map<string, Changeset[]> = new Map();

	async push(deviceId: string, changeset: Changeset): Promise<void> {
		const existing = this.store.get(deviceId) ?? [];
		this.store.set(deviceId, [...existing, changeset]);
	}

	async pull(deviceId: string, since: string | null): Promise<Changeset[]> {
		const result: Changeset[] = [];
		for (const [storedDeviceId, changesets] of this.store) {
			if (storedDeviceId === deviceId) continue;
			for (const cs of changesets) {
				if (!since || cs.timestamp > since) {
					result.push(cs);
				}
			}
		}
		result.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
		return result;
	}

	async listDevices(): Promise<string[]> {
		return [...this.store.keys()];
	}

	clear(): void {
		this.store.clear();
	}
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDb() {
	return getDb();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getOrCreateDeviceId", () => {
	beforeEach(() => {
		process.env.TODO_DB_PATH = `/tmp/finish-em-test-sync-${Date.now()}.db`;
		resetDbForTests();
	});
	afterEach(() => {
		resetDbForTests();
		delete process.env.TODO_DB_PATH;
	});

	it("creates a stable UUID on first call", () => {
		const db = makeDb();
		const id1 = getOrCreateDeviceId(db);
		const id2 = getOrCreateDeviceId(db);
		expect(id1).toBe(id2);
		expect(id1).toMatch(/^[0-9a-f-]{36}$/);
	});
});

describe("pushChanges", () => {
	beforeEach(() => {
		process.env.TODO_DB_PATH = `/tmp/finish-em-test-sync-${Date.now()}.db`;
		resetDbForTests();
	});
	afterEach(() => {
		resetDbForTests();
		delete process.env.TODO_DB_PATH;
	});

	it("pushes unsynced changelog entries and marks them synced", async () => {
		const db = makeDb();
		const backend = new MemorySyncBackend();

		createTask({
			projectId: (db
				.prepare("SELECT id FROM projects WHERE is_inbox=1")
				.get() as { id: number } | undefined)
				? (
						db.prepare("SELECT id FROM projects WHERE is_inbox=1").get() as {
							id: number;
						}
					).id
				: 1,
			title: "Test task",
		});

		const before = listUnsyncedChanges(db);
		expect(before.length).toBeGreaterThan(0);

		const pushed = await pushChanges(db, backend);
		expect(pushed).toBe(before.length);

		const after = listUnsyncedChanges(db);
		expect(after.length).toBe(0);

		const devices = await backend.listDevices();
		expect(devices.length).toBe(1);
	});

	it("returns 0 when there are no unsynced changes", async () => {
		const db = makeDb();
		const backend = new MemorySyncBackend();
		const pushed = await pushChanges(db, backend);
		expect(pushed).toBe(0);
	});
});

describe("pullAndMerge - field-level last-write-wins", () => {
	beforeEach(() => {
		process.env.TODO_DB_PATH = `/tmp/finish-em-test-sync-${Date.now()}.db`;
		resetDbForTests();
	});
	afterEach(() => {
		resetDbForTests();
		delete process.env.TODO_DB_PATH;
	});

	it("applies incoming field changes that are newer than local", async () => {
		const db = makeDb();
		const backend = new MemorySyncBackend();
		getOrCreateDeviceId(db);

		const inboxId = (
			db.prepare("SELECT id FROM projects WHERE is_inbox=1").get() as {
				id: number;
			}
		).id;
		const task = createTask({ projectId: inboxId, title: "Original" });
		const taskRow = db
			.prepare("SELECT uuid FROM tasks WHERE id = ?")
			.get(task.id) as { uuid: string };

		// Flush local changes
		await pushChanges(db, backend);
		backend.clear();

		// Simulate a remote device updating the title with a newer timestamp
		const remoteTs = new Date(Date.now() + 10_000).toISOString();
		const remoteChangeset: Changeset = {
			deviceId: "remote-device",
			timestamp: remoteTs,
			changes: [
				{
					entityType: "task",
					entityUuid: taskRow.uuid,
					field: "title",
					value: "Updated by remote",
					updatedAt: remoteTs,
				},
			],
		};
		await backend.push("remote-device", remoteChangeset);

		const pulled = await pullAndMerge(db, backend);
		expect(pulled).toBe(1);

		const updatedRow = db
			.prepare("SELECT title FROM tasks WHERE id = ?")
			.get(task.id) as { title: string };
		expect(updatedRow.title).toBe("Updated by remote");
	});

	it("does NOT apply incoming field changes that are older than local", async () => {
		const db = makeDb();
		const backend = new MemorySyncBackend();
		getOrCreateDeviceId(db);

		const inboxId = (
			db.prepare("SELECT id FROM projects WHERE is_inbox=1").get() as {
				id: number;
			}
		).id;
		const task = createTask({ projectId: inboxId, title: "Current" });
		const taskRow = db
			.prepare("SELECT uuid, updated_at FROM tasks WHERE id = ?")
			.get(task.id) as { uuid: string; updated_at: string };

		// Remote has an older timestamp
		const olderTs = new Date(
			new Date(taskRow.updated_at).getTime() - 10_000,
		).toISOString();
		const remoteChangeset: Changeset = {
			deviceId: "remote-device",
			timestamp: olderTs,
			changes: [
				{
					entityType: "task",
					entityUuid: taskRow.uuid,
					field: "title",
					value: "Stale remote title",
					updatedAt: olderTs,
				},
			],
		};
		await backend.push("remote-device", remoteChangeset);
		await pullAndMerge(db, backend);

		const row = db
			.prepare("SELECT title FROM tasks WHERE id = ?")
			.get(task.id) as { title: string };
		expect(row.title).toBe("Current");
	});

	it("merges independent field edits from two devices without losing either", async () => {
		const db = makeDb();
		const backend = new MemorySyncBackend();
		getOrCreateDeviceId(db);

		const inboxId = (
			db.prepare("SELECT id FROM projects WHERE is_inbox=1").get() as {
				id: number;
			}
		).id;
		const task = createTask({
			projectId: inboxId,
			title: "Original",
			notes: "original notes",
		});
		const taskRow = db
			.prepare("SELECT uuid, updated_at FROM tasks WHERE id = ?")
			.get(task.id) as { uuid: string; updated_at: string };

		const baseTs = new Date(taskRow.updated_at).getTime();

		// Device A (us) updates title
		const tsA = new Date(baseTs + 1000).toISOString();
		const remoteChangesetA: Changeset = {
			deviceId: "device-a",
			timestamp: tsA,
			changes: [
				{
					entityType: "task",
					entityUuid: taskRow.uuid,
					field: "title",
					value: "Title from A",
					updatedAt: tsA,
				},
			],
		};

		// Device B updates notes with a different timestamp
		const tsB = new Date(baseTs + 2000).toISOString();
		const remoteChangesetB: Changeset = {
			deviceId: "device-b",
			timestamp: tsB,
			changes: [
				{
					entityType: "task",
					entityUuid: taskRow.uuid,
					field: "notes",
					value: "Notes from B",
					updatedAt: tsB,
				},
			],
		};

		await backend.push("device-a", remoteChangesetA);
		await backend.push("device-b", remoteChangesetB);
		await pullAndMerge(db, backend);

		const row = db
			.prepare("SELECT title, notes FROM tasks WHERE id = ?")
			.get(task.id) as { title: string; notes: string };
		expect(row.title).toBe("Title from A");
		expect(row.notes).toBe("Notes from B");
	});
});

describe("fullSync - bidirectional two-device scenario", () => {
	let dbPathA: string;
	let dbPathB: string;

	beforeEach(() => {
		const ts = Date.now();
		dbPathA = `/tmp/finish-em-test-sync-a-${ts}.db`;
		dbPathB = `/tmp/finish-em-test-sync-b-${ts}.db`;
	});

	afterEach(() => {
		resetDbForTests();
		delete process.env.TODO_DB_PATH;
		// Clean up test db files
		try {
			require("node:fs").unlinkSync(dbPathA);
		} catch {}
		try {
			require("node:fs").unlinkSync(dbPathB);
		} catch {}
	});

	it("syncs a task created on device A to device B", async () => {
		const sharedBackend = new MemorySyncBackend();

		// Device A: create a task
		process.env.TODO_DB_PATH = dbPathA;
		resetDbForTests();
		const dbA = makeDb();
		const inboxIdA = (
			dbA.prepare("SELECT id FROM projects WHERE is_inbox=1").get() as {
				id: number;
			}
		).id;
		const taskA = createTask({ projectId: inboxIdA, title: "Task from A" });
		const taskARow = dbA
			.prepare("SELECT uuid FROM tasks WHERE id = ?")
			.get(taskA.id) as { uuid: string };
		await fullSync(dbA, sharedBackend);

		// Device B: sync pulls the task
		process.env.TODO_DB_PATH = dbPathB;
		resetDbForTests();
		const dbB = makeDb();
		setSyncMeta(dbB, "device_id", "device-b");
		await fullSync(dbB, sharedBackend);

		const rowB = dbB
			.prepare("SELECT title FROM tasks WHERE uuid = ?")
			.get(taskARow.uuid) as { title: string } | undefined;
		expect(rowB?.title).toBe("Task from A");
	});
});

describe("backfillUuids", () => {
	beforeEach(() => {
		process.env.TODO_DB_PATH = `/tmp/finish-em-test-sync-${Date.now()}.db`;
		resetDbForTests();
	});
	afterEach(() => {
		resetDbForTests();
		delete process.env.TODO_DB_PATH;
	});

	it("fills uuid for rows that have none", () => {
		const db = makeDb();
		// Force a null uuid
		const inboxId = (
			db.prepare("SELECT id FROM projects WHERE is_inbox=1").get() as {
				id: number;
			}
		).id;
		db.prepare("UPDATE projects SET uuid = NULL WHERE id = ?").run(inboxId);

		backfillUuids(db);

		const row = db
			.prepare("SELECT uuid FROM projects WHERE id = ?")
			.get(inboxId) as { uuid: string | null };
		expect(row.uuid).not.toBeNull();
		expect(row.uuid).toMatch(/^[0-9a-f-]{36}$/);
	});
});

describe("changelog tracking in repos", () => {
	beforeEach(() => {
		process.env.TODO_DB_PATH = `/tmp/finish-em-test-sync-${Date.now()}.db`;
		resetDbForTests();
	});
	afterEach(() => {
		resetDbForTests();
		delete process.env.TODO_DB_PATH;
	});

	it("records a changelog entry when a task is created", () => {
		const db = makeDb();
		const inboxId = (
			db.prepare("SELECT id FROM projects WHERE is_inbox=1").get() as {
				id: number;
			}
		).id;
		createTask({ projectId: inboxId, title: "Hello" });
		const changes = listUnsyncedChanges(db);
		expect(
			changes.some((c) => c.entity_type === "task" && c.field_name === "*"),
		).toBe(true);
	});

	it("records field-level entries when a task is updated", () => {
		const db = makeDb();
		const inboxId = (
			db.prepare("SELECT id FROM projects WHERE is_inbox=1").get() as {
				id: number;
			}
		).id;
		const task = createTask({ projectId: inboxId, title: "Hello" });
		markChangesSynced(
			db,
			listUnsyncedChanges(db).map((c) => c.id),
		);

		updateTask(task.id, { title: "World" });

		const changes = listUnsyncedChanges(db);
		expect(
			changes.some(
				(c) =>
					c.entity_type === "task" &&
					c.field_name === "title" &&
					c.new_value === "World",
			),
		).toBe(true);
	});

	it("records a delete tombstone when a task is deleted", () => {
		const db = makeDb();
		const inboxId = (
			db.prepare("SELECT id FROM projects WHERE is_inbox=1").get() as {
				id: number;
			}
		).id;
		const task = createTask({ projectId: inboxId, title: "To delete" });
		markChangesSynced(
			db,
			listUnsyncedChanges(db).map((c) => c.id),
		);

		deleteTask(task.id);

		const changes = listUnsyncedChanges(db);
		expect(
			changes.some(
				(c) =>
					c.entity_type === "task" &&
					c.field_name === "*" &&
					c.new_value === null,
			),
		).toBe(true);
	});

	it("records a changelog entry when a goal is created and updated", () => {
		const db = makeDb();
		const goal = createGoal({
			periodType: "weekly",
			periodStart: "2026-03-17",
			title: "Ship it",
		});
		markChangesSynced(
			db,
			listUnsyncedChanges(db).map((c) => c.id),
		);

		updateGoal(goal.id, { done: true });

		const changes = listUnsyncedChanges(db);
		expect(
			changes.some(
				(c) =>
					c.entity_type === "goal" &&
					c.field_name === "done" &&
					c.new_value === "1",
			),
		).toBe(true);
	});
});
