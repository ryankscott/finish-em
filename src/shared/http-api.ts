/**
 * HTTP implementation of ApiClient. Used by the web frontend (with
 * window.fetch) and by contract tests (with Hono's app.request).
 */

import type { ApiClient, TaskQuery } from "./api-client";

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

async function parse<T>(response: Response): Promise<T> {
	const body = await response.json().catch(() => null);
	if (!response.ok) {
		const message =
			body && typeof body === "object" && "error" in body
				? String((body as { error: unknown }).error)
				: `Request failed with status ${response.status}`;
		throw new Error(message);
	}
	return body as T;
}

function queryString(query: Record<string, unknown>): string {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value === undefined) continue;
		params.set(key, value === null ? "null" : String(value));
	}
	const qs = params.toString();
	return qs ? `?${qs}` : "";
}

export function createHttpApi(fetchFn: FetchLike, baseUrl = ""): ApiClient {
	const request = async <T>(
		method: string,
		path: string,
		body?: unknown,
	): Promise<T> => {
		const response = await fetchFn(`${baseUrl}${path}`, {
			method,
			headers:
				body === undefined ? undefined : { "Content-Type": "application/json" },
			body: body === undefined ? undefined : JSON.stringify(body),
		});
		return parse<T>(response);
	};

	return {
		getSettings: () => request("GET", "/api/settings"),
		updateSettings: (input) => request("PATCH", "/api/settings", input),

		listProjects: () => request("GET", "/api/projects"),
		createProject: (input) => request("POST", "/api/projects", input),
		updateProject: (projectId, input) =>
			request("PATCH", `/api/projects/${projectId}`, input),
		deleteProject: async (projectId) => {
			await request("DELETE", `/api/projects/${projectId}`);
		},

		listTasks: (query: TaskQuery = {}) =>
			request("GET", `/api/tasks${queryString(query)}`),
		createTask: (input) => request("POST", "/api/tasks", input),
		updateTask: (taskId, input) =>
			request("PATCH", `/api/tasks/${taskId}`, input),
		deleteTask: async (taskId) => {
			await request("DELETE", `/api/tasks/${taskId}`);
		},
		listDeletedTasks: () => request("GET", "/api/tasks/deleted"),
		undeleteTask: (taskId) => request("POST", `/api/tasks/${taskId}/undelete`),
		completeTask: (taskId) => request("POST", `/api/tasks/${taskId}/complete`),
		uncompleteTask: (taskId) =>
			request("POST", `/api/tasks/${taskId}/uncomplete`),

		listGoals: (query = {}) =>
			request("GET", `/api/goals${queryString(query)}`),
		createGoal: (input) => request("POST", "/api/goals", input),
		updateGoal: (goalId, input) =>
			request("PATCH", `/api/goals/${goalId}`, input),
		deleteGoal: async (goalId) => {
			await request("DELETE", `/api/goals/${goalId}`);
		},

		listTaskReminders: (taskId) =>
			request("GET", `/api/tasks/${taskId}/reminders`),
		listDueReminders: () => request("GET", "/api/reminders/due"),
		listAllReminders: () => request("GET", "/api/reminders"),
		createReminder: (taskId, input) =>
			request("POST", `/api/tasks/${taskId}/reminders`, input),
		deleteReminder: async (reminderId) => {
			await request("DELETE", `/api/reminders/${reminderId}`);
		},

		getSyncStatus: () => request("GET", "/api/sync"),
		enableSync: () => request("POST", "/api/sync/enable"),
		disableSync: () => request("POST", "/api/sync/disable"),
		syncNow: () => request("POST", "/api/sync/now"),
	};
}
