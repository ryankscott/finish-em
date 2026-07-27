/**
 * The database seam.
 *
 * Repos depend on this interface, never on bun:sqlite or D1 directly, and
 * receive a `Db` as their first argument. There are two implementations:
 *
 *   client.ts  bun:sqlite, for local dev and tests (synchronous underneath,
 *              wrapped in promises)
 *   d1.ts      Cloudflare D1, for the deployed Worker (async, network-backed)
 *
 * Every method is async because D1 is async-only. The shape is deliberately
 * narrow -- prepare/all/get/run plus batch -- so both backends can satisfy it
 * honestly. In particular there is no `exec` for arbitrary multi-statement SQL
 * and no transaction control: D1 rejects explicit BEGIN/COMMIT, so `batch` is
 * the only way to get atomicity and it is the only one offered.
 */

export type DbRunResult = {
	changes: number;
	lastInsertRowid: number;
};

export type DbStatement = {
	all<T = unknown>(...params: unknown[]): Promise<T[]>;
	get<T = unknown>(...params: unknown[]): Promise<T | null>;
	run(...params: unknown[]): Promise<DbRunResult>;
};

/** A single statement in a batch: SQL plus its bound parameters. */
export type BatchOp = {
	sql: string;
	params?: unknown[];
};

export type Db = {
	prepare(sql: string): DbStatement;
	/**
	 * Runs every statement atomically, in order. Replaces the hand-rolled
	 * BEGIN/COMMIT/ROLLBACK that D1 cannot execute, and collapses the N+1
	 * loops that would otherwise be N+1 network round trips on D1.
	 */
	batch(ops: BatchOp[]): Promise<void>;
};
