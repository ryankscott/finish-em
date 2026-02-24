import fs from 'node:fs'
import { randomUUID } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { resetDbForTests } from '@/server/db/client'
import { createMcpApi } from '@/tui/mcp-api'
import { invokeMcpTool } from '@/utils/mcp-server'

let dbPath = ''

beforeEach(() => {
  dbPath = path.join(os.tmpdir(), `finish-em-mcp-api-test-${randomUUID()}.db`)
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

describe('createMcpApi integration', () => {
  it('supports task/project/goal/reminder operations through MCP tools', async () => {
    const api = createMcpApi()

    const projects = await api.listProjects()
    expect(projects.length).toBeGreaterThan(0)

    const inboxProject = projects.find((project) => project.isInbox)
    expect(inboxProject).toBeDefined()

    const project = await api.createProject({
      name: 'MCP Parity Project',
      color: '#ef4444',
      isInbox: false,
    })
    const updatedProject = await api.updateProject(project.id, {
      name: 'MCP Parity Project Updated',
      emoji: '🛠️',
      description: 'updated through mcp api',
      startAt: '2026-03-01',
      endAt: '2026-06-01',
    })
    expect(updatedProject.name).toBe('MCP Parity Project Updated')
    expect(updatedProject.description).toContain('mcp api')

    const task = await api.createTask({
      projectId: project.id,
      title: 'Ship parity',
      priority: 2,
    })

    const updatedTask = await api.updateTask(task.id, {
      notes: 'updated through mcp api',
      priority: 1,
    })
    expect(updatedTask.notes).toContain('mcp api')

    const completedTask = await api.completeTask(task.id)
    expect(completedTask.status).toBe('completed')

    const uncompletedTask = await api.uncompleteTask(task.id)
    expect(uncompletedTask.status).toBe('open')

    const reminder = await api.createReminder(task.id, {
      remindAt: new Date().toISOString(),
    })

    const reminders = await api.listTaskReminders(task.id)
    expect(reminders.some((item) => item.id === reminder.id)).toBe(true)

    const goal = await api.createGoal({
      periodType: 'daily',
      periodStart: '2026-02-24',
      title: 'Verify MCP parity',
    })

    const updatedGoal = await api.updateGoal(goal.id, { done: true })
    expect(updatedGoal.done).toBe(true)

    await api.deleteReminder(reminder.id)
    await api.deleteTask(task.id)
    await api.deleteGoal(goal.id)
  })

  it('supports assistant state and clear operations through MCP tools', async () => {
    const api = createMcpApi()

    const state = await api.getAssistantState('tui')
    expect(Array.isArray(state.messages)).toBe(true)
    expect(state.settings).toBeDefined()

    const result = await api.clearAssistantMessages('tui')
    expect(result.ok).toBe(true)
    expect(typeof result.deleted).toBe('number')
  })

  it('does not expose assistant decision tool', async () => {
    await expect(
      invokeMcpTool('decide_assistant_action', {
        surface: 'tui',
        messageId: 1,
        actionId: 'a-1',
        decision: 'confirm',
      }),
    ).rejects.toThrow('Unknown MCP tool: decide_assistant_action')
  })
})
