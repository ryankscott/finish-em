import { describe, expect, it } from 'bun:test'

import { parseQuickAdd } from '@/server/services/quick-add'

describe('quick add parser', () => {
  it('extracts priority, project, due date and recurrence from deterministic parser', async () => {
    const result = await parseQuickAdd(
      'Submit report p1 #Work tomorrow every weekday',
    )

    expect(result.title).toBe('Submit report')
    expect(result.priority).toBe(1)
    expect(result.projectName).toBe('Work')
    expect(result.recurrencePreset).toBe('every_weekday')
    expect(result.source).toBe('deterministic')
    expect(result.dueAt).toBeTruthy()
  })

  it('keeps title when no date tokens are present', async () => {
    const result = await parseQuickAdd('Refactor dashboard layout')
    expect(result.title).toBe('Refactor dashboard layout')
    expect(result.priority).toBeNull()
  })
})
