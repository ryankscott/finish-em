import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { resetDbForTests } from '@/server/db/client'
import { createProject } from '@/server/repos/projects'
import {
  createReminder,
  listTaskReminders,
  snoozeReminder,
} from '@/server/repos/reminders'
import { completeTask, createTask, getTask } from '@/server/repos/tasks'

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

  it('creates and retrieves tasks', () => {
    const project = createProject({ name: 'Personal' })
    const task = createTask({ projectId: project.id, title: 'Book dentist' })

    expect(getTask(task.id)?.title).toBe('Book dentist')
  })
})
