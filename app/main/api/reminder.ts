import Reminder from '../classes/reminder'

export const getReminders = (obj, ctx) => {
  return ctx.db
    .all(
      'SELECT key, name, deleted, remindAt, lastUpdatedAt, deletedAt, createdAt, itemKey FROM reminder',
    )
    .then((result) =>
      result.map(
        (r) =>
          new Reminder(
            r.key,
            r.name,
            r.deleted,
            r.remindAt,
            r.lastUpdatedAt,
            r.deletedAt,
            r.createdAt,
            r.itemKey,
          ),
      ),
    )
}

export const getReminder = (input: { key: string }, ctx) => {
  return ctx.db
    .get(
      'SELECT key, name, deleted, remindAt, lastUpdatedAt, deletedAt, createdAt, itemKey FROM reminder WHERE key = $key',
      { $key: input.key },
    )
    .then(
      (result) =>
        new Reminder(
          result.key,
          result.name,
          result.deleted,
          result.remindAt,
          result.lastUpdatedAt,
          result.deletedAt,
          result.createdAt,
          result.itemKey,
        ),
    )
}

export const createReminder = (
  input: {
    key: string
    name: string
    deleted: boolean
    remindAt: string
    lastUpdatedAt: string
    deletedAt: string
    createdAt: string
    itemKey: string
  },
  ctx,
) => {
  return ctx.db
    .run(
      'INSERT INTO reminder (key, name, deleted, remindAt, lastUpdatedAt, deletedAt, createdAt, itemKey) VALUES (?, ?, ?, ?, ?, ?, ?, ? )',
      input.key,
      input.name,
      input.deleted,
      input.remindAt,
      input.lastUpdatedAt,
      input.deletedAt,
      input.createdAt,
    )
    .then((result) => {
      return result.changes
        ? getReminder({ key: input.key }, ctx)
        : new Error('Unable to create reminder')
    })
}
export const deleteReminder = (input: { key: string }, ctx) => {
  return ctx.db
    .run(
      `UPDATE reminder SET deleted = true, lastUpdatedAt = current_timestamp, deletedAt = current_timestamp WHERE key = $key`,
      {
        $key: input.key,
      },
    )
    .then((result) => {
      return result.changes
        ? getReminder({ key: input.key }, ctx)
        : new Error('Unable to rename reminder')
    })
}
