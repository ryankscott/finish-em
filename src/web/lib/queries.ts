import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import type { TaskQuery } from '@/shared/api-client'
import type { Task } from '@/server/types'

import { api } from './api'

export const keys = {
  settings: ['settings'] as const,
  sync: ['sync'] as const,
  projects: ['projects'] as const,
  tasks: (query: TaskQuery = {}) => ['tasks', query] as const,
  deletedTasks: ['tasks', 'deleted'] as const,
  goals: (query: { periodType?: 'daily' | 'weekly'; periodStart?: string } = {}) =>
    ['goals', query] as const,
  reminders: ['reminders'] as const,
  taskReminders: (taskId: number) => ['reminders', 'task', taskId] as const,
}

export function useSettings() {
  return useQuery({ queryKey: keys.settings, queryFn: () => api.getSettings() })
}

export function useProjects() {
  return useQuery({ queryKey: keys.projects, queryFn: () => api.listProjects() })
}

export function useTasks(query: TaskQuery = {}, enabled = true) {
  return useQuery({
    queryKey: keys.tasks(query),
    queryFn: () => api.listTasks(query),
    enabled,
  })
}

export function useDeletedTasks() {
  return useQuery({
    queryKey: keys.deletedTasks,
    queryFn: () => api.listDeletedTasks(),
  })
}

export function useGoals(query: { periodType?: 'daily' | 'weekly'; periodStart?: string }) {
  return useQuery({ queryKey: keys.goals(query), queryFn: () => api.listGoals(query) })
}

export function useAllReminders() {
  return useQuery({ queryKey: keys.reminders, queryFn: () => api.listAllReminders() })
}

export function useTaskReminders(taskId: number | null) {
  return useQuery({
    queryKey: keys.taskReminders(taskId ?? 0),
    queryFn: () => api.listTaskReminders(taskId as number),
    enabled: taskId !== null,
  })
}

export function useSyncStatus() {
  return useQuery({ queryKey: keys.sync, queryFn: () => api.getSyncStatus() })
}

/** Invalidate everything task-shaped after a mutation; cheap at this scale. */
function useInvalidateTasks() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
    queryClient.invalidateQueries({ queryKey: ['projects'] })
    queryClient.invalidateQueries({ queryKey: ['reminders'] })
  }
}

export function useTaskMutations() {
  const invalidate = useInvalidateTasks()

  const completeTask = useMutation({
    mutationFn: (task: Task) =>
      task.status === 'completed'
        ? api.uncompleteTask(task.id)
        : api.completeTask(task.id),
    onSettled: invalidate,
  })

  const deleteTask = useMutation({
    mutationFn: (taskId: number) => api.deleteTask(taskId),
    onSettled: invalidate,
  })

  const undeleteTask = useMutation({
    mutationFn: (taskId: number) => api.undeleteTask(taskId),
    onSettled: invalidate,
  })

  const createTask = useMutation({
    mutationFn: (input: Parameters<typeof api.createTask>[0]) =>
      api.createTask(input),
    onSettled: invalidate,
  })

  const updateTask = useMutation({
    mutationFn: ({
      taskId,
      input,
    }: {
      taskId: number
      input: Parameters<typeof api.updateTask>[1]
    }) => api.updateTask(taskId, input),
    onSettled: invalidate,
  })

  return { completeTask, deleteTask, undeleteTask, createTask, updateTask }
}

export function useProjectMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: keys.projects })
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
  }

  const createProject = useMutation({
    mutationFn: (input: Parameters<typeof api.createProject>[0]) =>
      api.createProject(input),
    onSettled: invalidate,
  })

  const updateProject = useMutation({
    mutationFn: ({
      projectId,
      input,
    }: {
      projectId: number
      input: Parameters<typeof api.updateProject>[1]
    }) => api.updateProject(projectId, input),
    onSettled: invalidate,
  })

  const deleteProject = useMutation({
    mutationFn: (projectId: number) => api.deleteProject(projectId),
    onSettled: invalidate,
  })

  return { createProject, updateProject, deleteProject }
}

export function useGoalMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['goals'] })

  const createGoal = useMutation({
    mutationFn: (input: Parameters<typeof api.createGoal>[0]) =>
      api.createGoal(input),
    onSettled: invalidate,
  })

  const updateGoal = useMutation({
    mutationFn: ({
      goalId,
      input,
    }: {
      goalId: number
      input: Parameters<typeof api.updateGoal>[1]
    }) => api.updateGoal(goalId, input),
    onSettled: invalidate,
  })

  const deleteGoal = useMutation({
    mutationFn: (goalId: number) => api.deleteGoal(goalId),
    onSettled: invalidate,
  })

  return { createGoal, updateGoal, deleteGoal }
}

export function useReminderMutations() {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['reminders'] })

  const createReminder = useMutation({
    mutationFn: ({ taskId, remindAt }: { taskId: number; remindAt: string }) =>
      api.createReminder(taskId, { remindAt }),
    onSettled: invalidate,
  })

  const deleteReminder = useMutation({
    mutationFn: (reminderId: number) => api.deleteReminder(reminderId),
    onSettled: invalidate,
  })

  return { createReminder, deleteReminder }
}

export function useSettingsMutations() {
  const queryClient = useQueryClient()
  const updateSettings = useMutation({
    mutationFn: (input: Parameters<typeof api.updateSettings>[0]) =>
      api.updateSettings(input),
    onSettled: () => queryClient.invalidateQueries({ queryKey: keys.settings }),
  })
  return { updateSettings }
}

export function useSyncMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: keys.sync })
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
  }

  const enableSync = useMutation({ mutationFn: () => api.enableSync(), onSettled: invalidate })
  const disableSync = useMutation({ mutationFn: () => api.disableSync(), onSettled: invalidate })
  const syncNow = useMutation({ mutationFn: () => api.syncNow(), onSettled: invalidate })

  return { enableSync, disableSync, syncNow }
}
