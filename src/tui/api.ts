import type { Goal, Project, Reminder, Task } from "../server/types"

type TaskQuery = {
	projectId?: number
	status?: "open" | "completed"
	from?: string
	to?: string
	priority?: 1 | 2 | 3 | 4
	noDueDate?: boolean
}

type ApiClient = {
	listProjects: () => Promise<Project[]>
	listTasks: (query?: TaskQuery) => Promise<Task[]>
	listGoals: (query?: { periodType?: "daily" | "weekly"; periodStart?: string }) => Promise<Goal[]>
	createGoal: (input: { periodType: "daily" | "weekly"; periodStart: string; title: string; done?: boolean }) => Promise<Goal>
	updateGoal: (goalId: number, input: { title?: string; done?: boolean }) => Promise<Goal>
	deleteGoal: (goalId: number) => Promise<void>
	updateTask: (taskId: number, input: { title?: string; notes?: string }) => Promise<Task>
	deleteTask: (taskId: number) => Promise<void>
	completeTask: (taskId: number) => Promise<Task>
	uncompleteTask: (taskId: number) => Promise<Task>
	createQuickAdd: (text: string) => Promise<Task>
	createProject: (input: { name: string; color?: string; isInbox?: boolean }) => Promise<Project>
	listTaskReminders: (taskId: number) => Promise<Reminder[]>
	createReminder: (taskId: number, input: { remindAt: string; status?: Reminder["status"] }) => Promise<Reminder>
	deleteReminder: (reminderId: number) => Promise<void>
}

const joinUrl = (baseUrl: string, path: string) => `${baseUrl.replace(/\/$/, "")}${path}`

const getErrorMessage = (payload: unknown): string | null => {
	if (typeof payload === "string" && payload.trim().length > 0) {
		return payload
	}

	if (payload && typeof payload === "object") {
		const maybeMessage = (payload as { message?: unknown }).message
		if (typeof maybeMessage === "string" && maybeMessage.trim().length > 0) {
			return maybeMessage
		}

		const maybeError = (payload as { error?: unknown }).error
		if (typeof maybeError === "string" && maybeError.trim().length > 0) {
			return maybeError
		}
	}

	return null
}

export const createApi = (baseUrl: string): ApiClient => {
	const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
		const response = await fetch(joinUrl(baseUrl, path), {
			...init,
			headers: {
				"content-type": "application/json",
				...(init?.headers ?? {}),
			},
		})

		const rawText = await response.text()
		let parsedBody: unknown = null
		if (rawText.length > 0) {
			try {
				parsedBody = JSON.parse(rawText)
			} catch {
				parsedBody = rawText
			}
		}

		if (!response.ok) {
			const detail = getErrorMessage(parsedBody) ?? (response.statusText || `HTTP ${response.status}`)
			throw new Error(`Request failed (${response.status}): ${detail}`)
		}

		return parsedBody as T
	}

	return {
		listProjects: () => request<Project[]>("/api/projects"),
		listTasks: (query = {}) => {
			const params = new URLSearchParams()
			if (query.projectId !== undefined) params.set("projectId", String(query.projectId))
			if (query.status !== undefined) params.set("status", query.status)
			if (query.from !== undefined) params.set("from", query.from)
			if (query.to !== undefined) params.set("to", query.to)
			if (query.priority !== undefined) params.set("priority", String(query.priority))
			if (query.noDueDate !== undefined) params.set("noDueDate", query.noDueDate ? "true" : "false")
			const suffix = params.toString().length > 0 ? `?${params.toString()}` : ""
			return request<Task[]>(`/api/tasks${suffix}`)
		},
		listGoals: (query = {}) => {
			const params = new URLSearchParams()
			if (query.periodType !== undefined) params.set("periodType", query.periodType)
			if (query.periodStart !== undefined) params.set("periodStart", query.periodStart)
			const suffix = params.toString().length > 0 ? `?${params.toString()}` : ""
			return request<Goal[]>(`/api/goals${suffix}`)
		},
		createGoal: (input) => request<Goal>("/api/goals", {
			method: "POST",
			body: JSON.stringify(input),
		}),
		updateGoal: (goalId, input) => request<Goal>(`/api/goals/${goalId}`, {
			method: "PATCH",
			body: JSON.stringify(input),
		}),
		deleteGoal: async (goalId) => {
			await request<{ ok: boolean }>(`/api/goals/${goalId}`, {
				method: "DELETE",
			})
		},
		updateTask: (taskId, input) => request<Task>(`/api/tasks/${taskId}`, {
			method: "PATCH",
			body: JSON.stringify(input),
		}),
		deleteTask: async (taskId) => {
			await request<{ ok: boolean }>(`/api/tasks/${taskId}`, {
				method: "DELETE",
			})
		},
		completeTask: async (taskId) => {
			const result = await request<{ task?: Task }>(`/api/tasks/${taskId}/complete`, {
				method: "POST",
			})
			if (!result.task) {
				throw new Error("Task completion response missing task")
			}
			return result.task
		},
		uncompleteTask: (taskId) => request<Task>(`/api/tasks/${taskId}/uncomplete`, { method: "POST" }),
		createQuickAdd: async (text) => {
			const result = await request<{ task: Task }>("/api/quick-add/create", {
				method: "POST",
				body: JSON.stringify({ text }),
			})
			return result.task
		},
		createProject: (input) => request<Project>("/api/projects", {
			method: "POST",
			body: JSON.stringify(input),
		}),
		listTaskReminders: (taskId) => request<Reminder[]>(`/api/tasks/${taskId}/reminders`),
		createReminder: (taskId, input) => request<Reminder>(`/api/tasks/${taskId}/reminders`, {
			method: "POST",
			body: JSON.stringify(input),
		}),
		deleteReminder: async (reminderId) => {
			await request<{ ok: boolean }>(`/api/reminders/${reminderId}`, {
				method: "DELETE",
			})
		},
	}
}
