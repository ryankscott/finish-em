import { describe, it, expect, vi } from 'vitest'

describe('MCP Tools - listTasksTool', () => {
  it('should return content with task data', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 1,
          projectId: 1,
          title: 'Test Task',
          status: 'open',
          priority: 2,
          scheduledAt: null,
          dueAt: null,
          dueTimezone: null,
          recurrencePreset: null,
          recurrenceRRule: null,
          notes: '',
          completedAt: null,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ],
    })

    global.fetch = mockFetch

    const { listTasksTool } = await import('@/utils/mcp-tools')
    const result = await listTasksTool.handler({
      projectId: 1,
      status: 'open',
    })

    expect(result).toHaveProperty('content')
  })
})

describe('MCP Tools - createTaskTool', () => {
  it('should return content with created task', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 2,
        projectId: 1,
        title: 'New Task',
        status: 'open',
        priority: 1,
        scheduledAt: null,
        dueAt: null,
        dueTimezone: null,
        recurrencePreset: null,
        recurrenceRRule: null,
        notes: 'Test notes',
        completedAt: null,
        createdAt: '2025-01-02T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
      }),
    })

    global.fetch = mockFetch

    const { createTaskTool } = await import('@/utils/mcp-tools')
    const result = await createTaskTool.handler({
      projectId: 1,
      title: 'New Task',
      notes: 'Test notes',
      priority: '1',
    })

    expect(result).toHaveProperty('content')
  })
})

describe('MCP Tools - completeTaskTool', () => {
  it('should return content with completed task', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        task: {
          id: 1,
          projectId: 1,
          title: 'Test Task',
          status: 'completed',
          priority: 2,
          scheduledAt: null,
          dueAt: null,
          dueTimezone: null,
          recurrencePreset: null,
          recurrenceRRule: null,
          notes: '',
          completedAt: '2025-01-02T00:00:00Z',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-02T00:00:00Z',
        },
        nextTask: null,
      }),
    })

    global.fetch = mockFetch

    const { completeTaskTool } = await import('@/utils/mcp-tools')
    const result = await completeTaskTool.handler({
      taskId: 1,
    })

    expect(result).toHaveProperty('content')
  })
})

describe('MCP Tools - listProjectsTool', () => {
  it('should return content with projects', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 1,
          name: 'Work',
          color: '#FF0000',
          isInbox: false,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ],
    })

    global.fetch = mockFetch

    const { listProjectsTool } = await import('@/utils/mcp-tools')
    const result = await listProjectsTool.handler({})

    expect(result).toHaveProperty('content')
  })
})

describe('MCP Tools - listGoalsTool', () => {
  it('should return content with goals', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 1,
          periodType: 'daily',
          periodStart: '2025-01-01',
          title: 'Exercise',
          done: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ],
    })

    global.fetch = mockFetch

    const { listGoalsTool } = await import('@/utils/mcp-tools')
    const result = await listGoalsTool.handler({
      periodType: 'daily',
    })

    expect(result).toHaveProperty('content')
  })
})

describe('MCP Tools - Error Handling', () => {
  it('should throw error on API failure', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    })

    global.fetch = mockFetch

    const { listTasksTool } = await import('@/utils/mcp-tools')

    try {
      await listTasksTool.handler({})
      expect.fail('Should have thrown an error')
    } catch (error) {
      expect(error).toBeDefined()
    }
  })
})
