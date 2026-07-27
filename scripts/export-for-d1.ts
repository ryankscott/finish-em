#!/usr/bin/env bun
/**
 * Exports the local SQLite database as D1-compatible INSERT statements.
 *
 * Writes explicit column names on every INSERT. This matters: the D1 schema in
 * migrations/0001_init.sql deliberately reorders columns (uuid moved to
 * position 2, the ALTER-TABLE-appended columns folded into sensible places), so
 * the positional `INSERT INTO t VALUES(...)` that `sqlite3 .mode insert`
 * produces would write values into the wrong columns.
 *
 * Only exports tables and columns that exist in the D1 schema; the legacy
 * sync_changelog / sync_meta / assistant_messages / schema_migrations tables and
 * the settings.ai_* and tasks.blocked_* columns are intentionally left behind.
 *
 * Usage:
 *   bun scripts/export-for-d1.ts > /tmp/finish-em-data.sql
 *   TODO_DB_PATH=/path/to/todo.db bun scripts/export-for-d1.ts > out.sql
 */
import { Database } from "bun:sqlite";
import os from "node:os";
import path from "node:path";

/**
 * Insert order matters: parents before children, so the foreign keys resolve.
 * projects -> tasks (project_id, and parent_task_id self-reference)
 * tasks -> reminders, task_completion_log
 */
const TABLES: Array<{ name: string; columns: string[] }> = [
	{
		name: "settings",
		columns: [
			"id",
			"timezone",
			"calendar_ics_url",
			"calendar_last_synced_at",
			"created_at",
			"updated_at",
		],
	},
	{
		name: "projects",
		columns: [
			"id",
			"uuid",
			"name",
			"emoji",
			"description",
			"start_at",
			"end_at",
			"color",
			"is_inbox",
			"sort_order",
			"jira_discovery_url",
			"jira_delivery_url",
			"jira_docs_url",
			"jira_release_note_url",
			"teams_release_note_url",
			"confluence_url",
			"created_at",
			"updated_at",
		],
	},
	{
		name: "tasks",
		columns: [
			"id",
			"uuid",
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
			"someday",
			"calendar_event_uid",
			"completed_at",
			"deleted_at",
			"created_at",
			"updated_at",
		],
	},
	{
		name: "reminders",
		columns: [
			"id",
			"uuid",
			"task_id",
			"remind_at",
			"status",
			"snoozed_until",
			"created_at",
			"updated_at",
		],
	},
	{
		name: "goals",
		columns: [
			"id",
			"uuid",
			"period_type",
			"period_start",
			"title",
			"done",
			"created_at",
			"updated_at",
		],
	},
	{
		name: "calendar_events",
		columns: [
			"id",
			"uid",
			"recurrence_id",
			"summary",
			"start_at",
			"end_at",
			"all_day",
			"location",
			"organizer",
			"last_seen_at",
			"updated_at",
		],
	},
	{
		name: "project_resources",
		columns: [
			"id",
			"project_id",
			"label",
			"url",
			"sort_order",
			"created_at",
			"updated_at",
		],
	},
	{
		name: "task_completion_log",
		columns: [
			"id",
			"task_id",
			"title",
			"completed_at",
			"notes",
			"created_at",
		],
	},
];

function getDbPath() {
	const override = process.env.TODO_DB_PATH;
	if (override && override.trim().length > 0) return path.resolve(override);
	return path.join(os.homedir(), ".finish-em", "todo.db");
}

function literal(value: unknown): string {
	if (value === null || value === undefined) return "NULL";
	if (typeof value === "number") return String(value);
	if (typeof value === "bigint") return String(value);
	if (typeof value === "boolean") return value ? "1" : "0";
	if (value instanceof Uint8Array) {
		const hex = Array.from(value)
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");
		return `X'${hex}'`;
	}
	// Single quotes double up; everything else (newlines, unicode, emoji) is
	// valid inside a SQLite string literal as-is.
	return `'${String(value).replace(/'/g, "''")}'`;
}

const db = new Database(getDbPath(), { readonly: true });

const out: string[] = [];
out.push("-- finish-em data export for Cloudflare D1");
out.push(`-- source: ${getDbPath()}`);
out.push("-- schema: migrations/0001_init.sql");
out.push("");
out.push("DELETE FROM task_completion_log;");
out.push("DELETE FROM project_resources;");
out.push("DELETE FROM calendar_events;");
out.push("DELETE FROM goals;");
out.push("DELETE FROM reminders;");
out.push("DELETE FROM tasks;");
out.push("DELETE FROM projects;");
out.push("DELETE FROM settings;");
out.push("");

const counts: Record<string, number> = {};

for (const { name, columns } of TABLES) {
	const quoted = columns.join(", ");
	const rows = db.prepare(`SELECT ${quoted} FROM ${name}`).all() as Array<
		Record<string, unknown>
	>;
	counts[name] = rows.length;
	if (rows.length === 0) continue;

	out.push(`-- ${name}: ${rows.length} rows`);
	for (const row of rows) {
		const values = columns.map((c) => literal(row[c])).join(", ");
		out.push(`INSERT INTO ${name} (${quoted}) VALUES (${values});`);
	}
	out.push("");
}

db.close();

console.log(out.join("\n"));

const summary = Object.entries(counts)
	.map(([t, n]) => `${t}=${n}`)
	.join(" ");
console.error(`exported ${summary}`);
