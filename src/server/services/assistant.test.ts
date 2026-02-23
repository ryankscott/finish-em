import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import * as aiSdk from 'ai'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createAssistantMessage, listAssistantMessages } from '@/server/repos/assistant'
import { createProject, getProject } from '@/server/repos/projects'
import { updateSettings } from '@/server/repos/settings'
import { createTask, getTask } from '@/server/repos/tasks'
import { resetDbForTests } from '@/server/db/client'
import {
  clearAssistantHistory,
  decideAssistantAction,
  getAssistantState,
  sendAssistantChat,
} from '@/server/services/assistant'

const dbPath = path.join(os.tmpdir(), `finish-em-assistant-test-${Date.now()}.db`)

beforeEach(() => {
  process.env.TODO_DB_PATH = dbPath
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
})

describe('assistant service', () => {
  it('requires an API key when Gemini provider is selected', async () => {
    updateSettings({
      aiProvider: 'gemini',
      clearAiApiKey: true,
    })

    const result = await sendAssistantChat({
      surfaceInput: 'ui',
      message: 'Summarize my priorities',
    })

    expect(result.assistantMessage.content).toContain('API key missing for Gemini')
  })

  it('requires an API key when OpenAI provider is selected', async () => {
    updateSettings({
      aiProvider: 'openai',
      clearAiApiKey: true,
    })

    const result = await sendAssistantChat({
      surfaceInput: 'ui',
      message: 'Summarize my priorities',
    })

    expect(result.assistantMessage.content).toContain('API key missing for OpenAI')
  })

  it('does not require an API key when LM Studio provider is selected', async () => {
    updateSettings({
      aiProvider: 'lmstudio',
      aiModel: 'gpt-4o-mini',
      clearAiApiKey: true,
    })

    const result = await sendAssistantChat({
      surfaceInput: 'ui',
      message: 'Summarize my priorities',
    })

    expect(result.assistantMessage.content).not.toContain('API key missing')
  })

  it('returns assistant state and persists chat messages', async () => {
    updateSettings({
      aiProvider: 'lmstudio',
      aiModel: 'gpt-4o-mini',
      aiBaseUrl: 'http://localhost:1234/v1',
      clearAiApiKey: true,
    })

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

  it('auto-executes proposed actions returned from chat generation', async () => {
    updateSettings({
      aiProvider: 'lmstudio',
      aiModel: 'gpt-4o-mini',
      clearAiApiKey: true,
    })

    const project = createProject({ name: 'Inbox' })
    const task = createTask({
      projectId: project.id,
      title: 'Reschedule me',
      dueAt: '2026-02-20T09:00:00.000Z',
    })

    vi.spyOn(aiSdk, 'generateObject').mockResolvedValueOnce({
      object: {
        reply: 'I rescheduled your overdue task.',
        proposedActions: [
          {
            type: 'set_task_due_date',
            label: `Reschedule "${task.title}" (#${task.id})`,
            payload: {
              taskId: task.id,
              dueAt: '2026-02-23T12:00:00.000Z',
            },
          },
        ],
      },
    } as Awaited<ReturnType<typeof aiSdk.generateObject>>)

    const result = await sendAssistantChat({
      surfaceInput: 'ui',
      message: 'Reschedule overdue tasks to today',
    })

    expect(result.assistantMessage.actions).toHaveLength(1)
    expect(result.assistantMessage.actions[0]?.status).toBe('executed')
    expect(result.assistantMessage.actions[0]?.outcome?.status).toBe('success')
    expect(getTask(task.id)?.dueAt).toBe('2026-02-23T12:00:00.000Z')
  })

  it('executes a confirmed assistant action', () => {
    const project = createProject({ name: 'Ops' })
    const task = createTask({
      projectId: project.id,
      title: 'Rotate key',
    })

    const message = createAssistantMessage({
      surface: 'tui',
      role: 'assistant',
      content: 'I can complete that task.',
      actions: [
        {
          id: 'a-1',
          type: 'complete_task',
          label: 'Complete task',
          status: 'pending',
          payload: { taskId: task.id },
          resultMessage: null,
          outcome: null,
        },
      ],
    })

    const decided = decideAssistantAction({
      surfaceInput: 'tui',
      messageId: message.id,
      actionId: 'a-1',
      decision: 'confirm',
    })

    expect(decided.message.actions[0]?.status).toBe('executed')
    expect(decided.outcome.status).toBe('success')
    expect(decided.summary.status).toBe('success')
    expect(getTask(task.id)?.status).toBe('completed')
  })

  it('executes project update actions and returns structured outcomes', () => {
    const project = createProject({ name: 'Roadmap', color: '#ef4444' })

    const message = createAssistantMessage({
      surface: 'ui',
      role: 'assistant',
      content: 'I can rename and recolor the project.',
      actions: [
        {
          id: 'p-1',
          type: 'update_project',
          label: 'Update project details',
          status: 'pending',
          payload: { projectId: project.id, name: 'Roadmap Q2', color: '#3b82f6' },
          resultMessage: null,
          outcome: null,
        },
      ],
    })

    const decided = decideAssistantAction({
      surfaceInput: 'ui',
      messageId: message.id,
      actionId: 'p-1',
      decision: 'confirm',
    })

    expect(decided.outcome.status).toBe('success')
    expect(decided.outcome.targetEntity).toBe('project')
    expect(decided.summary.status).toBe('success')
    expect(getProject(project.id)?.name).toBe('Roadmap Q2')
    expect(getProject(project.id)?.color).toBe('#3b82f6')
  })

  it('fails unsupported or invalid assistant action payloads with explicit outcomes', () => {
    const project = createProject({ name: 'Ops' })
    const task = createTask({
      projectId: project.id,
      title: 'Prepare release notes',
    })

    const message = createAssistantMessage({
      surface: 'ui',
      role: 'assistant',
      content: 'I can update that date.',
      actions: [
        {
          id: 't-1',
          type: 'set_task_due_date',
          label: 'Set due date',
          status: 'pending',
          payload: { taskId: task.id, dueAt: 'not-a-date' },
          resultMessage: null,
          outcome: null,
        },
      ],
    })

    const invalidDate = decideAssistantAction({
      surfaceInput: 'ui',
      messageId: message.id,
      actionId: 't-1',
      decision: 'confirm',
    })

    expect(invalidDate.outcome.status).toBe('failure')
    expect(invalidDate.outcome.errorCode).toBe('INVALID_DATE')
    expect(getTask(task.id)?.dueAt).toBeNull()

    const unsupportedMessage = createAssistantMessage({
      surface: 'ui',
      role: 'assistant',
      content: 'Unsupported action test',
      actions: [
        {
          id: 'u-1',
          type: 'delete_task',
          label: 'Delete task',
          status: 'pending',
          payload: { taskId: task.id },
          resultMessage: null,
          outcome: null,
        },
      ],
    })

    const unsupported = decideAssistantAction({
      surfaceInput: 'ui',
      messageId: unsupportedMessage.id,
      actionId: 'u-1',
      decision: 'confirm',
    })

    expect(unsupported.outcome.status).toBe('failure')
    expect(unsupported.outcome.errorCode).toBe('UNSUPPORTED_ACTION')
    expect(unsupported.summary.status).toBe('failure')
  })

  it('accepts string taskId and natural-language due date in assistant actions', () => {
    const project = createProject({ name: 'Ops' })
    const task = createTask({
      projectId: project.id,
      title: 'Reschedule me',
      dueAt: '2026-02-20T09:00:00.000Z',
    })

    const message = createAssistantMessage({
      surface: 'ui',
      role: 'assistant',
      content: 'I can move that to tomorrow.',
      actions: [
        {
          id: 'nl-1',
          type: 'set_task_due_date',
          label: 'Move due date to tomorrow',
          status: 'pending',
          payload: { taskId: String(task.id), dueAt: 'tomorrow' },
          resultMessage: null,
          outcome: null,
        },
      ],
    })

    const decided = decideAssistantAction({
      surfaceInput: 'ui',
      messageId: message.id,
      actionId: 'nl-1',
      decision: 'confirm',
    })

    expect(decided.outcome.status).toBe('success')
    expect(decided.summary.status).toBe('success')
    expect(getTask(task.id)?.dueAt).not.toBeNull()
  })

  it('recovers set_task_due_date when payload is empty but label has id and date', () => {
    const project = createProject({ name: 'Ops' })
    const task = createTask({
      projectId: project.id,
      title: 'dsafsdaf',
      dueAt: '2026-02-20T09:00:00.000Z',
    })

    const message = createAssistantMessage({
      surface: 'ui',
      role: 'assistant',
      content: 'I updated overdue tasks to tomorrow.',
      actions: [
        {
          id: 'nl-2',
          type: 'set_task_due_date',
          label: `Update '${task.title}' (#${task.id}) to tomorrow`,
          status: 'pending',
          payload: {},
          resultMessage: null,
          outcome: null,
        },
      ],
    })

    const decided = decideAssistantAction({
      surfaceInput: 'ui',
      messageId: message.id,
      actionId: 'nl-2',
      decision: 'confirm',
    })

    expect(decided.outcome.status).toBe('success')
    expect(decided.summary.status).toBe('success')
    expect(getTask(task.id)?.dueAt).not.toBeNull()
  })

  it('recovers set_task_due_date when payload is empty and label has only title', () => {
    const project = createProject({ name: 'Ops' })
    const task = createTask({
      projectId: project.id,
      title: 'dsafsdaf',
      dueAt: '2026-02-20T09:00:00.000Z',
    })

    const message = createAssistantMessage({
      surface: 'ui',
      role: 'assistant',
      content: 'I updated your overdue tasks.',
      actions: [
        {
          id: 'nl-3',
          type: 'set_task_due_date',
          label: "Update 'dsafsdaf' to tomorrow",
          status: 'pending',
          payload: {},
          resultMessage: null,
          outcome: null,
        },
      ],
    })

    const decided = decideAssistantAction({
      surfaceInput: 'ui',
      messageId: message.id,
      actionId: 'nl-3',
      decision: 'confirm',
    })

    expect(decided.outcome.status).toBe('success')
    expect(decided.summary.status).toBe('success')
    expect(getTask(task.id)?.dueAt).not.toBeNull()
  })

  it('reports partial success for multi-action assistant messages', () => {
    const project = createProject({ name: 'Ops' })
    const task = createTask({
      projectId: project.id,
      title: 'Ship release',
    })

    const message = createAssistantMessage({
      surface: 'tui',
      role: 'assistant',
      content: 'I can run both actions.',
      actions: [
        {
          id: 'm-1',
          type: 'complete_task',
          label: 'Complete task',
          status: 'pending',
          payload: { taskId: task.id },
          resultMessage: null,
          outcome: null,
        },
        {
          id: 'm-2',
          type: 'delete_task',
          label: 'Delete task',
          status: 'pending',
          payload: { taskId: task.id },
          resultMessage: null,
          outcome: null,
        },
      ],
    })

    const firstDecision = decideAssistantAction({
      surfaceInput: 'tui',
      messageId: message.id,
      actionId: 'm-1',
      decision: 'confirm',
    })
    expect(firstDecision.summary.status).toBe('pending')

    const secondDecision = decideAssistantAction({
      surfaceInput: 'tui',
      messageId: message.id,
      actionId: 'm-2',
      decision: 'confirm',
    })

    expect(secondDecision.summary.status).toBe('partial_success')
    expect(secondDecision.summary.success).toBe(1)
    expect(secondDecision.summary.failure).toBe(1)
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
