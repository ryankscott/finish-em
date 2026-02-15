import type { Project, Reminder, Task } from '@/server/types'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Request failed (${response.status}): ${body}`)
  }

  return (await response.json()) as T
}

export const api = {
  listProjects: () => request<Project[]>('/api/projects'),
  createProject: (payload: { name: string; color?: string }) =>
    request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProject: (
    projectId: number,
    payload: Partial<{ name: string; color: string; isInbox: boolean }>,
  ) =>
    request<Project>(`/api/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteProject: (projectId: number) =>
    request<{ ok: boolean }>(`/api/projects/${projectId}`, { method: 'DELETE' }),

  listTasks: (query?: Record<string, string | number | boolean | undefined>) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== null) {
        params.set(key, String(value))
      }
    }

    const suffix = params.size > 0 ? `?${params.toString()}` : ''
    return request<Task[]>(`/api/tasks${suffix}`)
  },
  createTask: (payload: Record<string, unknown>) =>
    request<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(payload) }),
  updateTask: (taskId: number, payload: Record<string, unknown>) =>
    request<Task>(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteTask: (taskId: number) =>
    request<{ ok: boolean }>(`/api/tasks/${taskId}`, { method: 'DELETE' }),
  completeTask: (taskId: number) =>
    request<{ task: Task; nextTask: Task | null }>(`/api/tasks/${taskId}/complete`, {
      method: 'POST',
    }),
  uncompleteTask: (taskId: number) =>
    request<Task>(`/api/tasks/${taskId}/uncomplete`, { method: 'POST' }),

  listTaskReminders: (taskId: number) =>
    request<Reminder[]>(`/api/tasks/${taskId}/reminders`),
  createReminder: (taskId: number, payload: { remindAt: string }) =>
    request<Reminder>(`/api/tasks/${taskId}/reminders`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateReminder: (reminderId: number, payload: Record<string, unknown>) =>
    request<Reminder>(`/api/reminders/${reminderId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteReminder: (reminderId: number) =>
    request<{ ok: boolean }>(`/api/reminders/${reminderId}`, { method: 'DELETE' }),
  snoozeReminder: (
    reminderId: number,
    payload: {
      preset:
        | 'this_morning'
        | 'this_evening'
        | 'tomorrow_morning'
        | 'next_week'
        | 'custom'
      customMinutes?: number
    },
  ) =>
    request<Reminder>(`/api/reminders/${reminderId}/snooze`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  parseQuickAdd: (text: string) =>
    request('/api/quick-add/parse', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
  createQuickAdd: (text: string) =>
    request<{ task: Task; parse: Record<string, unknown> }>('/api/quick-add/create', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  getOpenApiSpec: () => request('/api/openapi.json'),
}
