export type Priority = 1 | 2 | 3 | 4
export type TaskStatus = 'open' | 'completed'
export type GoalPeriod = 'daily' | 'weekly'
export type ReminderStatus = 'pending' | 'fired' | 'snoozed' | 'dismissed'

export type RecurrencePreset =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'every_weekday'
  | null

export type Project = {
  id: number
  name: string
  emoji: string | null
  description: string
  startAt: string | null
  endAt: string | null
  color: string
  isInbox: boolean
  createdAt: string
  updatedAt: string
}

export type Task = {
  id: number
  projectId: number
  title: string
  notes: string
  priority: Priority
  scheduledAt: string | null
  dueAt: string | null
  dueTimezone: string | null
  recurrencePreset: RecurrencePreset
  recurrenceRRule: string | null
  status: TaskStatus
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export type Reminder = {
  id: number
  taskId: number
  remindAt: string
  status: ReminderStatus
  snoozedUntil: string | null
  createdAt: string
  updatedAt: string
}

export type Goal = {
  id: number
  periodType: GoalPeriod
  periodStart: string
  title: string
  done: boolean
  createdAt: string
  updatedAt: string
}

export type AppSettings = {
  id: 1
  timezone: string
  createdAt: string
  updatedAt: string
}

export type TaskFilters = {
  projectId?: number
  status?: TaskStatus
  from?: string
  to?: string
  noDueDate?: boolean
  priority?: Priority
}
