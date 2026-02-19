/**
 * Direct API adapter — implements the same ApiClient interface as the HTTP client
 * but calls repo/service functions in-process, with no HTTP round-trip.
 * Used by the standalone compiled binary.
 */

import * as taskRepo from '@/server/repos/tasks'
import * as projectRepo from '@/server/repos/projects'
import * as goalRepo from '@/server/repos/goals'
import * as reminderRepo from '@/server/repos/reminders'
import * as settingsRepo from '@/server/repos/settings'
import { createTaskFromQuickAdd } from '@/server/services/quick-add'
import {
  clearAssistantHistory,
  decideAssistantAction,
  getAssistantState,
  sendAssistantChat,
} from '@/server/services/assistant'

import type { ApiClient } from './api'

export const createDirectApi = (): ApiClient => ({
  getSettings: () => Promise.resolve(settingsRepo.getSettings()),

  updateSettings: (input) => Promise.resolve(settingsRepo.updateSettings(input)),

  listProjects: () => Promise.resolve(projectRepo.listProjects()),

  listTasks: (query = {}) => Promise.resolve(taskRepo.listTasks(query)),

  createTask: (input) => Promise.resolve(taskRepo.createTask(input)),

  listGoals: (query = {}) => Promise.resolve(goalRepo.listGoals(query)),

  createGoal: (input) => Promise.resolve(goalRepo.createGoal(input)),

  updateGoal: (goalId, input) => {
    const result = goalRepo.updateGoal(goalId, input)
    if (!result) throw new Error(`Goal ${goalId} not found`)
    return Promise.resolve(result)
  },

  deleteGoal: (goalId) => {
    goalRepo.deleteGoal(goalId)
    return Promise.resolve()
  },

  updateTask: (taskId, input) => {
    const result = taskRepo.updateTask(taskId, input)
    if (!result) throw new Error(`Task ${taskId} not found`)
    return Promise.resolve(result)
  },

  deleteTask: (taskId) => {
    taskRepo.deleteTask(taskId)
    return Promise.resolve()
  },

  completeTask: (taskId) => {
    const result = taskRepo.completeTask(taskId)
    if (!result.task) throw new Error(`Task ${taskId} not found`)
    return Promise.resolve(result.task)
  },

  uncompleteTask: (taskId) => {
    const result = taskRepo.uncompleteTask(taskId)
    if (!result) throw new Error(`Task ${taskId} not found`)
    return Promise.resolve(result)
  },

  createQuickAdd: async (text) => {
    const result = await createTaskFromQuickAdd(text)
    return result.task
  },

  createProject: (input) => Promise.resolve(projectRepo.createProject(input)),

  listTaskReminders: (taskId) =>
    Promise.resolve(reminderRepo.listTaskReminders(taskId)),

  createReminder: (taskId, input) =>
    Promise.resolve(reminderRepo.createReminder({ taskId, ...input })),

  deleteReminder: (reminderId) => {
    reminderRepo.deleteReminder(reminderId)
    return Promise.resolve()
  },

  getAssistantState: (surface) =>
    Promise.resolve(getAssistantState(surface)),

  sendAssistantChat: (input) =>
    sendAssistantChat({
      surfaceInput: input.surface,
      message: input.message,
    }),

  decideAssistantAction: (input) =>
    Promise.resolve(
      decideAssistantAction({
        surfaceInput: input.surface,
        messageId: input.messageId,
        actionId: input.actionId,
        decision: input.decision,
      }),
    ),

  clearAssistantMessages: (surface) =>
    Promise.resolve(clearAssistantHistory(surface)),
})
