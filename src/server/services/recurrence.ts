const WEEKDAY_INDEX: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
}

type ParsedRule = {
  freq: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  interval: number
  byDay: number[]
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function addMonths(date: Date, months: number) {
  const next = new Date(date)
  next.setUTCMonth(next.getUTCMonth() + months)
  return next
}

function parseRRule(rule: string): ParsedRule | null {
  const normalized = rule.trim().toUpperCase()
  const parts = normalized.split(';').filter(Boolean)
  const data = new Map<string, string>()

  for (const part of parts) {
    const [key, value] = part.split('=')
    if (!key || !value) {
      return null
    }
    data.set(key, value)
  }

  const freq = data.get('FREQ')
  if (freq !== 'DAILY' && freq !== 'WEEKLY' && freq !== 'MONTHLY') {
    return null
  }

  const intervalRaw = data.get('INTERVAL')
  const interval = intervalRaw ? Number(intervalRaw) : 1
  if (!Number.isInteger(interval) || interval <= 0) {
    return null
  }

  const byDayRaw = data.get('BYDAY')
  const byDay = byDayRaw
    ? byDayRaw
        .split(',')
        .map((day) => WEEKDAY_INDEX[day])
        .filter((value) => Number.isInteger(value))
    : []

  return { freq, interval, byDay }
}

export function presetToRRule(preset: string | null) {
  switch (preset) {
    case 'daily':
      return 'FREQ=DAILY;INTERVAL=1'
    case 'weekly':
      return 'FREQ=WEEKLY;INTERVAL=1'
    case 'monthly':
      return 'FREQ=MONTHLY;INTERVAL=1'
    case 'every_weekday':
      return 'FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR'
    default:
      return null
  }
}

export function validateRRuleSubset(rule: string | null) {
  if (!rule) {
    return false
  }
  return parseRRule(rule) !== null
}

function nextWeeklyByDay(base: Date, interval: number, byDay: number[]) {
  const allowed = byDay.length > 0 ? byDay : [base.getUTCDay()]
  let cursor = addDays(base, 1)

  for (let i = 0; i < 400; i += 1) {
    const diffDays = Math.floor(
      (cursor.getTime() - base.getTime()) / (1000 * 60 * 60 * 24),
    )
    const weekBucket = Math.floor(diffDays / 7)

    if (weekBucket % interval === 0 && allowed.includes(cursor.getUTCDay())) {
      return cursor
    }

    cursor = addDays(cursor, 1)
  }

  return addDays(base, 7 * interval)
}

export function getNextOccurrence(input: {
  baseIso: string
  recurrencePreset: string | null
  recurrenceRRule: string | null
}): string | null {
  const base = new Date(input.baseIso)
  if (Number.isNaN(base.getTime())) {
    return null
  }

  const ruleText = input.recurrenceRRule || presetToRRule(input.recurrencePreset)
  if (!ruleText) {
    return null
  }

  const parsed = parseRRule(ruleText)
  if (!parsed) {
    return null
  }

  if (parsed.freq === 'DAILY') {
    return addDays(base, parsed.interval).toISOString()
  }

  if (parsed.freq === 'MONTHLY') {
    return addMonths(base, parsed.interval).toISOString()
  }

  return nextWeeklyByDay(base, parsed.interval, parsed.byDay).toISOString()
}
