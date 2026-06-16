// REFERENCE ONLY - this is NOT the source of truth for the database schema and
// is intentionally incomplete (it omits sync_meta, sync_changelog,
// assistant_messages, the uuid columns, and several project columns).
//
// The live schema is owned by SCHEMA_STATEMENTS + the ensure*Schema guards in
// ./client.ts and the SQL migrations applied via `bun run db:migrate`. Never run
// `drizzle-kit push`/`studio`/`migrate` against the live database - drizzle.config.ts
// hard-blocks that, because it would drop the tables/columns missing from this file.
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const settings = sqliteTable("settings", {
	id: integer("id").primaryKey(),
	timezone: text("timezone").notNull(),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const projects = sqliteTable("projects", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	emoji: text("emoji"),
	description: text("description").notNull().default(""),
	startAt: text("start_at"),
	endAt: text("end_at"),
	color: text("color").notNull().default("#ef4444"),
	isInbox: integer("is_inbox", { mode: "boolean" }).notNull().default(false),
	jiraDiscoveryUrl: text("jira_discovery_url"),
	jiraDeliveryUrl: text("jira_delivery_url"),
	confluenceUrl: text("confluence_url"),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const tasks = sqliteTable("tasks", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	projectId: integer("project_id")
		.notNull()
		.references(() => projects.id, { onDelete: "cascade" }),
	parentTaskId: integer("parent_task_id").references(
		(): AnySQLiteColumn => tasks.id,
		{ onDelete: "cascade" },
	),
	title: text("title").notNull(),
	notes: text("notes").notNull().default(""),
	priority: integer("priority").notNull().default(4),
	scheduledAt: text("scheduled_at"),
	dueAt: text("due_at"),
	dueTimezone: text("due_timezone"),
	recurrencePreset: text("recurrence_preset"),
	recurrenceRRule: text("recurrence_rrule"),
	status: text("status").notNull().default("open"),
	someday: integer("someday", { mode: "boolean" }).notNull().default(false),
	completedAt: text("completed_at"),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const reminders = sqliteTable("reminders", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	taskId: integer("task_id")
		.notNull()
		.references(() => tasks.id, { onDelete: "cascade" }),
	remindAt: text("remind_at").notNull(),
	status: text("status").notNull().default("pending"),
	snoozedUntil: text("snoozed_until"),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});

export const goals = sqliteTable("goals", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	periodType: text("period_type").notNull(),
	periodStart: text("period_start").notNull(),
	title: text("title").notNull(),
	done: integer("done", { mode: "boolean" }).notNull().default(false),
	createdAt: text("created_at").notNull(),
	updatedAt: text("updated_at").notNull(),
});
