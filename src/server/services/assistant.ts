import {
  compareDesc,
  endOfDay,
  endOfWeek,
  format,
  isValid,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfWeek,
  subDays,
} from 'date-fns'
import { z } from 'zod/v3'

import {
  clearAssistantMessages,
  createAssistantMessage,
  getAssistantMessage,
  listAssistantMessages,
  updateAssistantMessageActions,
} from '@/server/repos/assistant'
import { listGoals } from '@/server/repos/goals'
import {
  createProject,
  getInboxProjectId,
  listProjects,
} from '@/server/repos/projects'
import { getSettings, getSettingsSecrets } from '@/server/repos/settings'
import {
  completeTask,
  createTask,
  deleteTask,
  getTask,
  listTasks,
  uncompleteTask,
  updateTask,
} from '@/server/repos/tasks'

import type {
  AssistantAction,
  AssistantActionType,
  AssistantChatResponse,
  AssistantMessage,
  AssistantSurface,
  Priority,
  RecurrencePreset,
} from '@/server/types'

const DEFAULT_LOCAL_BASE_URL = 'http://localhost:11434/v1'
const DEFAULT_LMSTUDIO_BASE_URL = 'http://localhost:1234/v1'
const DEFAULT_MODEL = 'gpt-4o-mini'

const assistantActionSchema = z.object({
  type: z.enum([
    'create_task',
    'update_task',
    'complete_task',
    'uncomplete_task',
    'delete_task',
    'create_project',
  ]),
  label: z.string().min(1).max(140),
  payload: z.record(z.any()).optional(),
})

const assistantResponseSchema = z.object({
  reply: z.string().min(1),
  proposedActions: z.array(assistantActionSchema).max(5).optional(),
})

function isAssistantSurface(value: string): value is AssistantSurface {
  return value === 'ui' || value === 'tui'
}

function resolveSurface(input: string): AssistantSurface {
  if (!isAssistantSurface(input)) {
    throw new Error('Invalid assistant surface')
  }
  return input
}

function normalizeBaseUrl(value: string | null | undefined): string {
  if (!value || value.trim().length === 0) {
    return DEFAULT_LOCAL_BASE_URL
  }
  return value.trim()
}

function normalizeModel(value: string | null | undefined): string {
  if (!value || value.trim().length === 0) {
    return DEFAULT_MODEL
  }
  return value.trim()
}

function isLocalBaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
  } catch {
    return false
  }
}

function parseOptionalIso(value: unknown): Date | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null
  }
  try {
    const parsed = parseISO(value)
    if (!isValid(parsed)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function buildTaskSnapshot() {
  const now = new Date()
  const tasks = listTasks()
  const projects = listProjects()
  const projectNames = new Map(projects.map((project) => [project.id, project.name]))
  const goals = listGoals()

  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const last7DaysStart = subDays(now, 7)
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 })
  const lastWeekStart = subDays(currentWeekStart, 7)
  const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 })

  const completedTasks = tasks.filter(
    (task) => task.status === 'completed' && parseOptionalIso(task.completedAt),
  )

  const completedTodayCount = completedTasks.filter((task) => {
    const completedAt = parseOptionalIso(task.completedAt)
    if (!completedAt) return false
    return isWithinInterval(completedAt, { start: todayStart, end: todayEnd })
  }).length

  const completedLast7DaysCount = completedTasks.filter((task) => {
    const completedAt = parseOptionalIso(task.completedAt)
    if (!completedAt) return false
    return isWithinInterval(completedAt, { start: last7DaysStart, end: now })
  }).length

  const completedLastWeekCount = completedTasks.filter((task) => {
    const completedAt = parseOptionalIso(task.completedAt)
    if (!completedAt) return false
    return isWithinInterval(completedAt, { start: lastWeekStart, end: lastWeekEnd })
  }).length

  const openTasks = tasks.filter((task) => task.status === 'open')

  const overdueTasks = openTasks.filter((task) => {
    const dueAt = parseOptionalIso(task.dueAt)
    return dueAt ? dueAt < todayStart : false
  })

  const todayTasks = openTasks.filter((task) => {
    const dueAt = parseOptionalIso(task.dueAt)
    if (!dueAt) return false
    return isWithinInterval(dueAt, { start: todayStart, end: todayEnd })
  })

  const thisWeekTasks = openTasks.filter((task) => {
    const dueAt = parseOptionalIso(task.dueAt)
    if (!dueAt) return false
    return isWithinInterval(dueAt, { start: todayStart, end: weekEnd })
  })

  const mapTask = (task: (typeof tasks)[number]) => ({
    id: task.id,
    title: task.title,
    notes: task.notes || null,
    status: task.status,
    projectId: task.projectId,
    projectName: projectNames.get(task.projectId) ?? null,
    priority: task.priority,
    scheduledAt: task.scheduledAt,
    dueAt: task.dueAt,
    completedAt: task.completedAt,
    updatedAt: task.updatedAt,
    parentTaskId: task.parentTaskId,
    recurrencePreset: task.recurrencePreset,
  })

  const recentCompleted = completedTasks
    .map((task) => ({ ...task, completedAtDate: parseOptionalIso(task.completedAt) }))
    .sort((a, b) =>
      compareDesc(a.completedAtDate ?? new Date(0), b.completedAtDate ?? new Date(0)),
    )
    .slice(0, 10)
    .map(mapTask)

  return {
    summary: {
      nowIso: now.toISOString(),
      completedTodayCount,
      completedLast7DaysCount,
      completedLastWeekCount,
      lastWeekRange: `${format(lastWeekStart, 'yyyy-MM-dd')} to ${format(lastWeekEnd, 'yyyy-MM-dd')}`,
      openCount: openTasks.length,
      overdueCount: overdueTasks.length,
      totalTasks: tasks.length,
      goalCount: goals.length,
    },
    overdueTasks: overdueTasks.map(mapTask),
    todayTasks: todayTasks.map(mapTask),
    thisWeekTasks: thisWeekTasks.map(mapTask),
    allOpenTasks: openTasks.map(mapTask),
    recentlyCompletedTasks: recentCompleted,
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
      isInbox: project.isInbox,
      description: project.description || null,
    })),
  }
}

function generateActionId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `action-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }
}

function normalizeProposedActions(
  value: Array<{
    type: AssistantActionType
    label: string
    payload?: Record<string, unknown>
  }> | null | undefined,
): AssistantAction[] {
  if (!value) {
    return []
  }

  return value.map((action) => ({
    id: generateActionId(),
    type: action.type,
    label: action.label.trim(),
    status: 'pending',
    payload: action.payload ?? {},
    resultMessage: null,
  }))
}

async function generateAssistantReply(input: {
  provider: 'openai' | 'lmstudio'
  baseUrl: string
  model: string
  apiKey: string | null
  userMessage: string
  conversation: AssistantMessage[]
}): Promise<{ reply: string; actions: AssistantAction[] }> {
  const isLmStudio = input.provider === 'lmstudio'

  if (!isLmStudio && !input.apiKey && !isLocalBaseUrl(input.baseUrl)) {
    return {
      reply:
        'AI key missing for the configured non-local provider. Add an API key in Assistant settings, or switch the base URL to a local provider.',
      actions: [],
    }
  }

  const context = buildTaskSnapshot()
  const conversationContext = input.conversation
    .slice(-16)
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join('\n')

  try {
    const [aiModule, openAiModule, openAiCompatibleModule] = await Promise.all([
      import('ai') as Promise<unknown>,
      import('@ai-sdk/openai') as Promise<unknown>,
      import('@ai-sdk/openai-compatible') as Promise<unknown>,
    ])

    const { generateObject } = aiModule as {
      generateObject: (args: {
        model: unknown
        schema: unknown
        system: string
        prompt: string
        temperature: number
      }) => Promise<{ object: unknown }>
    }
    const { createOpenAI } = openAiModule as {
      createOpenAI: (options: {
        apiKey: string
        baseURL: string
        compatibility: 'compatible'
      }) => (modelName: string) => unknown
    }
    const { createOpenAICompatible } = openAiCompatibleModule as {
      createOpenAICompatible: (options: {
        name: string
        baseURL: string
        apiKey?: string
      }) => (modelName: string) => unknown
    }

    const modelInstance = isLmStudio
      ? createOpenAICompatible({ name: 'lmstudio', baseURL: input.baseUrl })(input.model)
      : createOpenAI({
          apiKey: input.apiKey ?? 'local',
          baseURL: input.baseUrl,
          compatibility: 'compatible',
        })(input.model)

    const result = await generateObject({
      model: modelInstance,
      schema: assistantResponseSchema,
      temperature: 0.2,
      system: [
        `You are the personal task management assistant for Finish Em, a productivity app.`,
        `Today is ${format(new Date(), 'EEEE, MMMM d, yyyy')} (${context.summary.nowIso}).`,
        '',
        '## Your role',
        'Help the user manage their tasks and projects. Be direct, concise, and actionable.',
        'Reference specific task titles and IDs when discussing tasks. Never invent tasks that are not in the provided context.',
        'Proactively surface important information: overdue tasks, tasks due today, high-priority items.',
        '',
        '## Data model',
        'Tasks have: id, title, notes, status (open/completed), projectId, projectName, priority (1=highest, 2=high, 3=medium, 4=low), dueAt, scheduledAt, completedAt, parentTaskId, recurrencePreset.',
        'Projects group tasks. The inbox project (isInbox=true) is the default destination for new tasks.',
        'Goals are separate from tasks — they are weekly or daily intentions.',
        '',
        '## Available actions',
        'You may propose up to 5 actions requiring user confirmation before execution:',
        '- create_task: payload must include title. Optional: projectId, priority, dueAt (ISO 8601), scheduledAt (ISO 8601), notes, parentTaskId, recurrencePreset (daily/weekly/monthly/yearly/every_weekday).',
        '- update_task: payload must include taskId. Optional: any task fields to change.',
        '- complete_task: payload must include taskId.',
        '- uncomplete_task: payload must include taskId.',
        '- delete_task: payload must include taskId. Only propose this when user explicitly wants to delete.',
        '- create_project: payload must include name. Optional: description, color (hex), emoji.',
        '',
        '## Response instructions',
        'Return a concise reply addressing the user. Avoid filler phrases like "Of course!" or "Certainly!".',
        'When proposing actions, include a clear human-readable label for each.',
        'Only propose actions if they are clearly appropriate — do not pad responses with unnecessary actions.',
        '',
        '## Conversation history',
        conversationContext || '(no prior conversation)',
        '',
        '## Current task context (JSON)',
        JSON.stringify(context, null, 2),
      ].join('\n'),
      prompt: input.userMessage,
    })

    const parsed = assistantResponseSchema.parse(result.object)
    return {
      reply: parsed.reply,
      actions: normalizeProposedActions(parsed.proposedActions),
    }
  } catch {
    return {
      reply: [
        `I can still help with your tasks.`,
        `Completed today: ${context.summary.completedTodayCount}.`,
        `Completed in the last 7 days: ${context.summary.completedLast7DaysCount}.`,
        `Completed last week (${context.summary.lastWeekRange}): ${context.summary.completedLastWeekCount}.`,
        `Open tasks: ${context.summary.openCount}, overdue: ${context.summary.overdueCount}.`,
      ].join(' '),
      actions: [],
    }
  }
}

function asPositiveInt(value: unknown, field: string): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${field}`)
  }
  return parsed
}

function asOptionalPriority(value: unknown): Priority | undefined {
  if (value === undefined) {
    return undefined
  }
  const parsed = Number(value)
  if (parsed === 1 || parsed === 2 || parsed === 3 || parsed === 4) {
    return parsed as Priority
  }
  throw new Error('Invalid priority')
}

function asOptionalRecurrencePreset(value: unknown): RecurrencePreset | undefined {
  if (value === undefined) {
    return undefined
  }
  if (value === null) {
    return null
  }
  if (
    value === 'daily' ||
    value === 'weekly' ||
    value === 'monthly' ||
    value === 'yearly' ||
    value === 'every_weekday'
  ) {
    return value
  }
  throw new Error('Invalid recurrence preset')
}

function executeAssistantAction(action: AssistantAction): string {
  if (action.type === 'create_task') {
    const titleRaw = action.payload.title
    if (typeof titleRaw !== 'string' || titleRaw.trim().length === 0) {
      throw new Error('create_task requires a non-empty title')
    }
    const projectId =
      action.payload.projectId === undefined
        ? getInboxProjectId()
        : asPositiveInt(action.payload.projectId, 'projectId')
    const created = createTask({
      projectId,
      parentTaskId:
        action.payload.parentTaskId === undefined
          ? undefined
          : action.payload.parentTaskId === null
            ? null
            : asPositiveInt(action.payload.parentTaskId, 'parentTaskId'),
      title: titleRaw.trim(),
      notes:
        typeof action.payload.notes === 'string' ? action.payload.notes.trim() : undefined,
      priority: asOptionalPriority(action.payload.priority),
      scheduledAt:
        action.payload.scheduledAt === undefined
          ? undefined
          : action.payload.scheduledAt === null
            ? null
            : String(action.payload.scheduledAt),
      dueAt:
        action.payload.dueAt === undefined
          ? undefined
          : action.payload.dueAt === null
            ? null
            : String(action.payload.dueAt),
      dueTimezone:
        action.payload.dueTimezone === undefined
          ? undefined
          : action.payload.dueTimezone === null
            ? null
            : String(action.payload.dueTimezone),
      recurrencePreset: asOptionalRecurrencePreset(action.payload.recurrencePreset),
      recurrenceRRule:
        action.payload.recurrenceRRule === undefined
          ? undefined
          : action.payload.recurrenceRRule === null
            ? null
            : String(action.payload.recurrenceRRule),
    })
    return `Created task "${created.title}" (#${created.id}).`
  }

  if (action.type === 'update_task') {
    const taskId = asPositiveInt(action.payload.taskId, 'taskId')
    const existing = getTask(taskId)
    if (!existing) {
      throw new Error(`Task ${taskId} not found`)
    }

    const patch: Record<string, unknown> = {}
    if (typeof action.payload.title === 'string') {
      patch.title = action.payload.title.trim()
    }
    if (typeof action.payload.notes === 'string') {
      patch.notes = action.payload.notes
    }
    if (action.payload.projectId !== undefined) {
      patch.projectId =
        action.payload.projectId === null
          ? null
          : asPositiveInt(action.payload.projectId, 'projectId')
    }
    if (action.payload.parentTaskId !== undefined) {
      patch.parentTaskId =
        action.payload.parentTaskId === null
          ? null
          : asPositiveInt(action.payload.parentTaskId, 'parentTaskId')
    }
    if (action.payload.priority !== undefined) {
      patch.priority = asOptionalPriority(action.payload.priority)
    }
    if (action.payload.scheduledAt !== undefined) {
      patch.scheduledAt =
        action.payload.scheduledAt === null ? null : String(action.payload.scheduledAt)
    }
    if (action.payload.dueAt !== undefined) {
      patch.dueAt = action.payload.dueAt === null ? null : String(action.payload.dueAt)
    }
    if (action.payload.dueTimezone !== undefined) {
      patch.dueTimezone =
        action.payload.dueTimezone === null ? null : String(action.payload.dueTimezone)
    }
    if (action.payload.recurrencePreset !== undefined) {
      patch.recurrencePreset = asOptionalRecurrencePreset(
        action.payload.recurrencePreset,
      )
    }
    if (action.payload.recurrenceRRule !== undefined) {
      patch.recurrenceRRule =
        action.payload.recurrenceRRule === null
          ? null
          : String(action.payload.recurrenceRRule)
    }

    if (Object.keys(patch).length === 0) {
      throw new Error('No update fields were provided')
    }

    const updated = updateTask(taskId, patch as Parameters<typeof updateTask>[1])
    if (!updated) {
      throw new Error(`Task ${taskId} not found`)
    }
    return `Updated task "${updated.title}" (#${updated.id}).`
  }

  if (action.type === 'complete_task') {
    const taskId = asPositiveInt(action.payload.taskId, 'taskId')
    const result = completeTask(taskId)
    if (!result.task) {
      throw new Error(`Task ${taskId} not found`)
    }
    return `Completed task "${result.task.title}" (#${result.task.id}).`
  }

  if (action.type === 'uncomplete_task') {
    const taskId = asPositiveInt(action.payload.taskId, 'taskId')
    const task = uncompleteTask(taskId)
    if (!task) {
      throw new Error(`Task ${taskId} not found`)
    }
    return `Reopened task "${task.title}" (#${task.id}).`
  }

  if (action.type === 'delete_task') {
    const taskId = asPositiveInt(action.payload.taskId, 'taskId')
    const existing = getTask(taskId)
    if (!existing) {
      throw new Error(`Task ${taskId} not found`)
    }
    const deleted = deleteTask(taskId)
    if (!deleted) {
      throw new Error(`Failed to delete task ${taskId}`)
    }
    return `Deleted task "${existing.title}" (#${taskId}).`
  }

  if (action.type === 'create_project') {
    const name = action.payload.name
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('create_project requires a non-empty name')
    }
    const created = createProject({
      name: name.trim(),
      emoji:
        typeof action.payload.emoji === 'string' && action.payload.emoji.trim().length > 0
          ? action.payload.emoji.trim()
          : null,
      description:
        typeof action.payload.description === 'string'
          ? action.payload.description.trim()
          : undefined,
      color:
        typeof action.payload.color === 'string' && action.payload.color.trim().length > 0
          ? action.payload.color.trim()
          : undefined,
    })
    return `Created project "${created.name}" (#${created.id}).`
  }

  throw new Error('Unsupported action type')
}

function updateActionState(input: {
  message: AssistantMessage
  actionId: string
  decision: 'confirm' | 'cancel'
}): AssistantMessage {
  const actions = input.message.actions.map((action) => ({ ...action }))
  const index = actions.findIndex((action) => action.id === input.actionId)
  if (index === -1) {
    throw new Error('Action not found')
  }

  const selected = actions[index]
  if (selected.status !== 'pending') {
    throw new Error('Action is no longer pending')
  }

  if (input.decision === 'cancel') {
    selected.status = 'cancelled'
    selected.resultMessage = 'Action cancelled by user.'
  } else {
    try {
      const resultMessage = executeAssistantAction(selected)
      selected.status = 'executed'
      selected.resultMessage = resultMessage
    } catch (error) {
      selected.status = 'failed'
      selected.resultMessage =
        error instanceof Error ? error.message : 'Failed to execute action'
    }
  }

  const updated = updateAssistantMessageActions({
    messageId: input.message.id,
    actions,
  })
  if (!updated) {
    throw new Error('Failed to update assistant action state')
  }
  return updated
}

export function getAssistantState(surfaceInput: string) {
  const surface = resolveSurface(surfaceInput)
  return {
    settings: getSettings(),
    messages: listAssistantMessages({ surface }),
  }
}

export async function sendAssistantChat(input: {
  surfaceInput: string
  message: string
}): Promise<AssistantChatResponse> {
  const surface = resolveSurface(input.surfaceInput)
  const text = input.message.trim()
  if (text.length === 0) {
    throw new Error('Message is required')
  }

  const userMessage = createAssistantMessage({
    surface,
    role: 'user',
    content: text,
    actions: [],
  })

  const settings = getSettings()
  const secrets = getSettingsSecrets()
  const provider = settings.aiProvider ?? 'lmstudio'
  const isLmStudio = provider === 'lmstudio'
  const defaultBaseUrl = isLmStudio ? DEFAULT_LMSTUDIO_BASE_URL : DEFAULT_LOCAL_BASE_URL
  const baseUrl = normalizeBaseUrl(
    settings.aiBaseUrl ?? process.env.OPENAI_BASE_URL ?? defaultBaseUrl,
  )
  const model = normalizeModel(settings.aiModel ?? process.env.OPENAI_MODEL ?? DEFAULT_MODEL)
  const apiKey = secrets.aiApiKey ?? process.env.OPENAI_API_KEY ?? null
  const conversation = listAssistantMessages({ surface })

  const generated = await generateAssistantReply({
    provider,
    baseUrl,
    model,
    apiKey,
    userMessage: text,
    conversation,
  })

  const assistantMessage = createAssistantMessage({
    surface,
    role: 'assistant',
    content: generated.reply,
    actions: generated.actions,
  })

  return {
    userMessage,
    assistantMessage,
  }
}

export function decideAssistantAction(input: {
  surfaceInput: string
  messageId: number
  actionId: string
  decision: 'confirm' | 'cancel'
}) {
  const surface = resolveSurface(input.surfaceInput)
  const message = getAssistantMessage(input.messageId)
  if (!message) {
    throw new Error('Assistant message not found')
  }
  if (message.surface !== surface) {
    throw new Error('Assistant message surface mismatch')
  }
  if (message.role !== 'assistant') {
    throw new Error('Only assistant messages can contain actions')
  }

  return {
    message: updateActionState({
      message,
      actionId: input.actionId,
      decision: input.decision,
    }),
  }
}

export function clearAssistantHistory(surfaceInput: string) {
  const surface = resolveSurface(surfaceInput)
  return {
    ok: true,
    deleted: clearAssistantMessages(surface),
  }
}
