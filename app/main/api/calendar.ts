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

export const getCalendar = (input: { key: string }, ctx) => {
  return ctx.db
    .get(
      `SELECT key, name, active, deleted, lastUpdatedAt, deletedAt, createdAt FROM calendar WHERE key = ${input.key}`,
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
  },
  ctx,
) => {
  return ctx.db
    .run(
      `INSERT INTO calendar (key, name, active, deleted, lastUpdatedAt, deletedAt, createdAt ) VALUES (${input.key},${input.key}, ${input.active}, false, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));`,
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
      `UPDATE calendar SET deleted = true, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), deletedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'`,
    )
    .then((result) => {
      return result.changes
        ? getCalendar({ key: input.key }, ctx)
        : new Error('Unable to delete calendar')
    })
}

export const setActiveCalendar = (input: { key: string; active: boolean }, ctx) => {
  return ctx.db
    .run(
      `UPDATE calendar SET active = ${input.active}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'`,
    )
    .then((result) => {
      return result.changes
        ? getCalendar({ key: input.key }, ctx)
        : new Error('Unable to set active calendar')
    })
}
