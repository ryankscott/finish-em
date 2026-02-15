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

    expect(taskQueryParameterNames.has('projectId')).toBe(true)
    expect(taskQueryParameterNames.has('status')).toBe(true)
    expect(taskQueryParameterNames.has('from')).toBe(true)
    expect(taskQueryParameterNames.has('to')).toBe(true)
    expect(taskQueryParameterNames.has('priority')).toBe(true)
    expect(taskQueryParameterNames.has('noDueDate')).toBe(true)
  })
})
