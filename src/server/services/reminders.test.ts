import { describe, expect, it } from 'bun:test'

import { resolveSnoozeTime } from '@/server/services/reminders'

describe('reminder snooze resolver', () => {
  it('supports due-style presets', () => {
    const now = new Date('2026-02-15T20:00:00.000Z')
    expect(resolveSnoozeTime({ now, preset: 'this_morning' })).toBe(
      '2026-02-16T09:00:00.000Z',
    )
    expect(resolveSnoozeTime({ now, preset: 'this_evening' })).toBe(
      '2026-02-16T18:00:00.000Z',
    )
    expect(resolveSnoozeTime({ now, preset: 'tomorrow_morning' })).toBe(
      '2026-02-16T09:00:00.000Z',
    )
    expect(resolveSnoozeTime({ now, preset: 'next_week' })).toBe(
      '2026-02-22T09:00:00.000Z',
    )
  })

  it('rejects invalid custom durations', () => {
    expect(() =>
      resolveSnoozeTime({
        preset: 'custom',
        customMinutes: 0,
      }),
    ).toThrowError()
  })
})
