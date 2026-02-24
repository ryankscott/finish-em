import * as goalRepo from '@/server/repos/goals'
import * as projectRepo from '@/server/repos/projects'
import * as reminderRepo from '@/server/repos/reminders'
import * as taskRepo from '@/server/repos/tasks'
import type { Goal, Project, Reminder, Task } from '@/server/types'

function formatTask(task: Task): string {
  return `ID: ${task.id}
Title: ${task.title}
Status: ${task.status}
Priority: ${task.priority}
Project ID: ${task.projectId}
Parent Task ID: ${task.parentTaskId ?? 'None'}
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
      const tasks = taskRepo.listTasks()
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
      const task = taskRepo.getTask(Number(taskId))
      if (!task) {
        throw new Error(`Task ${taskId} not found`)
      }
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
      const projects = projectRepo.listProjects()
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
      const project = projectRepo.getProject(Number(projectId))
      if (!project) {
        throw new Error(`Project ${projectId} not found`)
      }
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
      const goals = goalRepo.listGoals()
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
      const goal = goalRepo.getGoal(Number(goalId))
      if (!goal) {
        throw new Error(`Goal ${goalId} not found`)
      }
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
      const reminder = reminderRepo.getReminder(Number(reminderId))
      if (!reminder) {
        throw new Error(`Reminder ${reminderId} not found`)
      }
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
