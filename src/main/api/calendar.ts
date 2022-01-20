import SQL from 'sql-template-strings'
import Calendar from '../classes/calendar'

export const getCalendars = (obj, ctx): Calendar[] => {
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

export const getCalendar = (input: { key: string }, ctx): Calendar | null => {
  return ctx.db
    .get(
      SQL`SELECT key, name, active, deleted, lastUpdatedAt, deletedAt, createdAt 
      FROM calendar 
      WHERE key = ${input.key}`,
    )
    .then((result) => {
      return result
        ? new Calendar(
            result.key,
            result.name,
            result.active,
            result.deleted,
            result.lastUpdatedAt,
            result.deletedAt,
            result.createdAt,
          )
        : null
    })
}
export const getActiveCalendar = (obj, ctx): Calendar | null => {
  return ctx.db
    .get(
      `SELECT key, name, active, deleted, lastUpdatedAt, deletedAt, createdAt FROM calendar WHERE active = true`,
    )
    .then((result) => {
      return result
        ? new Calendar(
            result.key,
            result.name,
            result.active,
            result.deleted,
            result.lastUpdatedAt,
            result.deletedAt,
            result.createdAt,
          )
        : null
    })
}

export const createCalendar = (
  input: {
    key: string
    name: string
    active: boolean
  },
  ctx,
): Calendar | null | Error => {
  return ctx.db
    .run(
      SQL`INSERT OR REPLACE INTO calendar (key, name, active, deleted, lastUpdatedAt, deletedAt, createdAt ) 
      VALUES (${input.key},${input.name},${input.active}, false, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));`,
    )
    .then((result) => {
      return getCalendar({ key: input.key }, ctx)
    })
}
export const deleteCalendar = (input: { key: string }, ctx): Calendar | null | Error => {
  return ctx.db
    .run(
      SQL`UPDATE calendar 
      SET deleted = true, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), deletedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
      WHERE key = ${input.key}`,
    )
    .then((result) => {
      return result.changes
        ? getCalendar({ key: input.key }, ctx)
        : new Error('Unable to delete calendar')
    })
}

export const setActiveCalendar = async (
  input: { key: string },
  ctx,
): Promise<Calendar | null | Error> => {
  const setFalse = await ctx.db.run(SQL`UPDATE calendar SET active = false`)
  if (!setFalse.changes) {
    return new Error('Unable to set all calendars inactive')
  }
  const setTrue = await ctx.db.run(SQL`
       UPDATE calendar 
       SET active = true, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
       WHERE key = ${input.key};`)
  if (setTrue.result) {
    return setTrue.result.changes
      ? getCalendar({ key: input.key }, ctx)
      : new Error('Unable to set active calendar')
  }
}

export const calendarRootValues = {
  calendars: ({ input }, ctx) => {
    return getCalendars(input, ctx)
  },
  calendar: (key, ctx) => {
    return getCalendar(key, ctx)
  },
  createCalendar: ({ input }, ctx) => {
    return createCalendar(input, ctx)
  },
  deleteCalendar: ({ input }, ctx) => {
    return deleteCalendar(input, ctx)
  },
  setActiveCalendar: ({ input }, ctx) => {
    return setActiveCalendar(input, ctx)
  },
  getActiveCalendar: ({ input }, ctx) => {
    return getActiveCalendar(input, ctx)
  },
}
