import type {
	AppSettings,
	CalendarEvent,
	CompletionLog,
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
};

export type ApiClient = {
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
	linkTaskToEvent: (
		taskId: number,
		eventUid: string | null,
	) => Promise<Task>;
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
		},
	) => Promise<Task>;
	deleteTask: (taskId: number) => Promise<void>;
	listDeletedTasks: () => Promise<Task[]>;
	undeleteTask: (taskId: number) => Promise<Task>;
	completeTask: (taskId: number) => Promise<Task>;
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
	getCompletionHistory: (taskId: number) => Promise<CompletionLog[]>;
	listCompletions: (query?: {
		from?: string;
		to?: string;
	}) => Promise<CompletionLog[]>;
};
