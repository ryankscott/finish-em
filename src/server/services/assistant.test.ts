import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { generateObject } from 'ai'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('ai', () => ({
  generateObject: vi.fn(),
}))

import { createAssistantMessage, listAssistantMessages } from '@/server/repos/assistant'
import { createProject, getProject, listProjects } from '@/server/repos/projects'
import { createTask, getTask } from '@/server/repos/tasks'
import { resetDbForTests } from '@/server/db/client'
import {
  clearAssistantHistory,
  getAssistantState,
  sendAssistantChat,
} from '@/server/services/assistant'

const dbPath = path.join(os.tmpdir(), `finish-em-assistant-test-${Date.now()}.db`)
const originalGeminiApiKey = process.env.GEMINI_API_KEY

beforeEach(() => {
  process.env.TODO_DB_PATH = dbPath
  process.env.GEMINI_API_KEY = 'test-key'
  resetDbForTests()
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath)
  }
})

afterEach(() => {
  resetDbForTests()
  vi.restoreAllMocks()
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath)
  }

  if (originalGeminiApiKey === undefined) {
    delete process.env.GEMINI_API_KEY
  } else {
    process.env.GEMINI_API_KEY = originalGeminiApiKey
  }
})

const mockAssistantReply = (reply: string, proposedActions: Array<Record<string, unknown>>) => {
  vi.mocked(generateObject).mockResolvedValueOnce({
    object: {
      reply,
      proposedActions,
    },
  } as Awaited<ReturnType<typeof generateObject>>)
}

describe('assistant service', () => {
  it('returns assistant state and persists chat messages', async () => {
    mockAssistantReply('You completed two tasks last week.', [])

    const result = await sendAssistantChat({
      surfaceInput: 'ui',
      message: 'How many tasks did I complete last week?',
    })

    expect(result.userMessage.role).toBe('user')
    expect(result.assistantMessage.role).toBe('assistant')

    const state = getAssistantState('ui')
    expect(state.messages.length).toBe(2)
    expect(state.messages[0]?.role).toBe('user')
    expect(state.messages[1]?.role).toBe('assistant')
  })

  it('immediately executes proposed task actions returned from chat generation', async () => {
    const project = createProject({ name: 'Inbox' })
    const task = createTask({
      projectId: project.id,
      title: 'Reschedule me',
      dueAt: '2026-02-20T09:00:00.000Z',
    })

    mockAssistantReply('I rescheduled your overdue task.', [
      {
        type: 'set_task_due_date',
        label: `Reschedule "${task.title}" (#${task.id})`,
        payload: {
          taskId: task.id,
          dueAt: '2026-02-23T12:00:00.000Z',
        },
      },
    ])

    const result = await sendAssistantChat({
      surfaceInput: 'ui',
      message: 'Reschedule overdue tasks to today',
    })

    expect(result.assistantMessage.actions).toHaveLength(1)
    expect(result.assistantMessage.actions[0]?.status).toBe('executed')
    expect(result.assistantMessage.actions[0]?.outcome?.status).toBe('success')
    expect(result.assistantMessage.actions.some((action) => action.status === 'pending')).toBe(false)
    expect(getTask(task.id)?.dueAt).toBe('2026-02-23T12:00:00.000Z')
  })

  it('immediately executes project create and update actions with metadata', async () => {
    const existingProject = createProject({ name: 'Roadmap', color: '#ef4444' })

    mockAssistantReply('I created and updated projects.', [
      {
        type: 'create_project',
        label: 'Create full project',
        payload: {
          name: 'Roadmap 2026',
          emoji: '🚀',
          description: 'Major roadmap planning',
          startAt: '2026-03-01T00:00:00.000Z',
          endAt: '2026-06-30T00:00:00.000Z',
          color: '#3b82f6',
          isInbox: false,
        },
      },
      {
        type: 'update_project',
        label: 'Update project details',
        payload: {
          projectId: existingProject.id,
          name: 'Roadmap Q2',
          color: '#22c55e',
        },
      },
    ])

    const result = await sendAssistantChat({
      surfaceInput: 'ui',
      message: 'Create a roadmap project and rename existing roadmap to Q2',
    })

    const updateAction = result.assistantMessage.actions.find((action) => action.type === 'update_project')
    expect(updateAction?.status).toBe('executed')
    expect(getProject(existingProject.id)?.name).toBe('Roadmap Q2')
    expect(getProject(existingProject.id)?.color).toBe('#22c55e')

    const createAction = result.assistantMessage.actions.find((action) => action.type === 'create_project')
    expect(createAction?.outcome?.status).toBe('success')
    const createdProjectId = createAction?.outcome?.targetId
    expect(createdProjectId).toBeTruthy()
    const createdProject = getProject(createdProjectId as number)
    expect(createdProject?.emoji).toBe('🚀')
    expect(createdProject?.description).toBe('Major roadmap planning')
  })

  it('immediately executes delete_project and removes non-inbox project', async () => {
    const project = createProject({ name: 'To Delete', color: '#ef4444' })

    mockAssistantReply('I deleted that project.', [
      {
        type: 'delete_project',
        label: `Delete project "${project.name}" (#${project.id})`,
        payload: { projectId: project.id },
      },
    ])

    const result = await sendAssistantChat({
      surfaceInput: 'ui',
      message: 'Delete the To Delete project',
    })

    const deleteAction = result.assistantMessage.actions.find(
      (action) => action.type === 'delete_project',
    )
    expect(deleteAction?.status).toBe('executed')
    expect(deleteAction?.outcome?.status).toBe('success')
    expect(getProject(project.id)).toBeNull()
  })

  it('returns failure for delete_project when project does not exist', async () => {
    mockAssistantReply('I tried to delete it.', [
      {
        type: 'delete_project',
        label: 'Delete project',
        payload: { projectId: 99999 },
      },
    ])

    const result = await sendAssistantChat({
      surfaceInput: 'ui',
      message: 'Delete project 99999',
    })

    const deleteAction = result.assistantMessage.actions.find(
      (action) => action.type === 'delete_project',
    )
    expect(deleteAction?.status).toBe('failed')
    expect(deleteAction?.outcome?.errorCode).toBe('PROJECT_NOT_FOUND')
  })

  it('returns failure for delete_project when target is inbox', async () => {
    const inbox = listProjects().find((p) => p.isInbox)!
    mockAssistantReply('I cannot delete inbox.', [
      {
        type: 'delete_project',
        label: 'Delete inbox',
        payload: { projectId: inbox.id },
      },
    ])

    const result = await sendAssistantChat({
      surfaceInput: 'ui',
      message: 'Delete the inbox',
    })

    const deleteAction = result.assistantMessage.actions.find(
      (action) => action.type === 'delete_project',
    )
    expect(deleteAction?.status).toBe('failed')
    expect(deleteAction?.outcome?.errorCode).toBe('CANNOT_DELETE_INBOX')
  })

  it('returns explicit failures for invalid action payloads', async () => {
    const project = createProject({ name: 'Ops' })
    const task = createTask({
      projectId: project.id,
      title: 'Prepare release notes',
    })

    mockAssistantReply('I attempted that action.', [
      {
        type: 'set_task_due_date',
        label: 'Set due date',
        payload: { taskId: task.id, dueAt: 'not-a-date' },
      },
    ])

    const result = await sendAssistantChat({
      surfaceInput: 'ui',
      message: 'Update due date',
    })

    const invalidDateAction = result.assistantMessage.actions.find(
      (action) => action.type === 'set_task_due_date',
    )
    expect(invalidDateAction?.status).toBe('failed')
    expect(invalidDateAction?.outcome?.errorCode).toBe('INVALID_DATE')

    expect(result.assistantMessage.actions).toHaveLength(1)
  })

  it('supports natural-language due date recovery paths during immediate execution', async () => {
    const project = createProject({ name: 'Ops' })
    const task = createTask({
      projectId: project.id,
      title: 'Reschedule me',
      dueAt: '2026-02-20T09:00:00.000Z',
    })

    mockAssistantReply('I moved that to tomorrow.', [
      {
        type: 'set_task_due_date',
        label: `Update '${task.title}' (#${task.id}) to tomorrow`,
        payload: {},
      },
    ])

    const result = await sendAssistantChat({
      surfaceInput: 'ui',
      message: 'Move reschedule me to tomorrow',
    })

    expect(result.assistantMessage.actions[0]?.status).toBe('executed')
    expect(result.assistantMessage.actions[0]?.outcome?.status).toBe('success')
    expect(getTask(task.id)?.dueAt).not.toBeNull()
  })

  it('clears assistant messages by surface', async () => {
    createAssistantMessage({
      surface: 'ui',
      role: 'assistant',
      content: 'hello',
      actions: [],
    })
    createAssistantMessage({
      surface: 'tui',
      role: 'assistant',
      content: 'world',
      actions: [],
    })

    const before = listAssistantMessages({ surface: 'ui' })
    expect(before).toHaveLength(1)

    const result = clearAssistantHistory('ui')
    expect(result.ok).toBe(true)
    expect(result.deleted).toBe(1)

    const uiAfter = listAssistantMessages({ surface: 'ui' })
    const tuiAfter = listAssistantMessages({ surface: 'tui' })
    expect(uiAfter).toHaveLength(0)
    expect(tuiAfter).toHaveLength(1)
  })
})
