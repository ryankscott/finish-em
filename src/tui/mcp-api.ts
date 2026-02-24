import type {
  AppSettings,
  AssistantActionOutcome,
  AssistantDecisionSummary,
  AssistantMessage,
  Goal,
  Project,
  Reminder,
  Task,
} from '@/server/types'
import { invokeMcpTool } from '@/utils/mcp-server'

import type { ApiClient } from './api'

const parseToolResult = <T>(result: {
  content: Array<{ type: string; text?: string }>
  isError?: boolean
}): T => {
  const textContent = result.content.find((item) => item.type === 'text')?.text
  if (!textContent) {
    throw new Error('MCP tool response did not include text content')
  }

  if (result.isError) {
    throw new Error(textContent)
  }

  return JSON.parse(textContent) as T
}

const callTool = async <T>(
  name: string,
  input: Record<string, unknown> = {},
): Promise<T> => {
  const result = await invokeMcpTool(name, input)
  return parseToolResult<T>(result)
}

export const createMcpApi = (): ApiClient => ({
  getSettings: () => callTool<AppSettings>('get_settings'),

  updateSettings: (input) => callTool<AppSettings>('update_settings', input),

  listProjects: () => callTool<Project[]>('list_projects'),

  listTasks: (query = {}) =>
    callTool<Task[]>('list_tasks', {
      ...query,
      priority: query.priority === undefined ? undefined : String(query.priority),
    }),

  createTask: (input) =>
    callTool<Task>('create_task', {
      ...input,
      priority: input.priority === undefined ? undefined : String(input.priority),
    }),

  listGoals: (query = {}) => callTool<Goal[]>('list_goals', query),

  createGoal: (input) => callTool<Goal>('create_goal', input),

  updateGoal: (goalId, input) => callTool<Goal>('update_goal', { goalId, ...input }),

  deleteGoal: async (goalId) => {
    await callTool<{ ok: boolean }>('delete_goal', { goalId })
  },

  updateTask: (taskId, input) =>
    callTool<Task>('update_task', {
      taskId,
      ...input,
      priority: input.priority === undefined ? undefined : String(input.priority),
    }),

  deleteTask: async (taskId) => {
    await callTool<{ ok: boolean }>('delete_task', { taskId })
  },

  completeTask: async (taskId) => {
    const result = await callTool<{ task: Task; nextTask: Task | null }>('complete_task', {
      taskId,
    })
    return result.task
  },

  uncompleteTask: (taskId) => callTool<Task>('uncomplete_task', { taskId }),

  createQuickAdd: (text) => callTool<Task>('create_quick_add', { text }),

  createProject: (input) => callTool<Project>('create_project', input),

  listTaskReminders: (taskId) => callTool<Reminder[]>('list_reminders', { taskId }),

  createReminder: (taskId, input) => callTool<Reminder>('create_reminder', { taskId, ...input }),

  deleteReminder: async (reminderId) => {
    await callTool<{ ok: boolean }>('delete_reminder', { reminderId })
  },

  getAssistantState: (surface) =>
    callTool<{ settings: AppSettings; messages: AssistantMessage[] }>('get_assistant_state', {
      surface,
    }),

  sendAssistantChat: (input) =>
    callTool<{ userMessage: AssistantMessage; assistantMessage: AssistantMessage }>(
      'send_assistant_chat',
      input,
    ),

  decideAssistantAction: (input) =>
    callTool<{
      message: AssistantMessage
      outcome: AssistantActionOutcome
      summary: AssistantDecisionSummary
    }>('decide_assistant_action', input),

  clearAssistantMessages: (surface) =>
    callTool<{ ok: boolean; deleted: number }>('clear_assistant_messages', { surface }),
})
