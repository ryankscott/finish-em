import { getCalendar } from '../api'

export default class Event {
  constructor(
    key: string,
    title: string,
    description: string,
    deleted: boolean,
    startAt: string,
    endAt: string,
    allDay: boolean,
    calendarKey: string,
    createdAt: string,
    deletedAt: string,
  ) {
    this.key = key
    this.title = title
    this.description = description
    this.deleted = deleted
    this.startAt = startAt
    this.endAt = endAt
    this.allDay = allDay
    this.calendarKey = calendarKey
    this.deletedAt = deletedAt
    this.createdAt = createdAt
  }

  calendar(obj, ctx) {
    return getCalendar({ key: this.calendarKey }, ctx)
  }
}
