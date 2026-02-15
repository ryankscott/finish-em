export function toDateInputValue(iso: string | null) {
  if (!iso) {
    return ''
  }
  return iso.slice(0, 10)
}

export function fromDateInputValue(value: string): string | null {
  if (!value) {
    return null
  }
  const date = new Date(`${value}T09:00:00`)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date.toISOString()
}

export function startOfDay(date = new Date()) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export function endOfDay(date = new Date()) {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

export function startOfWeek(date = new Date()) {
  const next = startOfDay(date)
  const day = next.getDay()
  const diff = (day + 6) % 7
  next.setDate(next.getDate() - diff)
  return next
}

export function formatDateLabel(iso: string | null) {
  if (!iso) {
    return 'No date'
  }
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return 'Invalid date'
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  })
}
