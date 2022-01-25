import Reminder from '../classes/reminder';
import { getItem } from './item';

export const getReminders = (obj, ctx) => {
  return ctx.db
    .all(
      'SELECT key, text, deleted, remindAt, lastUpdatedAt, deletedAt, createdAt, itemKey FROM reminder'
    )
    .then((result) =>
      result.map(
        (r) =>
          new Reminder(
            r.key,
            r.text,
            r.deleted,
            r.remindAt,
            r.lastUpdatedAt,
            r.deletedAt,
            r.createdAt,
            r.itemKey
          )
      )
    );
};
export const getRemindersByItem = async (input: { itemKey: string }, ctx) => {
  const result = await ctx.db.all(
    `SELECT key, text, deleted, remindAt, lastUpdatedAt, deletedAt, createdAt, itemKey FROM reminder WHERE itemKey = '${input.itemKey}'`
  );
  if (result) {
    return result.map(
      (r) =>
        new Reminder(
          r.key,
          r.text,
          r.deleted,
          r.remindAt,
          r.lastUpdatedAt,
          r.deletedAt,
          r.createdAt,
          r.itemKey
        )
    );
  } else return null;
};

export const getReminder = (input: { key: string }, ctx) => {
  return ctx.db
    .get(
      `SELECT key, text, deleted, remindAt, lastUpdatedAt, deletedAt, createdAt, itemKey FROM reminder WHERE key = '${input.key}'`
    )
    .then((result) =>
      result
        ? new Reminder(
            result.key,
            result.text,
            result.deleted,
            result.remindAt,
            result.lastUpdatedAt,
            result.deletedAt,
            result.createdAt,
            result.itemKey
          )
        : null
    );
};

export const createReminder = (
  input: {
    key: string;
    text: string;
    remindAt: Date;
    itemKey: string;
  },
  ctx
) => {
  return ctx.db
    .run(
      `INSERT INTO reminder (key, text, deleted, remindAt, lastUpdatedAt, deletedAt, createdAt, itemKey)
       VALUES ('${input.key}', '${
        input.text
      }', false, '${input.remindAt.toISOString()}', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), '${
        input.itemKey
      }')`
    )
    .then((result) => {
      return result.changes
        ? getReminder({ key: input.key }, ctx)
        : new Error('Unable to create reminder');
    });
};
export const deleteReminder = (input: { key: string }, ctx) => {
  return ctx.db
    .run(
      `UPDATE reminder SET deleted = true, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), deletedAt = current_timestamp WHERE key = '${input.key}'`
    )
    .then((result) => {
      return result.changes
        ? getReminder({ key: input.key }, ctx)
        : new Error('Unable to delete reminder');
    });
};

export const deleteReminderFromItem = (input: { itemKey: string }, ctx) => {
  return ctx.db
    .run(
      `UPDATE reminder SET deleted = true, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), deletedAt = current_timestamp WHERE itemKey = '${input.itemKey}'`
    )
    .then((result) => {
      return result.changes
        ? getItem({ key: input.itemKey }, ctx)
        : new Error('Unable to delete reminder');
    });
};

export const reminderRootValues = {
  reminders: (obj, ctx) => {
    return getReminders(obj, ctx);
  },
  reminder: (key, ctx) => {
    return getReminder(key, ctx);
  },
  remindersByItem: (itemKey, ctx) => {
    return getRemindersByItem(itemKey, ctx);
  },
  createReminder: ({ input }, ctx) => {
    return createReminder(input, ctx);
  },
  deleteReminder: ({ input }, ctx) => {
    return deleteReminder(input, ctx);
  },
  deleteReminderFromItem: ({ input }, ctx) => {
    return deleteReminderFromItem(input, ctx);
  },
};
