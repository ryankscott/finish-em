import { describe, expect, it, vi } from 'vitest'

import { createApi } from '@/tui/api'

describe('createApi', () => {
  it('sends PATCH request for updateProject', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          id: 1,
          name: 'Updated',
          emoji: '🚀',
          description: 'desc',
          startAt: null,
          endAt: null,
          color: '#ef4444',
          isInbox: false,
          createdAt: '2026-02-24T00:00:00.000Z',
          updatedAt: '2026-02-24T00:00:00.000Z',
        }),
      status: 200,
      statusText: 'OK',
    })

    vi.stubGlobal('fetch', fetchMock)
    const api = createApi('http://localhost:8787')

    const result = await api.updateProject(1, { name: 'Updated' })

    expect(result.name).toBe('Updated')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8787/api/projects/1',
      expect.objectContaining({ method: 'PATCH' }),
    )

    vi.unstubAllGlobals()
  })

  it('sends DELETE request for deleteProject', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
      status: 204,
      statusText: 'No Content',
    })

    vi.stubGlobal('fetch', fetchMock)
    const api = createApi('http://localhost:8787')

    await api.deleteProject(2)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8787/api/projects/2',
      expect.objectContaining({ method: 'DELETE' }),
    )

    vi.unstubAllGlobals()
  })
})
