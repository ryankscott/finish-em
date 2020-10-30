import Calendar from '../classes/calendar'

export const getCalendars = (obj, ctx) => {
  return ctx.db
    .all('SELECT key, name, active, deleted, lastUpdatedAt, deletedAt, createdAt FROM calendar')
    .then((result) =>
      result.map(
        (r) =>
          new Calendar(
            r.key,
            r.name,
            r.active,
            r.deleted,
            r.lastUpdatedAt,
            r.deletedAt,
            r.createdAt,
          ),
      ),
    )
}

//TODO: Not sure why this is an object for key
export const getCalendar = (input: { key: string }, ctx) => {
  return ctx.db
    .get(
      'SELECT key, name, active, deleted, lastUpdatedAt, deletedAt, createdAt FROM calendar WHERE key = ${input.key}',
    )
    .then(
      (result) =>
        new Calendar(
          result.key,
          result.name,
          result.active,
          result.deleted,
          result.lastUpdatedAt,
          result.deletedAt,
          result.createdAt,
        ),
    )
}

export const createCalendar = (
  input: {
    key: string
    name: string
    active: boolean
    deleted: boolean
    lastUpdatedAt: string
    deletedAt: string
    createdAt: string
  },
  ctx,
) => {
  return ctx.db
    .run(
      'INSERT INTO calendar (key, name, active, deleted, lastUpdatedAt, deletedAt, createdAt ) VALUES (?, ?, ?)',
      input.key,
      input.name,
      input.active,
      input.deleted,
      input.lastUpdatedAt,
      input.deletedAt,
      input.createdAt,
    )
    .then((result) => {
      return result.changes
        ? getCalendar({ key: input.key }, ctx)
        : new Error('Unable to create calendar')
    })
}
export const deleteCalendar = (input: { key: string }, ctx) => {
  return ctx.db
    .run(
      `UPDATE calendar SET deleted = true, lastUpdatedAt = current_timestamp, deletedAt = current_timestamp WHERE key = ${input.key}`,
    )
    .then((result) => {
      return result.changes
        ? getCalendar({ key: input.key }, ctx)
        : new Error('Unable to rename calendar')
    })
}

export const changeActiveCalendar = (input: { key: string; active: boolean }, ctx) => {
  return ctx.db
    .run(
      `UPDATE calendar SET active = ${input.active}, lastUpdatedAt = current_timestamp WHERE key = ${input.key}`,
    )
    .then((result) => {
      return result.changes
        ? getCalendar({ key: input.key }, ctx)
        : new Error('Unable to rename calendar')
    })
}
