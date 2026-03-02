import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'

import { resetDbForTests } from '@/server/db/client'
import { createGoal, listGoals, updateGoal } from '@/server/repos/goals'
import { createProject } from '@/server/repos/projects'
import {
  createReminder,
  listTaskReminders,
  snoozeReminder,
} from '@/server/repos/reminders'
import {
  completeTask,
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from '@/server/repos/tasks'

const dbPath = path.join(os.tmpdir(), `finish-em-test-${Date.now()}.db`)

beforeEach(() => {
  process.env.TODO_DB_PATH = dbPath
  resetDbForTests()
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath)
  }
})

afterEach(() => {
  resetDbForTests()
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath)
  }
})

describe('repositories integration', () => {
  it('creates recurring next task on complete', () => {
    const project = createProject({ name: 'Work' })
    const task = createTask({
      projectId: project.id,
      title: 'Daily standup notes',
      priority: 2,
      dueAt: '2026-02-15T09:00:00.000Z',
      recurrencePreset: 'daily',
    })

    const completion = completeTask(task.id)

    expect(completion.task?.status).toBe('completed')
    expect(completion.nextTask).toBeTruthy()
    expect(completion.nextTask?.dueAt).toBe('2026-02-16T09:00:00.000Z')
  })

  it('supports reminders with snoozing', () => {
    const project = createProject({ name: 'Ops' })
    const task = createTask({ projectId: project.id, title: 'Rotate keys' })

    const reminder = createReminder({
      taskId: task.id,
      remindAt: '2026-02-15T12:00:00.000Z',
    })

    expect(listTaskReminders(task.id)).toHaveLength(1)

    const snoozed = snoozeReminder({
      reminderId: reminder.id,
      preset: 'this_evening',
    })

    expect(snoozed?.status).toBe('snoozed')
    expect(snoozed?.snoozedUntil).toBeTruthy()
  })

  it('supports goal creation and completion state', () => {
    const goal = createGoal({
      periodType: 'daily',
      periodStart: '2026-02-15',
      title: 'Ship API docs',
    })

    const updated = updateGoal(goal.id, { done: true })

    expect(updated?.done).toBe(true)
    expect(listGoals({ periodType: 'daily' })).toHaveLength(1)
  })

  it('creates and retrieves tasks', () => {
    const project = createProject({ name: 'Personal' })
    const task = createTask({ projectId: project.id, title: 'Book dentist' })

    expect(getTask(task.id)?.title).toBe('Book dentist')
  })

  it('supports parent + subtask and filtering', () => {
    const project = createProject({ name: 'Work' })
    const parent = createTask({ projectId: project.id, title: 'Launch v2' })
    const subtask = createTask({
      projectId: project.id,
      title: 'Write changelog',
      parentTaskId: parent.id,
    })

    expect(subtask.parentTaskId).toBe(parent.id)
    expect(listTasks({ rootsOnly: true }).some((task) => task.id === parent.id)).toBe(
      true,
    )
    expect(
      listTasks({ parentTaskId: parent.id }).some((task) => task.id === subtask.id),
    ).toBe(true)
  })

  it('rejects assigning a subtask as a parent task', () => {
    const project = createProject({ name: 'Ops' })
    const parent = createTask({ projectId: project.id, title: 'Parent' })
    const child = createTask({
      projectId: project.id,
      title: 'Child',
      parentTaskId: parent.id,
    })

    expect(() =>
      createTask({
        projectId: project.id,
        title: 'Grandchild',
        parentTaskId: child.id,
      }),
    ).toThrow('Parent task cannot be a subtask')
  })

  it('rejects assigning parent task across projects', () => {
    const projectA = createProject({ name: 'A' })
    const projectB = createProject({ name: 'B' })
    const parent = createTask({ projectId: projectA.id, title: 'Parent A' })

    expect(() =>
      createTask({
        projectId: projectB.id,
        title: 'Task B',
        parentTaskId: parent.id,
      }),
    ).toThrow('Parent task must belong to the same project')
  })

  it('rejects setting task parent to itself', () => {
    const project = createProject({ name: 'Self-check' })
    const task = createTask({ projectId: project.id, title: 'Task' })

    expect(() => updateTask(task.id, { parentTaskId: task.id })).toThrow(
      'Task cannot be its own parent',
    )
  })

  it('cascades delete from parent task to subtasks', () => {
    const project = createProject({ name: 'Cascade' })
    const parent = createTask({ projectId: project.id, title: 'Parent' })
    const subtask = createTask({
      projectId: project.id,
      title: 'Child',
      parentTaskId: parent.id,
    })

    expect(deleteTask(parent.id)).toBe(true)
    expect(getTask(parent.id)).toBeNull()
    expect(getTask(subtask.id)).toBeNull()
  })

  it('rejects assigning parent when task already has subtasks', () => {
    const project = createProject({ name: 'Hierarchy' })
    const parent = createTask({ projectId: project.id, title: 'Parent' })
    const child = createTask({
      projectId: project.id,
      title: 'Child',
      parentTaskId: parent.id,
    })
    const anotherRoot = createTask({ projectId: project.id, title: 'Another root' })

    expect(() => updateTask(parent.id, { parentTaskId: anotherRoot.id })).toThrow(
      'A task with subtasks cannot be assigned as a subtask',
    )
    expect(child.parentTaskId).toBe(parent.id)
  })
})
