import * as goalRepo from '@/server/repos/goals'
import * as projectRepo from '@/server/repos/projects'
import * as reminderRepo from '@/server/repos/reminders'
import * as settingsRepo from '@/server/repos/settings'
import * as taskRepo from '@/server/repos/tasks'
import { getAssistantState, sendAssistantChat, clearAssistantHistory } from '@/server/services/assistant'
import { createTaskFromQuickAdd } from '@/server/services/quick-add'
import type { AppSettings } from '@/server/types'
import z from 'zod'

const jsonContent = (value: unknown) => ({
  content: [
    {
      type: 'text' as const,
      text: JSON.stringify(value, null, 2),
    },
  ],
})

const parsePriority = (value: unknown): 1 | 2 | 3 | 4 | undefined => {
  if (value === undefined || value === null) {
    return undefined
  }

  const parsed = Number.parseInt(String(value), 10)
  if (parsed < 1 || parsed > 4 || Number.isNaN(parsed)) {
    throw new Error('Priority must be between 1 and 4')
  }
  return parsed as 1 | 2 | 3 | 4
}

// Task Tools

export const listTasksTool = {
  name: 'list_tasks',
  definition: {
    title: 'List tasks',
    description: 'List all tasks with optional filters',
    inputSchema: {
      projectId: z.number().optional().describe('Filter by project ID'),
      status: z.enum(['open', 'completed']).optional().describe('Filter by task status'),
      from: z.string().optional().describe('Filter tasks from this date (ISO 8601)'),
      to: z.string().optional().describe('Filter tasks to this date (ISO 8601)'),
      priority: z.enum(['1', '2', '3', '4']).optional().describe('Filter by priority (1-4)'),
      noDueDate: z.boolean().optional().describe('Filter tasks with no due date'),
      parentTaskId: z.number().optional().describe('Filter by parent task ID'),
      rootsOnly: z.boolean().optional().describe('Return only root tasks'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const tasks = taskRepo.listTasks({
      projectId: input.projectId === undefined ? undefined : Number(input.projectId),
      status: input.status as 'open' | 'completed' | undefined,
      from: input.from as string | undefined,
      to: input.to as string | undefined,
      priority: parsePriority(input.priority),
      noDueDate: input.noDueDate as boolean | undefined,
      parentTaskId:
        input.parentTaskId === undefined
          ? undefined
          : input.parentTaskId === null
            ? null
            : Number(input.parentTaskId),
      rootsOnly: input.rootsOnly as boolean | undefined,
    })

    return jsonContent(tasks)
  },
}

export const getTaskTool = {
  name: 'get_task',
  definition: {
    title: 'Get a task',
    description: 'Get details of a specific task by ID',
    inputSchema: {
      taskId: z.number().describe('The task ID'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const task = taskRepo.getTask(Number(input.taskId))
    if (!task) {
      throw new Error(`Task ${String(input.taskId)} not found`)
    }
    return jsonContent(task)
  },
}

export const createTaskTool = {
  name: 'create_task',
  definition: {
    title: 'Create a task',
    description: 'Create a new task in a project',
    inputSchema: {
      projectId: z.number().describe('The project ID to create the task in'),
      title: z.string().describe('The task title'),
      notes: z.string().optional().describe('Task notes/description'),
      priority: z.enum(['1', '2', '3', '4']).optional().describe('Priority level (1=highest, 4=lowest)'),
      scheduledAt: z.string().optional().describe('When the task is scheduled (ISO 8601)'),
      dueAt: z.string().optional().describe('When the task is due (ISO 8601)'),
      dueTimezone: z.string().optional().describe('Timezone for due date'),
      recurrencePreset: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'every_weekday']).optional().describe('Recurrence pattern'),
      recurrenceRRule: z.string().optional().describe('RRule for custom recurrence'),
      parentTaskId: z.number().nullable().optional().describe('Parent task ID for subtask creation'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const task = taskRepo.createTask({
      projectId: Number(input.projectId),
      title: String(input.title),
      notes: input.notes as string | undefined,
      priority: parsePriority(input.priority),
      scheduledAt: (input.scheduledAt as string | undefined) ?? null,
      dueAt: (input.dueAt as string | undefined) ?? null,
      dueTimezone: (input.dueTimezone as string | undefined) ?? null,
      recurrencePreset: (input.recurrencePreset as string | undefined) ?? null,
      recurrenceRRule: (input.recurrenceRRule as string | undefined) ?? null,
      parentTaskId:
        input.parentTaskId === undefined
          ? null
          : input.parentTaskId === null
            ? null
            : Number(input.parentTaskId),
    })

    return jsonContent(task)
  },
}

export const updateTaskTool = {
  name: 'update_task',
  definition: {
    title: 'Update a task',
    description: 'Update an existing task',
    inputSchema: {
      taskId: z.number().describe('The task ID'),
      title: z.string().optional().describe('New title'),
      notes: z.string().optional().describe('New notes'),
      priority: z.enum(['1', '2', '3', '4']).optional().describe('New priority'),
      scheduledAt: z.string().optional().describe('New scheduled date'),
      dueAt: z.string().optional().describe('New due date'),
      dueTimezone: z.string().optional().describe('New timezone for due date'),
      recurrencePreset: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'every_weekday']).optional().describe('New recurrence pattern'),
      recurrenceRRule: z.string().optional().describe('New RRule for custom recurrence'),
      parentTaskId: z.number().nullable().optional().describe('Parent task ID for subtask assignment'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const task = taskRepo.updateTask(Number(input.taskId), {
      title: input.title as string | undefined,
      notes: input.notes as string | undefined,
      priority: parsePriority(input.priority),
      scheduledAt:
        input.scheduledAt === undefined
          ? undefined
          : (input.scheduledAt as string | null),
      dueAt: input.dueAt === undefined ? undefined : (input.dueAt as string | null),
      dueTimezone:
        input.dueTimezone === undefined
          ? undefined
          : (input.dueTimezone as string | null),
      recurrencePreset:
        input.recurrencePreset === undefined
          ? undefined
          : (input.recurrencePreset as string | null),
      recurrenceRRule:
        input.recurrenceRRule === undefined
          ? undefined
          : (input.recurrenceRRule as string | null),
      parentTaskId:
        input.parentTaskId === undefined
          ? undefined
          : input.parentTaskId === null
            ? null
            : Number(input.parentTaskId),
    })
    if (!task) {
      throw new Error(`Task ${String(input.taskId)} not found`)
    }

    return jsonContent(task)
  },
}

export const completeTaskTool = {
  name: 'complete_task',
  definition: {
    title: 'Complete a task',
    description: 'Mark a task as completed',
    inputSchema: {
      taskId: z.number().describe('The task ID'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const result = taskRepo.completeTask(Number(input.taskId))
    if (!result.task) {
      throw new Error(`Task ${String(input.taskId)} not found`)
    }
    return jsonContent(result)
  },
}

export const uncompleteTaskTool = {
  name: 'uncomplete_task',
  definition: {
    title: 'Uncomplete a task',
    description: 'Mark a completed task as open again',
    inputSchema: {
      taskId: z.number().describe('The task ID'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const task = taskRepo.uncompleteTask(Number(input.taskId))
    if (!task) {
      throw new Error(`Task ${String(input.taskId)} not found`)
    }

    return jsonContent(task)
  },
}

export const deleteTaskTool = {
  name: 'delete_task',
  definition: {
    title: 'Delete a task',
    description: 'Delete a task permanently',
    inputSchema: {
      taskId: z.number().describe('The task ID'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    return jsonContent({ ok: taskRepo.deleteTask(Number(input.taskId)) })
  },
}

// Project Tools

export const listProjectsTool = {
  name: 'list_projects',
  definition: {
    title: 'List projects',
    description: 'List all projects',
    inputSchema: {},
  },
  handler: async (_input: Record<string, unknown>) => {
    return jsonContent(projectRepo.listProjects())
  },
}

export const getProjectTool = {
  name: 'get_project',
  definition: {
    title: 'Get a project',
    description: 'Get details of a specific project by ID',
    inputSchema: {
      projectId: z.number().describe('The project ID'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const project = projectRepo.getProject(Number(input.projectId))
    if (!project) {
      throw new Error(`Project ${String(input.projectId)} not found`)
    }
    return jsonContent(project)
  },
}

export const createProjectTool = {
  name: 'create_project',
  definition: {
    title: 'Create a project',
    description: 'Create a new project',
    inputSchema: {
      name: z.string().describe('Project name'),
      emoji: z.string().optional().describe('Project emoji'),
      description: z.string().optional().describe('Project description'),
      startAt: z.string().optional().describe('Project start date (ISO 8601 date)'),
      endAt: z.string().optional().describe('Project end date (ISO 8601 date)'),
      color: z.string().optional().describe('Project color (hex code)'),
      isInbox: z.boolean().optional().describe('Whether this is an inbox project'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const project = projectRepo.createProject({
      name: String(input.name),
      emoji: (input.emoji as string | undefined) ?? null,
      description: input.description as string | undefined,
      startAt: (input.startAt as string | undefined) ?? null,
      endAt: (input.endAt as string | undefined) ?? null,
      color: input.color as string | undefined,
      isInbox: input.isInbox as boolean | undefined,
    })

    return jsonContent(project)
  },
}

export const updateProjectTool = {
  name: 'update_project',
  definition: {
    title: 'Update a project',
    description: 'Update an existing project',
    inputSchema: {
      projectId: z.number().describe('The project ID'),
      name: z.string().optional().describe('New project name'),
      emoji: z.string().optional().describe('New project emoji'),
      description: z.string().optional().describe('New project description'),
      startAt: z.string().optional().describe('New project start date (ISO 8601 date)'),
      endAt: z.string().optional().describe('New project end date (ISO 8601 date)'),
      color: z.string().optional().describe('New project color'),
      isInbox: z.boolean().optional().describe('Whether this is an inbox project'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const project = projectRepo.updateProject(Number(input.projectId), {
      name: input.name as string | undefined,
      emoji:
        input.emoji === undefined ? undefined : ((input.emoji as string | null) ?? null),
      description: input.description as string | undefined,
      startAt:
        input.startAt === undefined ? undefined : ((input.startAt as string | null) ?? null),
      endAt: input.endAt === undefined ? undefined : ((input.endAt as string | null) ?? null),
      color: input.color as string | undefined,
      isInbox: input.isInbox as boolean | undefined,
    })
    if (!project) {
      throw new Error(`Project ${String(input.projectId)} not found`)
    }

    return jsonContent(project)
  },
}

export const deleteProjectTool = {
  name: 'delete_project',
  definition: {
    title: 'Delete a project',
    description: 'Delete a project permanently',
    inputSchema: {
      projectId: z.number().describe('The project ID'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    return jsonContent({ ok: projectRepo.deleteProject(Number(input.projectId)) })
  },
}

// Goal Tools

export const listGoalsTool = {
  name: 'list_goals',
  definition: {
    title: 'List goals',
    description: 'List goals for a specific period',
    inputSchema: {
      periodType: z.enum(['daily', 'weekly']).optional().describe('Filter by period type'),
      periodStart: z.string().optional().describe('Filter by period start date (ISO 8601)'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const goals = goalRepo.listGoals({
      periodType: input.periodType as 'daily' | 'weekly' | undefined,
      periodStart: input.periodStart as string | undefined,
    })

    return jsonContent(goals)
  },
}

export const getGoalTool = {
  name: 'get_goal',
  definition: {
    title: 'Get a goal',
    description: 'Get details of a specific goal by ID',
    inputSchema: {
      goalId: z.number().describe('The goal ID'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const goal = goalRepo.getGoal(Number(input.goalId))
    if (!goal) {
      throw new Error(`Goal ${String(input.goalId)} not found`)
    }

    return jsonContent(goal)
  },
}

export const createGoalTool = {
  name: 'create_goal',
  definition: {
    title: 'Create a goal',
    description: 'Create a new goal for a period',
    inputSchema: {
      periodType: z.enum(['daily', 'weekly']).describe('Period type'),
      periodStart: z.string().describe('Period start date (ISO 8601)'),
      title: z.string().describe('Goal title'),
      done: z.boolean().optional().describe('Whether goal is completed'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const goal = goalRepo.createGoal({
      periodType: input.periodType as 'daily' | 'weekly',
      periodStart: String(input.periodStart),
      title: String(input.title),
      done: input.done as boolean | undefined,
    })

    return jsonContent(goal)
  },
}

export const updateGoalTool = {
  name: 'update_goal',
  definition: {
    title: 'Update a goal',
    description: 'Update an existing goal',
    inputSchema: {
      goalId: z.number().describe('The goal ID'),
      title: z.string().optional().describe('New goal title'),
      done: z.boolean().optional().describe('Whether goal is completed'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const goal = goalRepo.updateGoal(Number(input.goalId), {
      title: input.title as string | undefined,
      done: input.done as boolean | undefined,
    })
    if (!goal) {
      throw new Error(`Goal ${String(input.goalId)} not found`)
    }

    return jsonContent(goal)
  },
}

export const deleteGoalTool = {
  name: 'delete_goal',
  definition: {
    title: 'Delete a goal',
    description: 'Delete a goal permanently',
    inputSchema: {
      goalId: z.number().describe('The goal ID'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    return jsonContent({ ok: goalRepo.deleteGoal(Number(input.goalId)) })
  },
}

// Reminder Tools

export const listRemindersTool = {
  name: 'list_reminders',
  definition: {
    title: 'List reminders',
    description: 'List reminders for a task',
    inputSchema: {
      taskId: z.number().describe('The task ID'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    return jsonContent(reminderRepo.listTaskReminders(Number(input.taskId)))
  },
}

export const getReminderTool = {
  name: 'get_reminder',
  definition: {
    title: 'Get a reminder',
    description: 'Get details of a specific reminder by ID',
    inputSchema: {
      reminderId: z.number().describe('The reminder ID'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const reminder = reminderRepo.getReminder(Number(input.reminderId))
    if (!reminder) {
      throw new Error(`Reminder ${String(input.reminderId)} not found`)
    }

    return jsonContent(reminder)
  },
}

export const createReminderTool = {
  name: 'create_reminder',
  definition: {
    title: 'Create a reminder',
    description: 'Create a reminder for a task',
    inputSchema: {
      taskId: z.number().describe('The task ID'),
      remindAt: z.string().describe('When to remind (ISO 8601)'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const reminder = reminderRepo.createReminder({
      taskId: Number(input.taskId),
      remindAt: String(input.remindAt),
    })

    return jsonContent(reminder)
  },
}

export const updateReminderTool = {
  name: 'update_reminder',
  definition: {
    title: 'Update a reminder',
    description: 'Update an existing reminder',
    inputSchema: {
      reminderId: z.number().describe('The reminder ID'),
      remindAt: z.string().optional().describe('New reminder time'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const reminder = reminderRepo.updateReminder(Number(input.reminderId), {
      remindAt: input.remindAt as string | undefined,
    })
    if (!reminder) {
      throw new Error(`Reminder ${String(input.reminderId)} not found`)
    }

    return jsonContent(reminder)
  },
}

export const deleteReminderTool = {
  name: 'delete_reminder',
  definition: {
    title: 'Delete a reminder',
    description: 'Delete a reminder permanently',
    inputSchema: {
      reminderId: z.number().describe('The reminder ID'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    return jsonContent({ ok: reminderRepo.deleteReminder(Number(input.reminderId)) })
  },
}

export const snoozeReminderTool = {
  name: 'snooze_reminder',
  definition: {
    title: 'Snooze a reminder',
    description: 'Snooze a reminder to a later time',
    inputSchema: {
      reminderId: z.number().describe('The reminder ID'),
      preset: z.enum(['this_morning', 'this_evening', 'tomorrow_morning', 'next_week', 'custom']).describe('Snooze preset'),
      customMinutes: z.number().optional().describe('Custom snooze duration in minutes (for custom preset)'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const reminder = reminderRepo.snoozeReminder({
      reminderId: Number(input.reminderId),
      preset: input.preset as
        | 'this_morning'
        | 'this_evening'
        | 'tomorrow_morning'
        | 'next_week'
        | 'custom',
      customMinutes: input.customMinutes as number | undefined,
    })
    if (!reminder) {
      throw new Error(`Reminder ${String(input.reminderId)} not found`)
    }
    return jsonContent(reminder)
  },
}

export const getSettingsTool = {
  name: 'get_settings',
  definition: {
    title: 'Get app settings',
    description: 'Get current application settings',
    inputSchema: {},
  },
  handler: async (_input: Record<string, unknown>) => {
    return jsonContent(settingsRepo.getSettings())
  },
}

export const updateSettingsTool = {
  name: 'update_settings',
  definition: {
    title: 'Update app settings',
    description: 'Update application settings values',
    inputSchema: {
      timezone: z.string().optional(),
      aiProvider: z.enum(['gemini', 'openai', 'lmstudio']).optional(),
      aiBaseUrl: z.string().nullable().optional(),
      aiModel: z.string().nullable().optional(),
      aiApiKey: z.string().nullable().optional(),
      clearAiApiKey: z.boolean().optional(),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const settings: AppSettings = settingsRepo.updateSettings({
      timezone: input.timezone as string | undefined,
      aiProvider: input.aiProvider as 'gemini' | 'openai' | 'lmstudio' | undefined,
      aiBaseUrl:
        input.aiBaseUrl === undefined ? undefined : (input.aiBaseUrl as string | null),
      aiModel: input.aiModel === undefined ? undefined : (input.aiModel as string | null),
      aiApiKey: input.aiApiKey === undefined ? undefined : (input.aiApiKey as string | null),
      clearAiApiKey: input.clearAiApiKey as boolean | undefined,
    })

    return jsonContent(settings)
  },
}

export const createQuickAddTool = {
  name: 'create_quick_add',
  definition: {
    title: 'Create task from quick add',
    description: 'Create a task by parsing natural language quick add input',
    inputSchema: {
      text: z.string().describe('Quick add text to parse and create task from'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const result = await createTaskFromQuickAdd(String(input.text))
    return jsonContent(result.task)
  },
}

export const getAssistantStateTool = {
  name: 'get_assistant_state',
  definition: {
    title: 'Get assistant state',
    description: 'Get assistant settings and message history for a surface',
    inputSchema: {
      surface: z.enum(['ui', 'tui']).optional(),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const surface = (input.surface as 'ui' | 'tui' | undefined) ?? 'tui'
    return jsonContent(getAssistantState(surface))
  },
}

export const sendAssistantChatTool = {
  name: 'send_assistant_chat',
  definition: {
    title: 'Send assistant chat',
    description: 'Send a message to assistant and receive assistant reply',
    inputSchema: {
      surface: z.enum(['ui', 'tui']).optional(),
      message: z.string().describe('User message text'),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const response = await sendAssistantChat({
      surfaceInput: ((input.surface as 'ui' | 'tui' | undefined) ?? 'tui') as string,
      message: String(input.message),
    })
    return jsonContent(response)
  },
}

export const clearAssistantMessagesTool = {
  name: 'clear_assistant_messages',
  definition: {
    title: 'Clear assistant messages',
    description: 'Clear assistant conversation history for a surface',
    inputSchema: {
      surface: z.enum(['ui', 'tui']).optional(),
    },
  },
  handler: async (input: Record<string, unknown>) => {
    const result = clearAssistantHistory(
      ((input.surface as 'ui' | 'tui' | undefined) ?? 'tui') as string,
    )
    return jsonContent(result)
  },
}

// Export all tools as array for easy registration
export const ALL_TOOLS = [
  listTasksTool,
  getTaskTool,
  createTaskTool,
  updateTaskTool,
  completeTaskTool,
  uncompleteTaskTool,
  deleteTaskTool,
  listProjectsTool,
  getProjectTool,
  createProjectTool,
  updateProjectTool,
  deleteProjectTool,
  listGoalsTool,
  getGoalTool,
  createGoalTool,
  updateGoalTool,
  deleteGoalTool,
  listRemindersTool,
  getReminderTool,
  createReminderTool,
  updateReminderTool,
  deleteReminderTool,
  snoozeReminderTool,
  getSettingsTool,
  updateSettingsTool,
  createQuickAddTool,
  getAssistantStateTool,
  sendAssistantChatTool,
  clearAssistantMessagesTool,
]
