import type { Goal, Project, Reminder, Task } from '@/server/types'
import z from 'zod'

const API_BASE = 'http://localhost:5173'

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${API_BASE}${path}`
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`HTTP ${response.status}: ${text}`)
  }

  return (await response.json()) as T
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
    const params = new URLSearchParams()
    if (input.projectId) params.set('projectId', String(input.projectId))
    if (input.status) params.set('status', String(input.status))
    if (input.from) params.set('from', String(input.from))
    if (input.to) params.set('to', String(input.to))
    if (input.priority) params.set('priority', String(input.priority))
    if (input.noDueDate) params.set('noDueDate', String(input.noDueDate))
    if (input.parentTaskId !== undefined) {
      params.set('parentTaskId', String(input.parentTaskId))
    }
    if (input.rootsOnly) params.set('rootsOnly', String(input.rootsOnly))

    const path = `/api/tasks${params.size > 0 ? `?${params.toString()}` : ''}`
    const tasks = await apiRequest<Task[]>('GET', path)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(tasks, null, 2),
        },
      ],
    }
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
    const task = await apiRequest<Task>('GET', `/api/tasks/${input.taskId}`)
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(task, null, 2),
        },
      ],
    }
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
    const task = await apiRequest<Task>('POST', '/api/tasks', {
      projectId: input.projectId,
      title: input.title,
      notes: input.notes,
      priority: input.priority ? parseInt(String(input.priority), 10) : undefined,
      scheduledAt: input.scheduledAt,
      dueAt: input.dueAt,
      dueTimezone: input.dueTimezone,
      recurrencePreset: input.recurrencePreset,
      recurrenceRRule: input.recurrenceRRule,
      parentTaskId: input.parentTaskId,
    })

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(task, null, 2),
        },
      ],
    }
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
    const task = await apiRequest<Task>('PATCH', `/api/tasks/${input.taskId}`, {
      title: input.title,
      notes: input.notes,
      priority: input.priority ? parseInt(String(input.priority), 10) : undefined,
      scheduledAt: input.scheduledAt,
      dueAt: input.dueAt,
      dueTimezone: input.dueTimezone,
      recurrencePreset: input.recurrencePreset,
      recurrenceRRule: input.recurrenceRRule,
      parentTaskId: input.parentTaskId,
    })

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(task, null, 2),
        },
      ],
    }
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
    const result = await apiRequest<{ task: Task; nextTask: Task | null }>(
      'POST',
      `/api/tasks/${input.taskId}/complete`,
    )

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    }
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
    const task = await apiRequest<Task>('POST', `/api/tasks/${input.taskId}/uncomplete`)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(task, null, 2),
        },
      ],
    }
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
    const result = await apiRequest<{ ok: boolean }>('DELETE', `/api/tasks/${input.taskId}`)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    }
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
    const projects = await apiRequest<Project[]>('GET', '/api/projects')

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(projects, null, 2),
        },
      ],
    }
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
    const project = await apiRequest<Project>('GET', `/api/projects/${input.projectId}`)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(project, null, 2),
        },
      ],
    }
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
    const project = await apiRequest<Project>('POST', '/api/projects', {
      name: input.name,
      emoji: input.emoji,
      description: input.description,
      startAt: input.startAt,
      endAt: input.endAt,
      color: input.color,
      isInbox: input.isInbox,
    })

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(project, null, 2),
        },
      ],
    }
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
    const project = await apiRequest<Project>('PATCH', `/api/projects/${input.projectId}`, {
      name: input.name,
      emoji: input.emoji,
      description: input.description,
      startAt: input.startAt,
      endAt: input.endAt,
      color: input.color,
      isInbox: input.isInbox,
    })

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(project, null, 2),
        },
      ],
    }
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
    const result = await apiRequest<{ ok: boolean }>('DELETE', `/api/projects/${input.projectId}`)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    }
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
    const params = new URLSearchParams()
    if (input.periodType) params.set('periodType', String(input.periodType))
    if (input.periodStart) params.set('periodStart', String(input.periodStart))

    const path = `/api/goals${params.size > 0 ? `?${params.toString()}` : ''}`
    const goals = await apiRequest<Goal[]>('GET', path)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(goals, null, 2),
        },
      ],
    }
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
    const goal = await apiRequest<Goal>('GET', `/api/goals/${input.goalId}`)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(goal, null, 2),
        },
      ],
    }
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
    const goal = await apiRequest<Goal>('POST', '/api/goals', {
      periodType: input.periodType,
      periodStart: input.periodStart,
      title: input.title,
      done: input.done,
    })

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(goal, null, 2),
        },
      ],
    }
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
    const goal = await apiRequest<Goal>('PATCH', `/api/goals/${input.goalId}`, {
      title: input.title,
      done: input.done,
    })

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(goal, null, 2),
        },
      ],
    }
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
    const result = await apiRequest<{ ok: boolean }>('DELETE', `/api/goals/${input.goalId}`)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    }
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
    const reminders = await apiRequest<Reminder[]>('GET', `/api/tasks/${input.taskId}/reminders`)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(reminders, null, 2),
        },
      ],
    }
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
    const reminder = await apiRequest<Reminder>('GET', `/api/reminders/${input.reminderId}`)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(reminder, null, 2),
        },
      ],
    }
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
    const reminder = await apiRequest<Reminder>('POST', `/api/tasks/${input.taskId}/reminders`, {
      remindAt: input.remindAt,
    })

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(reminder, null, 2),
        },
      ],
    }
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
    const reminder = await apiRequest<Reminder>(
      'PATCH',
      `/api/reminders/${input.reminderId}`,
      {
        remindAt: input.remindAt,
      },
    )

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(reminder, null, 2),
        },
      ],
    }
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
    const result = await apiRequest<{ ok: boolean }>(
      'DELETE',
      `/api/reminders/${input.reminderId}`,
    )

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    }
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
    const reminder = await apiRequest<Reminder>(
      'POST',
      `/api/reminders/${input.reminderId}/snooze`,
      {
        preset: input.preset,
        customMinutes: input.customMinutes,
      },
    )

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(reminder, null, 2),
        },
      ],
    }
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
]
