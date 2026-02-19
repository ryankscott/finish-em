import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { TaskList } from '@/components/tasks/TaskList'

const completeTask = vi.fn()
const uncompleteTask = vi.fn()
const updateTask = vi.fn()
const listTaskReminders = vi.fn()
const createReminder = vi.fn()
const snoozeReminder = vi.fn()
const deleteReminder = vi.fn()

vi.mock('@/lib/api-client', () => ({
  api: {
    completeTask: (...args: unknown[]) => completeTask(...args),
    uncompleteTask: (...args: unknown[]) => uncompleteTask(...args),
    updateTask: (...args: unknown[]) => updateTask(...args),
    listTaskReminders: (...args: unknown[]) => listTaskReminders(...args),
    createReminder: (...args: unknown[]) => createReminder(...args),
    snoozeReminder: (...args: unknown[]) => snoozeReminder(...args),
    deleteReminder: (...args: unknown[]) => deleteReminder(...args),
  },
}))

describe('TaskList', () => {
  beforeEach(() => {
    completeTask.mockReset()
    uncompleteTask.mockReset()
    updateTask.mockReset()
    listTaskReminders.mockReset()
    createReminder.mockReset()
    snoozeReminder.mockReset()
    deleteReminder.mockReset()

    completeTask.mockResolvedValue({})
    uncompleteTask.mockResolvedValue({})
    updateTask.mockResolvedValue({})
    listTaskReminders.mockResolvedValue([])
    createReminder.mockResolvedValue({})
    snoozeReminder.mockResolvedValue({})
    deleteReminder.mockResolvedValue({})
  })

  it('toggles selected task completion with x shortcut', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined)

    render(
      <TaskList
        onRefresh={onRefresh}
        tasks={[
          {
            id: 1,
            projectId: 1,
            parentTaskId: null,
            title: 'Test item',
            notes: '',
            priority: 2,
            scheduledAt: null,
            dueAt: null,
            dueTimezone: null,
            recurrencePreset: null,
            recurrenceRRule: null,
            status: 'open',
            completedAt: null,
            createdAt: '2026-02-15T00:00:00.000Z',
            updatedAt: '2026-02-15T00:00:00.000Z',
          },
        ]}
      />,
    )

    fireEvent.keyDown(window, { key: 'x' })

    await waitFor(() => {
      expect(completeTask).toHaveBeenCalledTimes(1)
      expect(onRefresh).toHaveBeenCalledTimes(1)
    })
  })

  it('focuses filter field with slash shortcut', async () => {
    render(
      <TaskList
        onRefresh={() => {}}
        tasks={[]}
      />,
    )

    fireEvent.keyDown(window, { key: '/' })

    await waitFor(() => {
      const input = screen.getByPlaceholderText('Filter tasks...')
      expect(document.activeElement).toBe(input)
    })
  })

  it('enters edit mode with e and exits with Escape discarding local title changes', async () => {
    render(
      <TaskList
        onRefresh={() => {}}
        tasks={[
          {
            id: 1,
            projectId: 1,
            parentTaskId: null,
            title: 'Test item',
            notes: '',
            priority: 2,
            scheduledAt: null,
            dueAt: null,
            dueTimezone: null,
            recurrencePreset: null,
            recurrenceRRule: null,
            status: 'open',
            completedAt: null,
            createdAt: '2026-02-15T00:00:00.000Z',
            updatedAt: '2026-02-15T00:00:00.000Z',
          },
        ]}
      />,
    )

    fireEvent.keyDown(window, { key: 'e' })

    const input = await screen.findByDisplayValue('Test item')
    fireEvent.change(input, { target: { value: 'Changed title' } })
    expect(screen.getByDisplayValue('Changed title')).toBeInTheDocument()

    fireEvent.keyDown(window, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByDisplayValue('Changed title')).not.toBeInTheDocument()
      expect(screen.getByText('Test item')).toBeInTheDocument()
    })
  })

  it('still toggles completion with x while in edit mode', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined)

    render(
      <TaskList
        onRefresh={onRefresh}
        tasks={[
          {
            id: 1,
            projectId: 1,
            parentTaskId: null,
            title: 'Test item',
            notes: '',
            priority: 2,
            scheduledAt: null,
            dueAt: null,
            dueTimezone: null,
            recurrencePreset: null,
            recurrenceRRule: null,
            status: 'open',
            completedAt: null,
            createdAt: '2026-02-15T00:00:00.000Z',
            updatedAt: '2026-02-15T00:00:00.000Z',
          },
        ]}
      />,
    )

    fireEvent.keyDown(window, { key: 'e' })
    fireEvent.keyDown(window, { key: 'x' })

    await waitFor(() => {
      expect(completeTask).toHaveBeenCalledTimes(1)
      expect(onRefresh).toHaveBeenCalledTimes(1)
    })
  })
})
