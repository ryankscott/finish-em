import { z } from "@hono/zod-openapi";

export const prioritySchema = z
	.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
	.openapi({ description: "Task priority: 1=Urgent, 2=High, 3=Normal, 4=Low" });

export const taskStatusSchema = z.enum(["open", "completed"]);

export const recurrencePresetSchema = z.enum([
	"daily",
	"weekly",
	"monthly",
	"yearly",
	"every_weekday",
]);

export const reminderStatusSchema = z.enum([
	"pending",
	"fired",
	"snoozed",
	"dismissed",
]);

export const goalPeriodSchema = z.enum(["daily", "weekly"]);

export const settingsSchema = z
	.object({
		id: z.literal(1),
		timezone: z.string(),
		createdAt: z.string(),
		updatedAt: z.string(),
	})
	.openapi("Settings");

export const settingsUpdateSchema = z
	.object({
		timezone: z.string().optional(),
	})
	.openapi("SettingsUpdate");

export const projectSchema = z
	.object({
		id: z.number().int(),
		name: z.string(),
		emoji: z.string().nullable(),
		description: z.string(),
		startAt: z.string().nullable(),
		endAt: z.string().nullable(),
		color: z.string(),
		isInbox: z.boolean(),
		jiraDiscoveryUrl: z.string().nullable(),
		jiraDeliveryUrl: z.string().nullable(),
		confluenceUrl: z.string().nullable(),
		jiraDocsUrl: z.string().nullable(),
		jiraReleaseNoteUrl: z.string().nullable(),
		teamsReleaseNoteUrl: z.string().nullable(),
		createdAt: z.string(),
		updatedAt: z.string(),
	})
	.openapi("Project");

const projectInputFields = {
	name: z.string().min(1),
	emoji: z.string().nullable().optional(),
	description: z.string().optional(),
	startAt: z.string().nullable().optional(),
	endAt: z.string().nullable().optional(),
	color: z.string().optional(),
	isInbox: z.boolean().optional(),
	jiraDiscoveryUrl: z.string().nullable().optional(),
	jiraDeliveryUrl: z.string().nullable().optional(),
	confluenceUrl: z.string().nullable().optional(),
	jiraDocsUrl: z.string().nullable().optional(),
	jiraReleaseNoteUrl: z.string().nullable().optional(),
	teamsReleaseNoteUrl: z.string().nullable().optional(),
};

export const projectCreateSchema = z
	.object(projectInputFields)
	.openapi("ProjectCreate");

export const projectUpdateSchema = z
	.object({ ...projectInputFields, name: z.string().min(1).optional() })
	.openapi("ProjectUpdate");

export const taskSchema = z
	.object({
		id: z.number().int(),
		projectId: z.number().int(),
		parentTaskId: z.number().int().nullable(),
		title: z.string(),
		notes: z.string(),
		priority: prioritySchema,
		scheduledAt: z.string().nullable(),
		dueAt: z.string().nullable(),
		dueTimezone: z.string().nullable(),
		recurrencePreset: recurrencePresetSchema.nullable(),
		recurrenceRRule: z.string().nullable(),
		status: taskStatusSchema,
		someday: z.boolean(),
		completedAt: z.string().nullable(),
		deletedAt: z.string().nullable(),
		createdAt: z.string(),
		updatedAt: z.string(),
	})
	.openapi("Task");

export const taskCreateSchema = z
	.object({
		projectId: z.number().int(),
		parentTaskId: z.number().int().nullable().optional(),
		title: z.string().min(1),
		notes: z.string().optional(),
		priority: prioritySchema.optional(),
		scheduledAt: z.string().nullable().optional(),
		dueAt: z.string().nullable().optional(),
		dueTimezone: z.string().nullable().optional(),
		recurrencePreset: recurrencePresetSchema.nullable().optional(),
		recurrenceRRule: z.string().nullable().optional(),
		someday: z.boolean().optional(),
	})
	.openapi("TaskCreate");

export const taskUpdateSchema = z
	.object({
		title: z.string().min(1).optional(),
		notes: z.string().optional(),
		projectId: z.number().int().optional(),
		parentTaskId: z.number().int().nullable().optional(),
		priority: prioritySchema.optional(),
		scheduledAt: z.string().nullable().optional(),
		dueAt: z.string().nullable().optional(),
		dueTimezone: z.string().optional(),
		recurrencePreset: recurrencePresetSchema.nullable().optional(),
		recurrenceRRule: z.string().nullable().optional(),
		someday: z.boolean().optional(),
	})
	.openapi("TaskUpdate");

const queryBoolean = z
	.enum(["true", "false"])
	.transform((value) => value === "true");

export const taskQuerySchema = z
	.object({
		projectId: z.coerce.number().int().optional(),
		status: taskStatusSchema.optional(),
		from: z.string().optional(),
		to: z.string().optional(),
		priority: z.coerce.number().pipe(prioritySchema).optional(),
		noDueDate: queryBoolean.optional(),
		parentTaskId: z
			.string()
			.transform((value) => (value === "null" ? null : Number(value)))
			.optional(),
		rootsOnly: queryBoolean.optional(),
		someday: queryBoolean.optional(),
	})
	.openapi("TaskQuery");

export const goalSchema = z
	.object({
		id: z.number().int(),
		periodType: goalPeriodSchema,
		periodStart: z.string(),
		title: z.string(),
		done: z.boolean(),
		createdAt: z.string(),
		updatedAt: z.string(),
	})
	.openapi("Goal");

export const goalQuerySchema = z.object({
	periodType: goalPeriodSchema.optional(),
	periodStart: z.string().optional(),
});

export const goalCreateSchema = z
	.object({
		periodType: goalPeriodSchema,
		periodStart: z.string(),
		title: z.string().min(1),
		done: z.boolean().optional(),
	})
	.openapi("GoalCreate");

export const goalUpdateSchema = z
	.object({
		title: z.string().min(1).optional(),
		done: z.boolean().optional(),
	})
	.openapi("GoalUpdate");

export const reminderSchema = z
	.object({
		id: z.number().int(),
		taskId: z.number().int(),
		remindAt: z.string(),
		status: reminderStatusSchema,
		snoozedUntil: z.string().nullable(),
		createdAt: z.string(),
		updatedAt: z.string(),
	})
	.openapi("Reminder");

export const reminderWithTitleSchema = reminderSchema
	.extend({ taskTitle: z.string() })
	.openapi("ReminderWithTitle");

export const reminderCreateSchema = z
	.object({
		remindAt: z.string(),
		status: reminderStatusSchema.optional(),
	})
	.openapi("ReminderCreate");

export const syncStatusSchema = z
	.object({
		enabled: z.boolean(),
		deviceId: z.string().nullable(),
		lastSyncAt: z.string().nullable(),
		lastPushAt: z.string().nullable(),
		pendingChanges: z.number().int(),
	})
	.openapi("SyncStatus");

export const syncResultSchema = z
	.object({
		pushed: z.number().int(),
		pulled: z.number().int(),
		inboxImported: z.number().int(),
	})
	.openapi("SyncResult");

export const idParamSchema = z.object({
	id: z.coerce
		.number()
		.int()
		.openapi({ param: { name: "id", in: "path" } }),
});

export const errorSchema = z.object({ error: z.string() }).openapi("Error");

export const emptySchema = z.object({}).openapi("Empty");
