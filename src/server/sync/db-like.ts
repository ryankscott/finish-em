/** Minimal database interface shared across sync modules. */
export type DbLike = {
	prepare(sql: string): {
		all(...params: unknown[]): unknown[];
		get(...params: unknown[]): unknown;
		run(...params: unknown[]): {
			changes: number;
			lastInsertRowid: number | bigint;
		};
	};
	exec(sql: string): void;
	close(): void;
};
