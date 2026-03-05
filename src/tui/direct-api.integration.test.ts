import fs from 'node:fs'
import { randomUUID } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'

import { resetDbForTests } from '@/server/db/client'
import { createDirectApi } from '@/tui/direct-api'

let dbPath = ''

beforeEach(() => {
  dbPath = path.join(os.tmpdir(), `finish-em-direct-api-test-${randomUUID()}.db`)
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

describe('createDirectApi integration', () => {
  it('supports updateProject metadata edits', async () => {
    const api = createDirectApi()

    const project = await api.createProject({
      name: 'Direct Project',
      color: '#22c55e',
    })

    const updated = await api.updateProject(project.id, {
      name: 'Direct Project Updated',
      emoji: '🧪',
      description: 'updated through direct api',
      startAt: '2026-03-01',
      endAt: '2026-05-01',
    })

    expect(updated.name).toBe('Direct Project Updated')
    expect(updated.emoji).toBe('🧪')
    expect(updated.description).toContain('direct api')
    expect(updated.startAt).toBe('2026-03-01')
    expect(updated.endAt).toBe('2026-05-01')
  })

  it('deleteProject removes non-inbox project and reassigns tasks to inbox', async () => {
    const api = createDirectApi()

    const project = await api.createProject({ name: 'To Delete', color: '#ef4444' })
    await api.createTask({
      projectId: project.id,
      title: 'Task in deleted project',
    })

    await api.deleteProject(project.id)

    const projects = await api.listProjects()
    expect(projects.find((p) => p.id === project.id)).toBeUndefined()
    const tasks = await api.listTasks({ projectId: project.id })
    expect(tasks.length).toBe(0)
    const inboxTasks = await api.listTasks({
      projectId: projects.find((p) => p.isInbox)!.id,
    })
    expect(inboxTasks.some((t) => t.title === 'Task in deleted project')).toBe(true)
  })

  it('deleteProject throws for non-existent project', async () => {
    const api = createDirectApi()
    await expect(api.deleteProject(99999)).rejects.toThrow(/not found|inbox/)
  })

  it('deleteProject throws for inbox project', async () => {
    const api = createDirectApi()
    const projects = await api.listProjects()
    const inbox = projects.find((p) => p.isInbox)!
    await expect(api.deleteProject(inbox.id)).rejects.toThrow(/not found|inbox/)
  })

  it('listDueReminders returns due reminders with task titles', async () => {
    const api = createDirectApi()
    const projects = await api.listProjects()
    const inbox = projects.find((p) => p.isInbox)!
    const task = await api.createTask({
      projectId: inbox.id,
      title: 'Task with reminder',
    })
    const past = '2020-01-01T12:00:00.000Z'
    await api.createReminder(task.id, { remindAt: past, status: 'pending' })

    const due = await api.listDueReminders()

    expect(due.length).toBeGreaterThanOrEqual(1)
    const found = due.find((r) => r.taskId === task.id)
    expect(found).toBeDefined()
    expect(found!.taskTitle).toBe('Task with reminder')
    expect(found!.remindAt).toBe(past)
  })
})
