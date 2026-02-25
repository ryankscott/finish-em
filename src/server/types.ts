export type Priority = 1 | 2 | 3 | 4
export type TaskStatus = 'open' | 'completed'
export type GoalPeriod = 'daily' | 'weekly'
export type ReminderStatus = 'pending' | 'fired' | 'snoozed' | 'dismissed'

export type RecurrencePreset =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'every_weekday'
  | null

export type Project = {
  id: number
  name: string
  emoji: string | null
  description: string
  startAt: string | null
  endAt: string | null
  color: string
  isInbox: boolean
  createdAt: string
  updatedAt: string
}

export type Task = {
  id: number
  projectId: number
  parentTaskId: number | null
  title: string
  notes: string
  priority: Priority
  scheduledAt: string | null
  dueAt: string | null
  dueTimezone: string | null
  recurrencePreset: RecurrencePreset
  recurrenceRRule: string | null
  status: TaskStatus
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export type Reminder = {
  id: number
  taskId: number
  remindAt: string
  status: ReminderStatus
  snoozedUntil: string | null
  createdAt: string
  updatedAt: string
}

export type Goal = {
  id: number
  periodType: GoalPeriod
  periodStart: string
  title: string
  done: boolean
  createdAt: string
  updatedAt: string
}

export type AiProvider = 'gemini' | 'openai' | 'lmstudio'

export type AppSettings = {
  id: 1
  timezone: string
  aiProvider: AiProvider
  aiBaseUrl: string | null
  aiModel: string | null
  hasAiApiKey: boolean
  aiApiKeyMasked: string | null
  createdAt: string
  updatedAt: string
}

export type AppSettingsSecrets = {
  aiApiKey: string | null
}

export type AssistantSurface = 'ui' | 'tui'
export type AssistantRole = 'user' | 'assistant' | 'system'
export type AssistantActionType =
  | 'create_task'
  | 'update_task'
  | 'set_task_due_date'
  | 'complete_task'
  | 'uncomplete_task'
  | 'delete_task'
  | 'create_project'
  | 'update_project'
  | 'delete_project'
export type AssistantActionStatus = 'pending' | 'executed' | 'cancelled' | 'failed'

export type AssistantActionOutcomeStatus = 'success' | 'failure' | 'cancelled'

export type AssistantActionOutcome = {
  actionId: string
  type: AssistantActionType
  targetEntity: 'task' | 'project' | null
  targetId: number | null
  status: AssistantActionOutcomeStatus
  message: string
  errorCode: string | null
}

export type AssistantAction = {
  id: string
  type: AssistantActionType
  label: string
  status: AssistantActionStatus
  payload: Record<string, unknown>
  resultMessage: string | null
  outcome: AssistantActionOutcome | null
}

export type AssistantMessage = {
  id: number
  surface: AssistantSurface
  role: AssistantRole
  content: string
  actions: AssistantAction[]
  createdAt: string
  updatedAt: string
}

export type AssistantChatResponse = {
  userMessage: AssistantMessage
  assistantMessage: AssistantMessage
}

export type TaskFilters = {
  projectId?: number
  status?: TaskStatus
  from?: string
  to?: string
  noDueDate?: boolean
  priority?: Priority
  parentTaskId?: number | null
  rootsOnly?: boolean
}
