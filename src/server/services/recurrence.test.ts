import { describe, expect, it } from 'bun:test'

import {
  getNextOccurrence,
  presetToRRule,
  validateRRuleSubset,
} from '@/server/services/recurrence'

describe('recurrence service', () => {
  it('maps presets to RRULE values', () => {
    expect(presetToRRule('daily')).toBe('FREQ=DAILY;INTERVAL=1')
    expect(presetToRRule('every_weekday')).toBe(
      'FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR',
    )
  })

  it('validates supported RRULE subset', () => {
    expect(validateRRuleSubset('FREQ=DAILY;INTERVAL=2')).toBe(true)
    expect(validateRRuleSubset('FREQ=WEEKLY;BYDAY=MO,WE,FR')).toBe(true)
    expect(validateRRuleSubset('FREQ=YEARLY')).toBe(true)
  })

  it('calculates next occurrences for daily and weekly', () => {
    const base = '2026-02-13T09:00:00.000Z'

    expect(
      getNextOccurrence({
        baseIso: base,
        recurrencePreset: 'daily',
        recurrenceRRule: null,
      }),
    ).toBe('2026-02-14T09:00:00.000Z')

    expect(
      getNextOccurrence({
        baseIso: base,
        recurrencePreset: null,
        recurrenceRRule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
      }),
    ).toBe('2026-02-16T09:00:00.000Z')
  })

  it('calculates next occurrence for yearly', () => {
    const base = '2026-02-16T09:00:00.000Z'

    expect(
      getNextOccurrence({
        baseIso: base,
        recurrencePreset: 'yearly',
        recurrenceRRule: null,
      }),
    ).toBe('2027-02-16T09:00:00.000Z')
  })
})
