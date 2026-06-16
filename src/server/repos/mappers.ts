import type {
	AppSettings,
	Goal,
	GoalPeriod,
	Priority,
	Project,
	Reminder,
	ReminderStatus,
	Task,
	TaskStatus,
} from "@/server/types";

export function mapProjectRow(row: Record<string, unknown>): Project {
	return {
		id: Number(row.id),
		name: String(row.name),
		emoji: row.emoji ? String(row.emoji) : null,
		description: String(row.description ?? ""),
		startAt: row.start_at ? String(row.start_at) : null,
		endAt: row.end_at ? String(row.end_at) : null,
		color: String(row.color),
		isInbox: Number(row.is_inbox) === 1,
		jiraDiscoveryUrl: row.jira_discovery_url
			? String(row.jira_discovery_url)
			: null,
		jiraDeliveryUrl: row.jira_delivery_url
			? String(row.jira_delivery_url)
			: null,
		confluenceUrl: row.confluence_url ? String(row.confluence_url) : null,
		jiraDocsUrl: row.jira_docs_url ? String(row.jira_docs_url) : null,
		jiraReleaseNoteUrl: row.jira_release_note_url
			? String(row.jira_release_note_url)
			: null,
		teamsReleaseNoteUrl: row.teams_release_note_url
			? String(row.teams_release_note_url)
			: null,
		createdAt: String(row.created_at),
		updatedAt: String(row.updated_at),
	};
}

export function mapTaskRow(row: Record<string, unknown>): Task {
	return {
		id: Number(row.id),
		projectId: Number(row.project_id),
		parentTaskId:
			row.parent_task_id === null || row.parent_task_id === undefined
				? null
				: Number(row.parent_task_id),
		title: String(row.title),
		notes: String(row.notes),
		priority: Number(row.priority) as Priority,
		scheduledAt: row.scheduled_at ? String(row.scheduled_at) : null,
		dueAt: row.due_at ? String(row.due_at) : null,
		dueTimezone: row.due_timezone ? String(row.due_timezone) : null,
		recurrencePreset:
			(row.recurrence_preset as Task["recurrencePreset"]) ?? null,
		recurrenceRRule: row.recurrence_rrule ? String(row.recurrence_rrule) : null,
		status: String(row.status) as TaskStatus,
		someday: Number(row.someday) === 1,
		completedAt: row.completed_at ? String(row.completed_at) : null,
		deletedAt: row.deleted_at ? String(row.deleted_at) : null,
		createdAt: String(row.created_at),
		updatedAt: String(row.updated_at),
	};
}

export function mapReminderRow(row: Record<string, unknown>): Reminder {
	return {
		id: Number(row.id),
		taskId: Number(row.task_id),
		remindAt: String(row.remind_at),
		status: String(row.status) as ReminderStatus,
		snoozedUntil: row.snoozed_until ? String(row.snoozed_until) : null,
		createdAt: String(row.created_at),
		updatedAt: String(row.updated_at),
	};
}

export function mapGoalRow(row: Record<string, unknown>): Goal {
	return {
		id: Number(row.id),
		periodType: String(row.period_type) as GoalPeriod,
		periodStart: String(row.period_start),
		title: String(row.title),
		done: Number(row.done) === 1,
		createdAt: String(row.created_at),
		updatedAt: String(row.updated_at),
	};
}

export function mapSettingsRow(row: Record<string, unknown>): AppSettings {
	return {
		id: 1,
		timezone: String(row.timezone),
		createdAt: String(row.created_at),
		updatedAt: String(row.updated_at),
	};
}
