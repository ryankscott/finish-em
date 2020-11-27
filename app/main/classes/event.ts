import { getCalendar } from '../api'

export default class Event {
  constructor(
    key: string,
    title: string,
    description: string,
    startAt: string,
    endAt: string,
    allDay: boolean,
    calendarKey: string,
    createdAt: string,
  ) {
    this.key = key
    this.title = title
    this.description = description
    this.startAt = startAt
    this.endAt = endAt
    this.allDay = allDay
    this.calendarKey = calendarKey
    this.createdAt = createdAt
  }

  calendar(obj, ctx) {
    return getCalendar({ key: this.calendarKey }, ctx)
  }
}
