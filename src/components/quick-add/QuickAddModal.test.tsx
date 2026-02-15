import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { QuickAddModal } from '@/components/quick-add/QuickAddModal'

const parseQuickAdd = vi.fn()
const createQuickAdd = vi.fn()

vi.mock('@/lib/api-client', () => ({
  api: {
    parseQuickAdd: (...args: unknown[]) => parseQuickAdd(...args),
    createQuickAdd: (...args: unknown[]) => createQuickAdd(...args),
  },
}))

describe('QuickAddModal', () => {
  beforeEach(() => {
    parseQuickAdd.mockReset()
    createQuickAdd.mockReset()
    parseQuickAdd.mockResolvedValue({
      title: 'Test task',
      projectName: null,
      priority: 4,
      dueAt: null,
      scheduledAt: null,
      recurrencePreset: null,
      recurrenceRRule: null,
      warnings: [],
      source: 'deterministic',
      confidence: 0.8,
    })
    createQuickAdd.mockResolvedValue({ task: { id: 1 } })
  })

  it('creates task from quick add input', async () => {
    const onCreated = vi.fn()
    const onClose = vi.fn()

    render(<QuickAddModal open onClose={onClose} onCreated={onCreated} />)

    fireEvent.change(screen.getByPlaceholderText(/Task, priority/i), {
      target: { value: 'Submit report p1 tomorrow' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Add Task/i }))

    await waitFor(() => {
      expect(createQuickAdd).toHaveBeenCalledTimes(1)
      expect(onCreated).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })
})
