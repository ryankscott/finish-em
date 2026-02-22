import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createAssistantMessage, listAssistantMessages } from '@/server/repos/assistant'
import { createProject } from '@/server/repos/projects'
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
    expect(getTask(task.id)?.status).toBe('completed')
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
