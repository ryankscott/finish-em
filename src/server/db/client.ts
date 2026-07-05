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

function ensureProjectSortOrderSchema(db: DbLike) {
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
	const hasSortOrder = columns.some(
		(column) => String(column.name) === "sort_order",
	);

	if (hasSortOrder) {
		return;
	}

	db.exec("ALTER TABLE projects ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0");

	// Backfill sort_order for existing projects using the previous ordering
	// (alphabetical), so the initial drag-and-drop order matches what users saw.
	const rows = db
		.prepare(
			"SELECT id FROM projects WHERE is_inbox = 0 ORDER BY name ASC, id ASC",
		)
		.all() as Array<{ id: number }>;
	const update = db.prepare("UPDATE projects SET sort_order = ? WHERE id = ?");
	rows.forEach((row, index) => {
		update.run(index, Number(row.id));
	});
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

function ensureCalendarSettingsSchema(db: DbLike) {
	const settingsTable = db
		.prepare(
			"SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'settings'",
		)
		.get() as { name?: string } | undefined;

	if (!settingsTable?.name) {
		return;
	}

	const columns = db.prepare("PRAGMA table_info(settings)").all() as Array<{
		name: unknown;
	}>;
	const columnNames = columns.map((c) => String(c.name));

	if (!columnNames.includes("calendar_ics_url")) {
		db.exec("ALTER TABLE settings ADD COLUMN calendar_ics_url TEXT");
	}
	if (!columnNames.includes("calendar_last_synced_at")) {
		db.exec("ALTER TABLE settings ADD COLUMN calendar_last_synced_at TEXT");
	}
}

function ensureTaskCalendarLinkSchema(db: DbLike) {
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
	const hasCalendarEventUid = columns.some(
		(column) => String(column.name) === "calendar_event_uid",
	);

	if (!hasCalendarEventUid) {
		db.exec("ALTER TABLE tasks ADD COLUMN calendar_event_uid TEXT");
	}

	db.exec(
		"CREATE INDEX IF NOT EXISTS idx_tasks_calendar_event_uid ON tasks(calendar_event_uid)",
	);
}

function ensureTaskUpdatedAtIndex(db: DbLike) {
	const tasksTable = db
		.prepare(
			"SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'tasks'",
		)
		.get() as { name?: string } | undefined;

	if (!tasksTable?.name) {
		return;
	}

	db.exec(
		"CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at)",
	);
}

function ensureTaskCompletionLogSchema(db: DbLike) {
	db.exec(`CREATE TABLE IF NOT EXISTS task_completion_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      completed_at TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )`);
	db.exec(
		"CREATE INDEX IF NOT EXISTS idx_task_completion_log_task_date ON task_completion_log(task_id, completed_at)",
	);
	db.exec(
		"CREATE INDEX IF NOT EXISTS idx_task_completion_log_completed_at ON task_completion_log(completed_at)",
	);
}

const LEGACY_PROJECT_LINK_COLUMNS: Array<{ column: string; label: string }> = [
	{ column: "jira_discovery_url", label: "Jira Discovery" },
	{ column: "jira_delivery_url", label: "Jira Delivery" },
	{ column: "confluence_url", label: "Confluence PRD" },
	{ column: "jira_docs_url", label: "Jira Docs" },
	{ column: "jira_release_note_url", label: "Jira Release Note" },
	{ column: "teams_release_note_url", label: "Teams Release Note" },
];

function ensureProjectResourcesSchema(db: DbLike) {
	db.exec(`CREATE TABLE IF NOT EXISTS project_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      label TEXT NOT NULL,
      url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    )`);
	db.exec(
		"CREATE INDEX IF NOT EXISTS idx_project_resources_project ON project_resources(project_id, sort_order)",
	);

	// One-time backfill: copy any populated legacy per-column links into the
	// generic table with sensible default labels. Runs only while the table is
	// empty so it never duplicates rows on subsequent boots.
	const projectsTable = db
		.prepare(
			"SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'projects'",
		)
		.get() as { name?: string } | undefined;
	if (!projectsTable?.name) {
		return;
	}

	const existing = db
		.prepare("SELECT COUNT(*) AS n FROM project_resources")
		.get() as { n: number };
	if (existing.n > 0) {
		return;
	}

	const columns = db.prepare("PRAGMA table_info(projects)").all() as Array<{
		name: unknown;
	}>;
	const columnNames = new Set(columns.map((c) => String(c.name)));
	const present = LEGACY_PROJECT_LINK_COLUMNS.filter((entry) =>
		columnNames.has(entry.column),
	);
	if (present.length === 0) {
		return;
	}

	const now = new Date().toISOString();
	const selectCols = present.map((entry) => entry.column).join(", ");
	const rows = db
		.prepare(`SELECT id, ${selectCols} FROM projects`)
		.all() as Array<Record<string, unknown>>;
	const insert = db.prepare(
		"INSERT INTO project_resources (project_id, label, url, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
	);
	for (const row of rows) {
		let sortOrder = 0;
		for (const entry of present) {
			const value = row[entry.column];
			if (value) {
				insert.run(
					Number(row.id),
					entry.label,
					String(value),
					sortOrder,
					now,
					now,
				);
				sortOrder += 1;
			}
		}
	}
}

function ensureUuidColumns(db: DbLike) {
	// Entity rows carry a stable uuid (originally added for multi-device sync,
	// now retained as a durable external identifier). New DBs don't define uuid
	// in the base schema, and older DBs may pre-date it, so add it where missing.
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
	ensureProjectResourcesSchema(db);
	ensureProjectSortOrderSchema(db);
	dropProjectStatusColumns(db);
	ensureSoftDeleteSchema(db);
	ensureSomedaySchema(db);
	ensureTaskUpdatedAtIndex(db);
	ensureCalendarSettingsSchema(db);
	ensureTaskCalendarLinkSchema(db);
	ensureTaskCompletionLogSchema(db);
	ensureUuidColumns(db);
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
