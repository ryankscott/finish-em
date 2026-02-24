import { describe, expect, it } from 'vitest'

import { buildOpenApiSpec } from '@/server/services/openapi'

describe('openapi spec', () => {
  it('contains required operations', () => {
    const spec = buildOpenApiSpec()
    const tasksGet = spec.paths['/api/tasks']?.get
    const taskQueryParameterNames = new Set(
      tasksGet?.parameters?.map((parameter) => parameter.name),
    )

    expect(spec.openapi).toBe('3.1.0')
    expect(spec.paths['/api/projects']).toBeTruthy()
    expect(spec.paths['/api/tasks/{taskId}/complete']).toBeTruthy()
    expect(spec.paths['/api/reminders/{reminderId}/snooze']).toBeTruthy()
    expect(spec.paths['/api/quick-add/create']).toBeTruthy()
    expect(spec.paths['/api/settings']).toBeTruthy()
    expect(spec.paths['/api/assistant']).toBeTruthy()
    expect(spec.paths['/api/assistant/chat']).toBeTruthy()
    expect('/api/assistant/actions/decision' in spec.paths).toBe(false)
    expect(spec.paths['/api/assistant/messages']).toBeTruthy()
    expect(spec.paths['/api/openapi/json']).toBeTruthy()

    expect(taskQueryParameterNames.has('projectId')).toBe(true)
    expect(taskQueryParameterNames.has('status')).toBe(true)
    expect(taskQueryParameterNames.has('from')).toBe(true)
    expect(taskQueryParameterNames.has('to')).toBe(true)
    expect(taskQueryParameterNames.has('priority')).toBe(true)
    expect(taskQueryParameterNames.has('noDueDate')).toBe(true)
    expect(taskQueryParameterNames.has('parentTaskId')).toBe(true)
    expect(taskQueryParameterNames.has('rootsOnly')).toBe(true)

    const taskSchema = spec.components.schemas.Task as {
      properties: Record<string, unknown>
    }
    expect(taskSchema.properties.parentTaskId).toBeTruthy()

    const settingsSchema = spec.components.schemas.AppSettings as {
      properties: { aiProvider: { enum: string[] } }
    }
    expect(settingsSchema.properties.aiProvider.enum).toEqual([
      'gemini',
      'openai',
      'lmstudio',
    ])
  })
})
