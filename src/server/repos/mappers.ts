import type {
  AppSettings,
  AssistantAction,
  AssistantActionStatus,
  AssistantActionType,
  AssistantMessage,
  AssistantRole,
  AssistantSurface,
  Goal,
  GoalPeriod,
  Priority,
  Project,
  Reminder,
  ReminderStatus,
  Task,
  TaskStatus,
} from '@/server/types'

const assistantActionTypes: AssistantActionType[] = [
  'create_task',
  'update_task',
  'complete_task',
  'uncomplete_task',
  'delete_task',
  'create_project',
]

const assistantActionStatuses: AssistantActionStatus[] = [
  'pending',
  'executed',
  'cancelled',
  'failed',
]

export function mapProjectRow(row: Record<string, unknown>): Project {
  return {
    id: Number(row.id),
    name: String(row.name),
    emoji: row.emoji ? String(row.emoji) : null,
    description: String(row.description ?? ''),
    startAt: row.start_at ? String(row.start_at) : null,
    endAt: row.end_at ? String(row.end_at) : null,
    color: String(row.color),
    isInbox: Number(row.is_inbox) === 1,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
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
    recurrencePreset: (row.recurrence_preset as Task['recurrencePreset']) ?? null,
    recurrenceRRule: row.recurrence_rrule ? String(row.recurrence_rrule) : null,
    status: String(row.status) as TaskStatus,
    completedAt: row.completed_at ? String(row.completed_at) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
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
  }
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
  }
}

export function mapSettingsRow(row: Record<string, unknown>): AppSettings {
  const rawApiKey =
    typeof row.ai_api_key === 'string' && row.ai_api_key.trim().length > 0
      ? row.ai_api_key.trim()
      : null

  const aiApiKeyMasked =
    rawApiKey && rawApiKey.length > 8
      ? `${rawApiKey.slice(0, 4)}...${rawApiKey.slice(-4)}`
      : rawApiKey
        ? '***'
        : null

  const aiProviderRaw =
    typeof row.ai_provider === 'string' ? row.ai_provider.trim() : ''
  const aiProvider =
    aiProviderRaw === 'gemini' || aiProviderRaw === 'openai' || aiProviderRaw === 'lmstudio'
      ? aiProviderRaw
      : 'gemini'

  return {
    id: 1,
    timezone: String(row.timezone),
    aiProvider,
    aiBaseUrl:
      typeof row.ai_base_url === 'string' && row.ai_base_url.trim().length > 0
        ? row.ai_base_url.trim()
        : null,
    aiModel:
      typeof row.ai_model === 'string' && row.ai_model.trim().length > 0
        ? row.ai_model.trim()
        : null,
    hasAiApiKey: rawApiKey !== null,
    aiApiKeyMasked,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

function parseAssistantActions(value: unknown): AssistantAction[] {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return []
  }

  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) {
      return []
    }

    const actions: AssistantAction[] = []
    for (const item of parsed) {
      if (!item || typeof item !== 'object') {
        continue
      }
      const candidate = item as Record<string, unknown>
      const type = String(candidate.type)
      const status = String(candidate.status)
      if (!assistantActionTypes.includes(type as AssistantActionType)) {
        continue
      }
      if (!assistantActionStatuses.includes(status as AssistantActionStatus)) {
        continue
      }
      actions.push({
        id: String(candidate.id),
        type: type as AssistantActionType,
        label: String(candidate.label ?? ''),
        status: status as AssistantActionStatus,
        payload:
          candidate.payload && typeof candidate.payload === 'object'
            ? (candidate.payload as Record<string, unknown>)
            : {},
        resultMessage:
          candidate.resultMessage === null || candidate.resultMessage === undefined
            ? null
            : String(candidate.resultMessage),
      })
    }

    return actions
  } catch {
    return []
  }
}

export function mapAssistantMessageRow(
  row: Record<string, unknown>,
): AssistantMessage {
  return {
    id: Number(row.id),
    surface: String(row.surface) as AssistantSurface,
    role: String(row.role) as AssistantRole,
    content: String(row.content),
    actions: parseAssistantActions(row.actions_json),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}
