/**
 * bun:sqlite implementation of the Db seam, for local development and tests.
 *
 * The deployed Worker uses d1.ts instead. This exists so `bun run server:dev`
 * and `bun test` keep working without miniflare in the loop.
 *
 * Schema comes from the same migrations/*.sql files that wrangler applies to
 * D1 -- there is exactly one schema definition in the repo. This replaced
 * SCHEMA_STATEMENTS plus the 14 ensure*Schema guards that used to run on every
 * getDb(); those decided what to add via PRAGMA table_info and sqlite_master
 * introspection, which D1 does not support.
 */

import { Database } from "bun:sqlite";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import type { BatchOp, Db, DbRunResult, DbStatement } from "./types";

type SqliteBindings = Parameters<
	ReturnType<Database["prepare"]>["all"]
>[number][];

const MIGRATIONS_DIR = path.join(import.meta.dir, "../../../migrations");

function readMigrations(): string[] {
	return fs
		.readdirSync(MIGRATIONS_DIR)
		.filter((name) => name.endsWith(".sql"))
		.sort()
		.map((name) => fs.readFileSync(path.join(MIGRATIONS_DIR, name), "utf8"));
}

export function getDbPath() {
	const override = process.env.TODO_DB_PATH;
	if (override && override.trim().length > 0) {
		return path.resolve(override);
	}
	return path.join(os.homedir(), ".finish-em", "todo.db");
}

/**
 * Wraps bun:sqlite's synchronous API in the async Db seam. `run()` reports
 * changes/lastInsertRowid via a follow-up query, mirroring what D1 returns in
 * result.meta.
 */
function wrap(raw: Database): Db {
	const statement = (sql: string): DbStatement => ({
		async all<T>(...params: unknown[]): Promise<T[]> {
			return raw.prepare(sql).all(...(params as SqliteBindings)) as T[];
		},
		async get<T>(...params: unknown[]): Promise<T | null> {
			return (raw.prepare(sql).get(...(params as SqliteBindings)) ??
				null) as T | null;
		},
		async run(...params: unknown[]): Promise<DbRunResult> {
			raw.prepare(sql).run(...(params as SqliteBindings));
			const meta = raw
				.query("SELECT last_insert_rowid() AS lid, changes() AS ch")
				.get() as { lid: number; ch: number } | null;
			return { changes: meta?.ch ?? 0, lastInsertRowid: meta?.lid ?? 0 };
		},
	});

	return {
		prepare: statement,
		async batch(ops: BatchOp[]): Promise<void> {
			if (ops.length === 0) return;
			// D1's batch is atomic, so the local backend must be too, otherwise a
			// mid-batch failure would leave different state in dev than in prod.
			raw.transaction(() => {
				for (const op of ops) {
					raw.prepare(op.sql).run(...((op.params ?? []) as SqliteBindings));
				}
			})();
		},
	};
}

let dbInstance: Db | null = null;
let rawInstance: Database | null = null;

export function getDb(): Db {
	if (dbInstance) {
		return dbInstance;
	}

	const dbPath = getDbPath();
	const dir = path.dirname(dbPath);

	if (dbPath !== ":memory:" && !fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	const isNewDb = dbPath === ":memory:" || !fs.existsSync(dbPath);

	// Orphaned WAL sidecars (main DB deleted, -wal/-shm left behind) make
	// SQLite fail with a disk I/O error when re-enabling WAL mode.
	if (isNewDb && dbPath !== ":memory:") {
		for (const suffix of ["-wal", "-shm"]) {
			const sidecar = `${dbPath}${suffix}`;
			if (fs.existsSync(sidecar)) {
				fs.unlinkSync(sidecar);
			}
		}
	}

	const raw = new Database(dbPath);
	raw.exec("PRAGMA foreign_keys = ON");
	if (dbPath !== ":memory:") {
		raw.exec("PRAGMA journal_mode = WAL");
		raw.exec("PRAGMA busy_timeout = 5000");
	}

	// CREATE TABLE in 0001 is unconditional, so only apply to a fresh database.
	// An existing local file has already been migrated.
	if (isNewDb) {
		for (const sql of readMigrations()) {
			raw.exec(sql);
		}
	}

	rawInstance = raw;
	dbInstance = wrap(raw);
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
	if (rawInstance) {
		rawInstance.close();
		rawInstance = null;
	}
	dbInstance = null;
}
