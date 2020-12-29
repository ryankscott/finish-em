import Event from '../classes/event'
import { getActiveCalendar } from './calendar'

export const getEvents = (obj, ctx) => {
  return ctx.db
    .all(
      'SELECT key, title, description, startAt, endAt, allDay, calendarKey, createdAt FROM event',
    )
    .then((result) =>
      result.map(
        (r) =>
          new Event(
            r.key,
            r.title,
            r.description,
            r.startAt,
            r.endAt,
            r.allDay,
            r.calendarKey,
            r.createdAt,
          ),
      ),
    )
}

export const getEvent = (input: { key: string }, ctx) => {
  return ctx.db
    .get(
      `SELECT key, title, description, startAt, endAt, allDay, calendarKey, createdAt FROM event WHERE key = '${input.key}'`,
    )
    .then(
      (result) =>
        new Event(
          result.key,
          result.title,
          result.description,
          result.startAt,
          result.endAt,
          result.allDay,
          result.calendarKey,
          result.createdAt,
        ),
    )
}

export const deleteEvent = (input: { key: string }, ctx) => {
  return ctx.db.run(`DELETE FROM event WHERE key = '${input.key}'`).then((result) => {
    return result.changes ? input.key : new Error('Unable to delete event')
  })
}

export const getEventsByCalendar = (input: { calendarKey: string }, ctx) => {
  return ctx.db
    .all(
      `SELECT key, title, description, startAt, endAt, allDay, calendarKey, createdAt FROM event WHERE calendarKey = '${input.calendarKey}'`,
    )
    .then((result) =>
      result
        ? result.map(
            (r) =>
              new Event(
                r.key,
                r.title,
                r.description,
                r.startAt,
                r.endAt,
                r.allDay,
                r.calendarKey,
                r.createdAt,
              ),
          )
        : null,
    )
}

export const getEventsForActiveCalendar = async (input, ctx) => {
  const activeCalendar = await getActiveCalendar({}, ctx)
  if (!activeCalendar) return null
  return ctx.db
    .all(
      `SELECT key, title, description, startAt, endAt, allDay, calendarKey, createdAt FROM event WHERE calendarKey = '${activeCalendar.key}'`,
    )
    .then((result) =>
      result
        ? result.map(
            (r) =>
              new Event(
                r.key,
                r.title,
                r.description,
                r.startAt,
                r.endAt,
                r.allDay,
                r.calendarKey,
                r.createdAt,
              ),
          )
        : null,
    )
}

export const createEvent = (
  input: {
    key: string
    title: string
    description: string
    startAt: Date
    endAt: Date
    allDay: boolean
    calendarKey: string
  },
  ctx,
) => {
  return ctx.db
    .run(
      `REPLACE INTO event (key, title, description, startAt, endAt,  allDay, calendarKey, createdAt )
       VALUES ('${input.key}', '${input.title}', '${
        input.description
      }',  '${input.startAt.toISOString()}', '${input.endAt.toISOString()}', ${input.allDay}, '${
        input.calendarKey
      }', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
    )
    .then((result) => {
      return result.changes
        ? getEvent({ key: input.key }, ctx)
        : new Error('Unable to create event')
    })
}

export const eventRootValues = {
  createEvent: ({ input }, ctx) => {
    return createEvent(input, ctx)
  },
  deleteEvent: ({ input }, ctx) => {
    return deleteEvent(input, ctx)
  },
  events: ({ input }, ctx) => {
    return getEvents(input, ctx)
  },
  event: (key, ctx) => {
    return getEvent(key, ctx)
  },
  eventsByCalendar: (calendarKey, ctx) => {
    return getEventsByCalendar(calendarKey, ctx)
  },
  eventsForActiveCalendar: ({ input }, ctx) => {
    return getEventsForActiveCalendar(input, ctx)
  },
}
