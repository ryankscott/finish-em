import type {
  AppSettings,
  AssistantMessage,
  Goal,
  Project,
  Reminder,
  Task,
} from '@/server/types'

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
  getSettings: () => request<AppSettings>('/api/settings'),
  updateSettings: (
    payload: Partial<{
      timezone: string
      aiProvider: 'gemini' | 'openai' | 'lmstudio'
      aiBaseUrl: string | null
      aiModel: string | null
      aiApiKey: string | null
      clearAiApiKey: boolean
    }>,
  ) =>
    request<AppSettings>('/api/settings', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  listProjects: () => request<Project[]>('/api/projects'),
  getProject: (projectId: number) => request<Project>(`/api/projects/${projectId}`),
  createProject: (payload: {
    name: string
    emoji?: string | null
    description?: string
    startAt?: string | null
    endAt?: string | null
    color?: string
  }) =>
    request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProject: (
    projectId: number,
    payload: Partial<{
      name: string
      emoji: string | null
      description: string
      startAt: string | null
      endAt: string | null
      color: string
      isInbox: boolean
    }>,
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
  createTask: (payload: {
    projectId: number
    parentTaskId?: number | null
    title: string
    notes?: string
    priority?: 1 | 2 | 3 | 4
    scheduledAt?: string | null
    dueAt?: string | null
    dueTimezone?: string | null
    recurrencePreset?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'every_weekday' | null
    recurrenceRRule?: string | null
  }) =>
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

  listGoals: (query?: { periodType?: 'daily' | 'weekly'; periodStart?: string }) => {
    const params = new URLSearchParams()
    if (query?.periodType) {
      params.set('periodType', query.periodType)
    }
    if (query?.periodStart) {
      params.set('periodStart', query.periodStart)
    }
    const suffix = params.size ? `?${params.toString()}` : ''
    return request<Goal[]>(`/api/goals${suffix}`)
  },
  createGoal: (payload: {
    periodType: 'daily' | 'weekly'
    periodStart: string
    title: string
    done?: boolean
  }) => request<Goal>('/api/goals', { method: 'POST', body: JSON.stringify(payload) }),
  updateGoal: (goalId: number, payload: Partial<Goal>) =>
    request<Goal>(`/api/goals/${goalId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteGoal: (goalId: number) =>
    request<{ ok: boolean }>(`/api/goals/${goalId}`, { method: 'DELETE' }),

  parseQuickAdd: (text: string) =>
    request('/api/quick-add/parse', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
  createQuickAdd: (text: string, options?: { parentTaskId?: number | null }) =>
    request<{ task: Task; parse: Record<string, unknown> }>('/api/quick-add/create', {
      method: 'POST',
      body: JSON.stringify({
        text,
        parentTaskId: options?.parentTaskId,
      }),
    }),

  getAssistantState: (surface: 'ui' | 'tui') =>
    request<{
      settings: AppSettings
      messages: AssistantMessage[]
    }>(`/api/assistant?surface=${surface}`),
  sendAssistantChat: (payload: { surface: 'ui' | 'tui'; message: string }) =>
    request<{
      userMessage: AssistantMessage
      assistantMessage: AssistantMessage
    }>('/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  decideAssistantAction: (payload: {
    surface: 'ui' | 'tui'
    messageId: number
    actionId: string
    decision: 'confirm' | 'cancel'
  }) =>
    request<{
      message: AssistantMessage
    }>('/api/assistant/actions/decision', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  clearAssistantMessages: (surface: 'ui' | 'tui') =>
    request<{ ok: boolean; deleted: number }>(
      `/api/assistant/messages?surface=${surface}`,
      { method: 'DELETE' },
    ),

  getOpenApiSpec: () => request('/api/openapi/json'),
}
