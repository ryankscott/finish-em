import Event from '../classes/event'

export const getEvents = (obj, ctx) => {
  return ctx.db
    .all(
      'SELECT key, title, description, deleted, startAt, endAt, allDay, calendarKey, createdAt, deletedAt FROM event',
    )
    .then((result) =>
      result.map(
        (r) =>
          new Event(
            r.key,
            r.title,
            r.description,
            r.deleted,
            r.startAt,
            r.endAt,
            r.allDay,
            r.calendarKey,
            r.createdAt,
            r.deletedAt,
          ),
      ),
    )
}

//TODO: Not sure why this is an object for key
export const getEvent = (input: { key: string }, ctx) => {
  return ctx.db
    .get(
      `SELECT key, title, description, deleted, startAt, endAt, allDay, calendarKey, createdAt, deletedAt FROM event WHERE key = '${input.key}'`,
    )
    .then(
      (result) =>
        new Event(
          result.key,
          result.title,
          result.description,
          result.deleted,
          result.startAt,
          result.endAt,
          result.allDay,
          result.calendarKey,
          result.createdAt,
          result.deletedAt,
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
      `INSERT INTO event (key, title, description, deleted, startAt, endAt,  allDay, calendarKey, createdAt, deletedAt)
       VALUES (${input.key}, ${input.title}, ${input.description}, false, ${input.startAt}, ${input.endAt}, , ${input.allDay}, ${input.calendarKey}, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), null)`,
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
}
