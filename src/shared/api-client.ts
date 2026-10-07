import type { SnoozePreset } from "../server/services/reminders";
import type {
	AppSettings,
	CalendarEvent,
	CompletionLog,
	DayLog,
	Goal,
	Project,
	ProjectResourceInput,
	Reminder,
	Task,
} from "../server/types";

export type TaskQuery = {
	projectId?: number;
	status?: "open" | "completed";
	from?: string;
	to?: string;
	priority?: 1 | 2 | 3 | 4;
	noDueDate?: boolean;
	parentTaskId?: number | null;
	rootsOnly?: boolean;
	someday?: boolean;
	recurring?: boolean;
	/** Commitment window on `scheduledAt`, as opposed to from/to on `dueAt`. */
	scheduledFrom?: string;
	scheduledTo?: string;
	unplanned?: boolean;
};

export type ApiClient = {
	/**
	 * Monotonic counter bumped by every server-side write. Clients poll this
	 * instead of re-reading every table on a timer; see
	 * src/server/repos/change-version.ts.
	 */
	getChanges: () => Promise<{ version: number }>;
	getSettings: () => Promise<AppSettings>;
	updateSettings: (
		input: Partial<{
			timezone: string;
			calendarIcsUrl: string | null;
		}>,
	) => Promise<AppSettings>;
	listCalendarEvents: (query?: {
		from?: string;
		to?: string;
	}) => Promise<CalendarEvent[]>;
	refreshCalendar: () => Promise<{ count: number; lastSyncedAt: string }>;
	linkTaskToEvent: (taskId: number, eventUid: string | null) => Promise<Task>;
	listProjects: () => Promise<Project[]>;
	listTasks: (query?: TaskQuery) => Promise<Task[]>;
	createTask: (input: {
		projectId: number;
		parentTaskId?: number | null;
		title: string;
		notes?: string;
		priority?: 1 | 2 | 3 | 4;
		scheduledAt?: string | null;
		dueAt?: string | null;
		dueTimezone?: string | null;
		recurrencePreset?:
			| "daily"
			| "weekly"
			| "monthly"
			| "yearly"
			| "every_weekday"
			| null;
		recurrenceRRule?: string | null;
		someday?: boolean;
		estimateMinutes?: number | null;
	}) => Promise<Task>;
	listGoals: (query?: {
		periodType?: "daily" | "weekly";
		periodStart?: string;
	}) => Promise<Goal[]>;
	createGoal: (input: {
		periodType: "daily" | "weekly";
		periodStart: string;
		title: string;
		done?: boolean;
	}) => Promise<Goal>;
	updateGoal: (
		goalId: number,
		input: { title?: string; done?: boolean },
	) => Promise<Goal>;
	deleteGoal: (goalId: number) => Promise<void>;
	updateTask: (
		taskId: number,
		input: {
			title?: string;
			notes?: string;
			projectId?: number;
			parentTaskId?: number | null;
			priority?: 1 | 2 | 3 | 4;
			scheduledAt?: string | null;
			dueAt?: string | null;
			dueTimezone?: string;
			recurrencePreset?:
				| "daily"
				| "weekly"
				| "monthly"
				| "yearly"
				| "every_weekday"
				| null;
			recurrenceRRule?: string | null;
			someday?: boolean;
			estimateMinutes?: number | null;
			plannedStartAt?: string | null;
		},
	) => Promise<Task>;
	deleteTask: (taskId: number) => Promise<void>;
	listDeletedTasks: () => Promise<Task[]>;
	undeleteTask: (taskId: number) => Promise<Task>;
	completeTask: (taskId: number) => Promise<Task>;
	/** Commit an ordered list of tasks to one day, replacing that day's plan. */
	planDay: (day: string, taskIds: number[]) => Promise<Task[]>;
	startTask: (taskId: number) => Promise<Task>;
	stopTask: (taskId: number) => Promise<Task>;
	getDayLog: (day: string) => Promise<DayLog>;
	markDayPlanned: (day: string) => Promise<DayLog>;
	markDayClosed: (day: string) => Promise<DayLog>;
	uncompleteTask: (taskId: number) => Promise<Task>;
	createProject: (input: {
		name: string;
		emoji?: string | null;
		description?: string;
		startAt?: string | null;
		endAt?: string | null;
		color?: string;
		isInbox?: boolean;
		resources?: ProjectResourceInput[];
	}) => Promise<Project>;
	updateProject: (
		projectId: number,
		input: {
			name?: string;
			emoji?: string | null;
			description?: string;
			startAt?: string | null;
			endAt?: string | null;
			color?: string;
			isInbox?: boolean;
			resources?: ProjectResourceInput[];
		},
	) => Promise<Project>;
	deleteProject: (projectId: number) => Promise<void>;
	reorderProjects: (projectIds: number[]) => Promise<Project[]>;
	listTaskReminders: (taskId: number) => Promise<Reminder[]>;
	listDueReminders: () => Promise<(Reminder & { taskTitle: string })[]>;
	listAllReminders: () => Promise<(Reminder & { taskTitle: string })[]>;
	createReminder: (
		taskId: number,
		input: { remindAt: string; status?: Reminder["status"] },
	) => Promise<Reminder>;
	deleteReminder: (reminderId: number) => Promise<void>;
	markRemindersFired: (ids: number[]) => Promise<{ fired: number }>;
	dismissReminder: (reminderId: number) => Promise<Reminder>;
	snoozeReminder: (
		reminderId: number,
		input: { preset: SnoozePreset; customMinutes?: number },
	) => Promise<Reminder>;
	getCompletionHistory: (taskId: number) => Promise<CompletionLog[]>;
	listCompletions: (query?: {
		from?: string;
		to?: string;
	}) => Promise<CompletionLog[]>;
};
