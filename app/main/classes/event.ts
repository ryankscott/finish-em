import { getCalendar } from '../api'

export default class Event {
  constructor(
    key: string,
    title: string,
    description: string,
    startAt: Date,
    endAt: Date,
    allDay: boolean,
    calendarKey: string,
    createdAt: Date,
    location: string,
    attendees: { name: string; email: string }[],
    recurrence: string,
  ) {
    this.key = key
    this.title = title
    this.description = description
    this.startAt = startAt
    this.endAt = endAt
    this.allDay = allDay
    this.calendarKey = calendarKey
    this.createdAt = createdAt
    this.location = location
    this.attendees = attendees
    this.recurrence = recurrence
  }

  calendar(obj, ctx) {
    return getCalendar({ key: this.calendarKey }, ctx)
  }
}
