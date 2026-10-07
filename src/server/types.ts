export type Priority = 1 | 2 | 3 | 4;
export type TaskStatus = "open" | "completed";
export type GoalPeriod = "daily" | "weekly";
export type ReminderStatus = "pending" | "fired" | "snoozed" | "dismissed";

export type RecurrencePreset =
	| "daily"
	| "weekly"
	| "monthly"
	| "yearly"
	| "every_weekday"
	| null;

export type ProjectResource = {
	id: number;
	label: string;
	url: string;
	sortOrder: number;
};

export type ProjectResourceInput = {
	label: string;
	url: string;
};

export type Project = {
	id: number;
	name: string;
	emoji: string | null;
	description: string;
	startAt: string | null;
	endAt: string | null;
	color: string;
	isInbox: boolean;
	sortOrder: number;
	resources: ProjectResource[];
	createdAt: string;
	updatedAt: string;
};

export type Task = {
	id: number;
	projectId: number;
	parentTaskId: number | null;
	title: string;
	notes: string;
	priority: Priority;
	scheduledAt: string | null;
	dueAt: string | null;
	dueTimezone: string | null;
	recurrencePreset: RecurrencePreset;
	recurrenceRRule: string | null;
	status: TaskStatus;
	someday: boolean;
	planOrder: number;
	startedAt: string | null;
	estimateMinutes: number | null;
	plannedStartAt: string | null;
	completedAt: string | null;
	deletedAt: string | null;
	calendarEventUid: string | null;
	createdAt: string;
	updatedAt: string;
};

export type CalendarEvent = {
	id: number;
	uid: string;
	recurrenceId: string;
	summary: string;
	startAt: string;
	endAt: string | null;
	allDay: boolean;
	location: string | null;
	organizer: string | null;
};

export type Reminder = {
	id: number;
	taskId: number;
	remindAt: string;
	status: ReminderStatus;
	snoozedUntil: string | null;
	/** When the reminder was first delivered; null until then. */
	firedAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type Goal = {
	id: number;
	periodType: GoalPeriod;
	periodStart: string;
	title: string;
	done: boolean;
	createdAt: string;
	updatedAt: string;
};

export type CompletionLog = {
	id: number;
	taskId: number;
	title: string;
	completedAt: string;
	notes: string;
	createdAt: string;
};

export type AppSettings = {
	id: 1;
	timezone: string;
	calendarIcsUrl: string | null;
	calendarLastSyncedAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type TaskFilters = {
	projectId?: number;
	status?: TaskStatus;
	from?: string;
	to?: string;
	noDueDate?: boolean;
	priority?: Priority;
	parentTaskId?: number | null;
	rootsOnly?: boolean;
	someday?: boolean;
	recurring?: boolean;
	staleBefore?: string;
	/** Commitment window on `scheduled_at`, as opposed to `from`/`to` on `due_at`. */
	scheduledFrom?: string;
	scheduledTo?: string;
	/** Only tasks with no `scheduled_at` -- the backlog. */
	unplanned?: boolean;
};

export type DayLog = {
	day: string;
	plannedAt: string | null;
	closedAt: string | null;
};
