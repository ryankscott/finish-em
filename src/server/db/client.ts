import { Database } from "bun:sqlite";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { SCHEMA_STATEMENTS } from "./schema";

// Minimal interface used by repos/services on top of bun:sqlite
type StatementRunResult = {
	changes: number;
	lastInsertRowid: number | bigint;
};

type DbStatement = {
	all(...params: unknown[]): unknown[];
	get(...params: unknown[]): unknown;
	run(...params: unknown[]): StatementRunResult;
};

type DbLike = {
	prepare(sql: string): DbStatement;
	exec(sql: string): void;
	close(): void;
};

function openSqliteDb(filePath: string): DbLike {
	const raw = new Database(filePath);
	return {
		prepare(sql: string): DbStatement {
			const stmt = raw.prepare(sql);
			return {
				all(...params) {
					return stmt.all(...params);
				},
				get(...params) {
					return stmt.get(...params);
				},
				run(...params) {
					stmt.run(...params);
					const meta = raw
						.query("SELECT last_insert_rowid() AS lid, changes() AS ch")
						.get() as { lid: number; ch: number } | null;
					return { changes: meta?.ch ?? 0, lastInsertRowid: meta?.lid ?? 0 };
				},
			};
		},
		exec(sql) {
			raw.exec(sql);
		},
		close() {
			raw.close();
		},
	};
}

let dbInstance: DbLike | null = null;

function getDbPath() {
	const override = process.env.TODO_DB_PATH;
	if (override && override.trim().length > 0) {
		return path.resolve(override);
	}
	return path.join(os.homedir(), ".finish-em", "todo.db");
}

function seedDefaults(db: DbLike) {
	const now = new Date().toISOString();

	const settingsCount = db
		.prepare("SELECT COUNT(*) as count FROM settings")
		.get() as { count: number };

	if (settingsCount.count === 0) {
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
		db.prepare(
			"INSERT INTO settings (id, timezone, created_at, updated_at) VALUES (1, ?, ?, ?)",
		).run(timezone, now, now);
	}

	const inboxCount = db
		.prepare("SELECT COUNT(*) as count FROM projects WHERE is_inbox = 1")
		.get() as { count: number };

	if (inboxCount.count === 0) {
		db.prepare(
			"INSERT INTO projects (name, color, is_inbox, created_at, updated_at) VALUES (?, ?, 1, ?, ?)",
		).run("Inbox", "#ef4444", now, now);
	}
}

function ensureTaskSubtaskSchema(db: DbLike) {
	const tasksTable = db
		.prepare(
			"SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tasks'",
		)
		.get() as { name?: string } | undefined;

	if (!tasksTable?.name) {
		return;
	}

	const columns = db.prepare("PRAGMA table_info(tasks)").all() as Array<{
		name: unknown;
	}>;
	const hasParentTaskId = columns.some(
		(column) => String(column.name) === "parent_task_id",
	);

	if (!hasParentTaskId) {
		db.exec(
			"ALTER TABLE tasks ADD COLUMN parent_task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE",
		);
	}

	db.exec(
		"CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id)",
	);
}

function ensureSoftDeleteSchema(db: DbLike) {
	const tasksTable = db
		.prepare(
			"SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tasks'",
		)
		.get() as { name?: string } | undefined;

	if (!tasksTable?.name) {
		return;
	}

	const columns = db.prepare("PRAGMA table_info(tasks)").all() as Array<{
		name: unknown;
	}>;
	const hasDeletedAt = columns.some(
		(column) => String(column.name) === "deleted_at",
	);

	if (!hasDeletedAt) {
		db.exec("ALTER TABLE tasks ADD COLUMN deleted_at TEXT");
	}

	db.exec(
		"CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks(deleted_at)",
	);
}

function ensureSomedaySchema(db: DbLike) {
	const tasksTable = db
		.prepare(
			"SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tasks'",
		)
		.get() as { name?: string } | undefined;

	if (!tasksTable?.name) {
		return;
	}

	const columns = db.prepare("PRAGMA table_info(tasks)").all() as Array<{
		name: unknown;
	}>;
	const hasSomeday = columns.some(
		(column) => String(column.name) === "someday",
	);

	if (!hasSomeday) {
		db.exec("ALTER TABLE tasks ADD COLUMN someday INTEGER NOT NULL DEFAULT 0");
	}
}

function ensureProjectEnhancementsSchema(db: DbLike) {
	const projectsTable = db
		.prepare(
			"SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'projects'",
		)
		.get() as { name?: string } | undefined;

	if (!projectsTable?.name) {
		return;
	}

	const columns = db.prepare("PRAGMA table_info(projects)").all() as Array<{
		name: unknown;
	}>;

	const hasEmoji = columns.some((column) => String(column.name) === "emoji");
	const hasDescription = columns.some(
		(column) => String(column.name) === "description",
	);
	const hasStartAt = columns.some(
		(column) => String(column.name) === "start_at",
	);
	const hasEndAt = columns.some((column) => String(column.name) === "end_at");

	if (!hasEmoji) {
		db.exec("ALTER TABLE projects ADD COLUMN emoji TEXT");
	}
	if (!hasDescription) {
		db.exec(
			"ALTER TABLE projects ADD COLUMN description TEXT NOT NULL DEFAULT ''",
		);
	}
	if (!hasStartAt) {
		db.exec("ALTER TABLE projects ADD COLUMN start_at TEXT");
	}
	if (!hasEndAt) {
		db.exec("ALTER TABLE projects ADD COLUMN end_at TEXT");
	}
}

function ensureProjectExternalLinksSchema(db: DbLike) {
	const projectsTable = db
		.prepare(
			"SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'projects'",
		)
		.get() as { name?: string } | undefined;

	if (!projectsTable?.name) {
		return;
	}

	const columns = db.prepare("PRAGMA table_info(projects)").all() as Array<{
		name: unknown;
	}>;

	const hasJiraDiscoveryUrl = columns.some(
		(column) => String(column.name) === "jira_discovery_url",
	);
	const hasJiraDeliveryUrl = columns.some(
		(column) => String(column.name) === "jira_delivery_url",
	);
	const hasConfluenceUrl = columns.some(
		(column) => String(column.name) === "confluence_url",
	);

	if (!hasJiraDiscoveryUrl) {
		db.exec("ALTER TABLE projects ADD COLUMN jira_discovery_url TEXT");
	}
	if (!hasJiraDeliveryUrl) {
		db.exec("ALTER TABLE projects ADD COLUMN jira_delivery_url TEXT");
	}
	if (!hasConfluenceUrl) {
		db.exec("ALTER TABLE projects ADD COLUMN confluence_url TEXT");
	}
}

function ensureProjectMetaLinksSchema(db: DbLike) {
	const projectsTable = db
		.prepare(
			"SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'projects'",
		)
		.get() as { name?: string } | undefined;

	if (!projectsTable?.name) {
		return;
	}

	const columns = db.prepare("PRAGMA table_info(projects)").all() as Array<{
		name: unknown;
	}>;

	const columnNames = columns.map((c) => String(c.name));

	if (!columnNames.includes("jira_docs_url")) {
		db.exec("ALTER TABLE projects ADD COLUMN jira_docs_url TEXT");
	}
	if (!columnNames.includes("jira_release_note_url")) {
		db.exec("ALTER TABLE projects ADD COLUMN jira_release_note_url TEXT");
	}
	if (!columnNames.includes("teams_release_note_url")) {
		db.exec("ALTER TABLE projects ADD COLUMN teams_release_note_url TEXT");
	}
}

function dropProjectStatusColumns(db: DbLike) {
	const projectsTable = db
		.prepare(
			"SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'projects'",
		)
		.get() as { name?: string } | undefined;

	if (!projectsTable?.name) {
		return;
	}

	const columns = db.prepare("PRAGMA table_info(projects)").all() as Array<{
		name: unknown;
	}>;

	const columnNames = columns.map((c) => String(c.name));

	for (const col of [
		"jira_discovery_status",
		"jira_delivery_status",
		"jira_docs_status",
		"jira_release_note_status",
		"analytics_url",
		"analytics_status",
	]) {
		if (columnNames.includes(col)) {
			db.exec(`ALTER TABLE projects DROP COLUMN ${col}`);
		}
	}
}

function ensureSyncSchema(db: DbLike) {
	// sync_meta and sync_changelog are created by SCHEMA_STATEMENTS on new DBs,
	// but existing DBs that pre-date migration 007 need the tables and uuid columns added.
	const syncMetaExists = db
		.prepare(
			"SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sync_meta'",
		)
		.get() as { name?: string } | undefined;
	if (!syncMetaExists?.name) {
		db.exec(
			`CREATE TABLE IF NOT EXISTS sync_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
		);
	}

	const syncChangelogExists = db
		.prepare(
			"SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sync_changelog'",
		)
		.get() as { name?: string } | undefined;
	if (!syncChangelogExists?.name) {
		db.exec(`CREATE TABLE IF NOT EXISTS sync_changelog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_uuid TEXT NOT NULL,
      field_name TEXT NOT NULL,
      new_value TEXT,
      updated_at TEXT NOT NULL,
      device_id TEXT NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    )`);
		db.exec(
			"CREATE INDEX IF NOT EXISTS idx_sync_changelog_synced ON sync_changelog(synced)",
		);
		db.exec(
			"CREATE INDEX IF NOT EXISTS idx_sync_changelog_entity ON sync_changelog(entity_type, entity_uuid)",
		);
	}

	// Add uuid columns to entity tables if missing
	for (const [table, index] of [
		["tasks", "idx_tasks_uuid"],
		["projects", "idx_projects_uuid"],
		["goals", "idx_goals_uuid"],
		["reminders", "idx_reminders_uuid"],
	] as const) {
		const tableExists = db
			.prepare(
				`SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${table}'`,
			)
			.get() as { name?: string } | undefined;
		if (!tableExists?.name) continue;

		const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{
			name: unknown;
		}>;
		if (!columns.some((c) => String(c.name) === "uuid")) {
			db.exec(`ALTER TABLE ${table} ADD COLUMN uuid TEXT`);
		}
		db.exec(
			`CREATE UNIQUE INDEX IF NOT EXISTS ${index} ON ${table}(uuid) WHERE uuid IS NOT NULL`,
		);
	}
}

const BACKUP_RETENTION = 14;

function pruneBackups(backupsDir: string) {
	let entries: string[];
	try {
		entries = fs.readdirSync(backupsDir);
	} catch {
		return;
	}
	const backups = entries
		.filter((name) => /^todo-\d{4}-\d{2}-\d{2}\.db$/.test(name))
		.sort();
	while (backups.length > BACKUP_RETENTION) {
		const oldest = backups.shift();
		if (!oldest) break;
		try {
			fs.unlinkSync(path.join(backupsDir, oldest));
		} catch {
			// best effort
		}
	}
}

/**
 * Takes a consistent, point-in-time snapshot of the database before any schema
 * work runs. Backups are kept once per day (rotated) so an accidental schema
 * rewrite or data loss can be restored in seconds. Disabled for tests/temp DBs
 * and via TODO_DB_NO_BACKUP=1.
 */
function maybeBackup(dbPath: string, db: DbLike) {
	if (process.env.TODO_DB_NO_BACKUP === "1") return;
	if (dbPath === ":memory:") return;
	if (
		dbPath.startsWith(`${os.tmpdir()}${path.sep}`) ||
		dbPath.startsWith("/tmp/")
	)
		return;

	const backupsDir = path.join(path.dirname(dbPath), "backups");
	const day = new Date().toISOString().slice(0, 10);
	const target = path.join(backupsDir, `todo-${day}.db`);
	if (fs.existsSync(target)) {
		pruneBackups(backupsDir);
		return;
	}

	try {
		fs.mkdirSync(backupsDir, { recursive: true });
		const tmpTarget = `${target}.tmp`;
		for (const stale of [tmpTarget, `${tmpTarget}-wal`, `${tmpTarget}-shm`]) {
			if (fs.existsSync(stale)) fs.unlinkSync(stale);
		}
		db.exec(`VACUUM INTO '${tmpTarget.replace(/'/g, "''")}'`);
		fs.renameSync(tmpTarget, target);
		pruneBackups(backupsDir);
	} catch (err) {
		console.error("finish-em: automatic DB backup failed:", err);
	}
}

function initialize(db: DbLike) {
	db.exec("PRAGMA foreign_keys = ON");
	// WAL + busy timeout so the TUI/CLI and the desktop HTTP server can share the DB
	db.exec("PRAGMA journal_mode = WAL");
	db.exec("PRAGMA busy_timeout = 5000");
	for (const statement of SCHEMA_STATEMENTS) {
		db.exec(statement);
	}
	ensureTaskSubtaskSchema(db);
	ensureProjectEnhancementsSchema(db);
	ensureProjectExternalLinksSchema(db);
	ensureProjectMetaLinksSchema(db);
	dropProjectStatusColumns(db);
	ensureSoftDeleteSchema(db);
	ensureSomedaySchema(db);
	ensureSyncSchema(db);
	seedDefaults(db);
}

export function getDb() {
	if (dbInstance) {
		return dbInstance;
	}

	const dbPath = getDbPath();
	const dir = path.dirname(dbPath);

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	const isNewDb = !fs.existsSync(dbPath);

	// Orphaned WAL sidecars (main DB deleted, -wal/-shm left behind) make
	// SQLite fail with a disk I/O error when re-enabling WAL mode.
	if (isNewDb) {
		for (const suffix of ["-wal", "-shm"]) {
			const sidecar = `${dbPath}${suffix}`;
			if (fs.existsSync(sidecar)) {
				fs.unlinkSync(sidecar);
			}
		}
	}

	dbInstance = openSqliteDb(dbPath);

	// Snapshot existing data before any schema work runs, so a future accidental
	// schema rewrite can be restored. Skipped for brand-new (empty) databases.
	if (!isNewDb) {
		maybeBackup(dbPath, dbInstance);
	}

	initialize(dbInstance);

	return dbInstance;
}

export function nowIso() {
	return new Date().toISOString();
}

export function resetDbForTests() {
	const resolved = path.resolve(getDbPath());
	const productionPath = path.resolve(
		path.join(os.homedir(), ".finish-em", "todo.db"),
	);
	if (resolved === productionPath) {
		throw new Error(
			`resetDbForTests() refused: TODO_DB_PATH resolves to the production database (${productionPath}). ` +
				"Point TODO_DB_PATH at a temp file in your test's beforeEach before calling resetDbForTests(), " +
				"otherwise test setup/teardown would mutate or drop real data.",
		);
	}
	if (dbInstance) {
		dbInstance.close();
		dbInstance = null;
	}
}
