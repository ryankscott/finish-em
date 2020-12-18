import Event from '../classes/event'

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

export const createEvent = (
  input: {
    key: string
    title: string
    description: string
    startAt: string
    endAt: string
    allDay: boolean
    calendarKey: string
  },
  ctx,
) => {
  return ctx.db
    .run(
      `INSERT INTO event (key, title, description, startAt, endAt,  allDay, calendarKey, createdAt )
       VALUES ('${input.key}', '${input.title}', '${input.description}',  '${input.startAt}', '${input.endAt}', ${input.allDay}, '${input.calendarKey}', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`,
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
  event: ({ input }, ctx) => {
    return getEvent(input, ctx)
  },
  eventsByCalendar: ({ input }, ctx) => {
    return getEventsByCalendar(input, ctx)
  },
}
