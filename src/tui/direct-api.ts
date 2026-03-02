/**
 * Direct API adapter — calls repo/service functions in-process with no transport layer.
 * Shared by the TUI and CLI command surface.
 */

import * as taskRepo from '@/server/repos/tasks'
import * as projectRepo from '@/server/repos/projects'
import * as goalRepo from '@/server/repos/goals'
import * as reminderRepo from '@/server/repos/reminders'
import * as settingsRepo from '@/server/repos/settings'
import { createTaskFromQuickAdd } from '@/server/services/quick-add'

import type { ApiClient } from './api-client'

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

  updateProject: (projectId, input) => {
    const result = projectRepo.updateProject(projectId, input)
    if (!result) throw new Error(`Project ${projectId} not found`)
    return Promise.resolve(result)
  },

  deleteProject: (projectId) => {
    const ok = projectRepo.deleteProject(projectId)
    if (!ok) {
      return Promise.reject(
        new Error(`Project ${projectId} not found or cannot delete inbox`),
      )
    }
    return Promise.resolve()
  },

  listTaskReminders: (taskId) =>
    Promise.resolve(reminderRepo.listTaskReminders(taskId)),

  createReminder: (taskId, input) =>
    Promise.resolve(reminderRepo.createReminder({ taskId, ...input })),

  deleteReminder: (reminderId) => {
    reminderRepo.deleteReminder(reminderId)
    return Promise.resolve()
  },
})
