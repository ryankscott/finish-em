export type SnoozePreset =
  | 'this_morning'
  | 'this_evening'
  | 'tomorrow_morning'
  | 'next_week'
  | 'custom'

function addMinutes(base: Date, minutes: number) {
  return new Date(base.getTime() + minutes * 60 * 1000)
}

function atHour(base: Date, hour: number) {
  const next = new Date(base)
  next.setUTCHours(hour, 0, 0, 0)
  return next
}

function thisMorning(base: Date) {
  const candidate = atHour(base, 9)
  if (candidate.getTime() <= base.getTime()) {
    candidate.setDate(candidate.getDate() + 1)
  }
  return candidate
}

function thisEvening(base: Date) {
  const candidate = atHour(base, 18)
  if (candidate.getTime() <= base.getTime()) {
    candidate.setDate(candidate.getDate() + 1)
  }
  return candidate
}

function tomorrowMorning(base: Date) {
  const next = new Date(base)
  next.setUTCDate(next.getUTCDate() + 1)
  next.setUTCHours(9, 0, 0, 0)
  return next
}

function nextWeek(base: Date) {
  const next = new Date(base)
  next.setUTCDate(next.getUTCDate() + 7)
  next.setUTCHours(9, 0, 0, 0)
  return next
}

export function resolveSnoozeTime(input: {
  now?: Date
  preset: SnoozePreset
  customMinutes?: number
}): string {
  const base = input.now ?? new Date()

  switch (input.preset) {
    case 'this_morning':
      return thisMorning(base).toISOString()
    case 'this_evening':
      return thisEvening(base).toISOString()
    case 'tomorrow_morning':
      return tomorrowMorning(base).toISOString()
    case 'next_week':
      return nextWeek(base).toISOString()
    case 'custom': {
      const minutes = input.customMinutes ?? 0
      if (!Number.isInteger(minutes) || minutes <= 0) {
        throw new Error('customMinutes must be a positive integer')
      }
      return addMinutes(base, minutes).toISOString()
    }
  }
}

export function isReminderDue(remindAt: string, snoozedUntil: string | null) {
  const now = new Date().getTime()
  const target = snoozedUntil ? new Date(snoozedUntil).getTime() : new Date(remindAt).getTime()
  return target <= now
}
