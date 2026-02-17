import type { Goal, Project, Reminder, Task } from '@/server/types'

const API_BASE = 'http://localhost:5173'

async function apiRequest<T>(method: string, path: string): Promise<T> {
  const url = `${API_BASE}${path}`
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`HTTP ${response.status}: ${text}`)
  }

  return (await response.json()) as T
}

function formatTask(task: Task): string {
  return `ID: ${task.id}
Title: ${task.title}
Status: ${task.status}
Priority: ${task.priority}
Project ID: ${task.projectId}
Due: ${task.dueAt || 'No due date'}
Notes: ${task.notes || 'No notes'}`
}

function formatProject(project: Project): string {
  return `ID: ${project.id}
Name: ${project.name}
Emoji: ${project.emoji ?? 'None'}
Description: ${project.description || 'None'}
Start: ${project.startAt || 'None'}
End: ${project.endAt || 'None'}
Color: ${project.color}
Is Inbox: ${project.isInbox}`
}

function formatGoal(goal: Goal): string {
  return `ID: ${goal.id}
Title: ${goal.title}
Period: ${goal.periodType} starting ${goal.periodStart}
Done: ${goal.done}`
}

function formatReminder(reminder: Reminder): string {
  return `ID: ${reminder.id}
Task ID: ${reminder.taskId}
Remind At: ${reminder.remindAt}
Status: ${reminder.status}`
}

export const mcpResources = {
  read: async (uri: string) => {
    const pathname = new URL(uri).pathname

    // Tasks resource
    if (pathname === '/tasks') {
      const tasks = await apiRequest<Task[]>('GET', '/api/tasks')
      const text = tasks.map(formatTask).join('\n\n')
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text,
          },
        ],
      }
    }

    if (pathname.startsWith('/tasks/')) {
      const taskId = pathname.split('/')[2]
      const task = await apiRequest<Task>('GET', `/api/tasks/${taskId}`)
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: formatTask(task),
          },
        ],
      }
    }

    // Projects resource
    if (pathname === '/projects') {
      const projects = await apiRequest<Project[]>('GET', '/api/projects')
      const text = projects.map(formatProject).join('\n\n')
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text,
          },
        ],
      }
    }

    if (pathname.startsWith('/projects/')) {
      const projectId = pathname.split('/')[2]
      const project = await apiRequest<Project>('GET', `/api/projects/${projectId}`)
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: formatProject(project),
          },
        ],
      }
    }

    // Goals resource
    if (pathname === '/goals') {
      const goals = await apiRequest<Goal[]>('GET', '/api/goals')
      const text = goals.map(formatGoal).join('\n\n')
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text,
          },
        ],
      }
    }

    if (pathname.startsWith('/goals/')) {
      const goalId = pathname.split('/')[2]
      const goal = await apiRequest<Goal>('GET', `/api/goals/${goalId}`)
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: formatGoal(goal),
          },
        ],
      }
    }

    // Reminders resource
    if (pathname.startsWith('/reminders/')) {
      const reminderId = pathname.split('/')[2]
      const reminder = await apiRequest<Reminder>('GET', `/api/reminders/${reminderId}`)
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: formatReminder(reminder),
          },
        ],
      }
    }

    throw new Error(`Resource not found: ${uri}`)
  },

  list: async () => [
    {
      uri: 'finish-em://tasks',
      name: 'All Tasks',
      description: 'List of all tasks in the system',
      mimeType: 'text/plain',
    },
    {
      uri: 'finish-em://projects',
      name: 'All Projects',
      description: 'List of all projects',
      mimeType: 'text/plain',
    },
    {
      uri: 'finish-em://goals',
      name: 'All Goals',
      description: 'List of all goals',
      mimeType: 'text/plain',
    },
  ],
}
