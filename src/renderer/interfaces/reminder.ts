export type ReminderType = {
  id: string | null
  text: string
  deleted: boolean
  remindAt: string
  itemId: string
  lastUpdatedAt: string
  deletedAt: string
  createdAt: string
}

export type Reminders = ReminderType[]
