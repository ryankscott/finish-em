import type {
	AppSettings,
	AssistantMessage,
	Goal,
	Project,
	Reminder,
	Task,
} from "../server/types";

type TaskQuery = {
	projectId?: number;
	status?: "open" | "completed";
	from?: string;
	to?: string;
	priority?: 1 | 2 | 3 | 4;
	noDueDate?: boolean;
	parentTaskId?: number | null;
	rootsOnly?: boolean;
};

export type ApiClient = {
	getSettings: () => Promise<AppSettings>;
	updateSettings: (
		input: Partial<{
			timezone: string;
			aiProvider: "gemini" | "openai" | "lmstudio";
			aiBaseUrl: string | null;
			aiModel: string | null;
			aiApiKey: string | null;
			clearAiApiKey: boolean;
		}>,
	) => Promise<AppSettings>;
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
		},
	) => Promise<Task>;
	deleteTask: (taskId: number) => Promise<void>;
	completeTask: (taskId: number) => Promise<Task>;
	uncompleteTask: (taskId: number) => Promise<Task>;
	createQuickAdd: (text: string) => Promise<Task>;
	createProject: (input: {
		name: string;
		color?: string;
		isInbox?: boolean;
	}) => Promise<Project>;
	listTaskReminders: (taskId: number) => Promise<Reminder[]>;
	createReminder: (
		taskId: number,
		input: { remindAt: string; status?: Reminder["status"] },
	) => Promise<Reminder>;
	deleteReminder: (reminderId: number) => Promise<void>;
	getAssistantState: (surface: "ui" | "tui") => Promise<{
		settings: AppSettings;
		messages: AssistantMessage[];
	}>;
	sendAssistantChat: (input: {
		surface: "ui" | "tui";
		message: string;
	}) => Promise<{
		userMessage: AssistantMessage;
		assistantMessage: AssistantMessage;
	}>;
	decideAssistantAction: (input: {
		surface: "ui" | "tui";
		messageId: number;
		actionId: string;
		decision: "confirm" | "cancel";
	}) => Promise<{ message: AssistantMessage }>;
	clearAssistantMessages: (
		surface: "ui" | "tui",
	) => Promise<{ ok: boolean; deleted: number }>;
};

const joinUrl = (baseUrl: string, path: string) =>
	`${baseUrl.replace(/\/$/, "")}${path}`;

const getErrorMessage = (payload: unknown): string | null => {
	if (typeof payload === "string" && payload.trim().length > 0) {
		return payload;
	}

	if (payload && typeof payload === "object") {
		const maybeMessage = (payload as { message?: unknown }).message;
		if (typeof maybeMessage === "string" && maybeMessage.trim().length > 0) {
			return maybeMessage;
		}

		const maybeError = (payload as { error?: unknown }).error;
		if (typeof maybeError === "string" && maybeError.trim().length > 0) {
			return maybeError;
		}
	}

	return null;
};

export const createApi = (baseUrl: string): ApiClient => {
	const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
		const response = await fetch(joinUrl(baseUrl, path), {
			...init,
			headers: {
				"content-type": "application/json",
				...(init?.headers ?? {}),
			},
		});

		const rawText = await response.text();
		let parsedBody: unknown = null;
		if (rawText.length > 0) {
			try {
				parsedBody = JSON.parse(rawText);
			} catch {
				parsedBody = rawText;
			}
		}

		if (!response.ok) {
			const detail =
				getErrorMessage(parsedBody) ??
				(response.statusText || `HTTP ${response.status}`);
			throw new Error(`Request failed (${response.status}): ${detail}`);
		}

		return parsedBody as T;
	};

	return {
		getSettings: () => request<AppSettings>("/api/settings"),
		updateSettings: (input) =>
			request<AppSettings>("/api/settings", {
				method: "PATCH",
				body: JSON.stringify(input),
			}),
		listProjects: () => request<Project[]>("/api/projects"),
		listTasks: (query = {}) => {
			const params = new URLSearchParams();
			if (query.projectId !== undefined)
				params.set("projectId", String(query.projectId));
			if (query.status !== undefined) params.set("status", query.status);
			if (query.from !== undefined) params.set("from", query.from);
			if (query.to !== undefined) params.set("to", query.to);
			if (query.priority !== undefined)
				params.set("priority", String(query.priority));
			if (query.noDueDate !== undefined)
				params.set("noDueDate", query.noDueDate ? "true" : "false");
			if (query.parentTaskId !== undefined && query.parentTaskId !== null) {
				params.set("parentTaskId", String(query.parentTaskId));
			}
			if (query.rootsOnly !== undefined)
				params.set("rootsOnly", query.rootsOnly ? "true" : "false");
			const suffix =
				params.toString().length > 0 ? `?${params.toString()}` : "";
			return request<Task[]>(`/api/tasks${suffix}`);
		},
		createTask: (input) =>
			request<Task>("/api/tasks", {
				method: "POST",
				body: JSON.stringify(input),
			}),
		listGoals: (query = {}) => {
			const params = new URLSearchParams();
			if (query.periodType !== undefined)
				params.set("periodType", query.periodType);
			if (query.periodStart !== undefined)
				params.set("periodStart", query.periodStart);
			const suffix =
				params.toString().length > 0 ? `?${params.toString()}` : "";
			return request<Goal[]>(`/api/goals${suffix}`);
		},
		createGoal: (input) =>
			request<Goal>("/api/goals", {
				method: "POST",
				body: JSON.stringify(input),
			}),
		updateGoal: (goalId, input) =>
			request<Goal>(`/api/goals/${goalId}`, {
				method: "PATCH",
				body: JSON.stringify(input),
			}),
		deleteGoal: async (goalId) => {
			await request<{ ok: boolean }>(`/api/goals/${goalId}`, {
				method: "DELETE",
			});
		},
		updateTask: (taskId, input) =>
			request<Task>(`/api/tasks/${taskId}`, {
				method: "PATCH",
				body: JSON.stringify(input),
			}),
		deleteTask: async (taskId) => {
			await request<{ ok: boolean }>(`/api/tasks/${taskId}`, {
				method: "DELETE",
			});
		},
		completeTask: async (taskId) => {
			const result = await request<{ task?: Task }>(
				`/api/tasks/${taskId}/complete`,
				{
					method: "POST",
				},
			);
			if (!result.task) {
				throw new Error("Task completion response missing task");
			}
			return result.task;
		},
		uncompleteTask: (taskId) =>
			request<Task>(`/api/tasks/${taskId}/uncomplete`, { method: "POST" }),
		createQuickAdd: async (text) => {
			const result = await request<{ task: Task }>("/api/quick-add/create", {
				method: "POST",
				body: JSON.stringify({ text }),
			});
			return result.task;
		},
		createProject: (input) =>
			request<Project>("/api/projects", {
				method: "POST",
				body: JSON.stringify(input),
			}),
		listTaskReminders: (taskId) =>
			request<Reminder[]>(`/api/tasks/${taskId}/reminders`),
		createReminder: (taskId, input) =>
			request<Reminder>(`/api/tasks/${taskId}/reminders`, {
				method: "POST",
				body: JSON.stringify(input),
			}),
		deleteReminder: async (reminderId) => {
			await request<{ ok: boolean }>(`/api/reminders/${reminderId}`, {
				method: "DELETE",
			});
		},
		getAssistantState: (surface) =>
			request<{
				settings: AppSettings;
				messages: AssistantMessage[];
			}>(`/api/assistant?surface=${surface}`),
		sendAssistantChat: (input) =>
			request<{
				userMessage: AssistantMessage;
				assistantMessage: AssistantMessage;
			}>("/api/assistant/chat", {
				method: "POST",
				body: JSON.stringify(input),
			}),
		decideAssistantAction: (input) =>
			request<{ message: AssistantMessage }>(
				"/api/assistant/actions/decision",
				{
					method: "POST",
					body: JSON.stringify(input),
				},
			),
		clearAssistantMessages: (surface) =>
			request<{ ok: boolean; deleted: number }>(
				`/api/assistant/messages?surface=${surface}`,
				{
					method: "DELETE",
				},
			),
	};
};
