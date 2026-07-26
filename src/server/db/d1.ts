/**
 * Cloudflare D1 implementation of the Db seam.
 *
 * Each call re-prepares from the stored SQL rather than holding a bound
 * D1PreparedStatement. D1 statements are immutable once bound, and repos do
 * reuse a "prepared" handle across loop iterations with different parameters
 * (see setResources), which would silently reuse the first binding otherwise.
 */

import type { BatchOp, Db, DbRunResult, DbStatement } from "./types";

type D1Meta = { changes?: number; last_row_id?: number };
type D1RunResult = { meta?: D1Meta };
type D1AllResult<T> = { results?: T[] };

type D1PreparedStatement = {
	bind(...params: unknown[]): D1PreparedStatement;
	all<T>(): Promise<D1AllResult<T>>;
	first<T>(): Promise<T | null>;
	run(): Promise<D1RunResult>;
};

export type D1Database = {
	prepare(sql: string): D1PreparedStatement;
	batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
};

function bound(
	db: D1Database,
	sql: string,
	params: unknown[],
): D1PreparedStatement {
	const stmt = db.prepare(sql);
	return params.length > 0 ? stmt.bind(...params) : stmt;
}

export function createD1Db(d1: D1Database): Db {
	return {
		prepare(sql: string): DbStatement {
			return {
				async all<T>(...params: unknown[]): Promise<T[]> {
					const result = await bound(d1, sql, params).all<T>();
					return result.results ?? [];
				},
				async get<T>(...params: unknown[]): Promise<T | null> {
					return await bound(d1, sql, params).first<T>();
				},
				async run(...params: unknown[]): Promise<DbRunResult> {
					const result = await bound(d1, sql, params).run();
					return {
						changes: result.meta?.changes ?? 0,
						lastInsertRowid: result.meta?.last_row_id ?? 0,
					};
				},
			};
		},

		async batch(ops: BatchOp[]): Promise<void> {
			if (ops.length === 0) return;
			await d1.batch(ops.map((op) => bound(d1, op.sql, op.params ?? [])));
		},
	};
}
