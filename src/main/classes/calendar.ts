import { getEventsByCalendar } from '../api'
export default class Calendar {
  constructor(
    key: string,
    name: string,
    active: boolean,
    deleted: boolean,
    lastUpdatedAt: string,
    deletedAt: string,
    createdAt: string,
  ) {
    this.key = key
    this.name = name
    this.active = active
    this.deleted = deleted
    this.lastUpdatedAt = lastUpdatedAt
    this.deletedAt = deletedAt
    this.createdAt = createdAt
  }

  events(obj, ctx) {
    return getEventsByCalendar({ calendarKey: this.key }, ctx)
  }
}
