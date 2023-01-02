import { Resolvers } from '../resolvers-types';

const reminder: Partial<Resolvers> = {
  Query: {
    reminders: (_, __, { dataSources }) => {
      return dataSources.appDb.getReminders();
    },
    reminder: (_, { key }, { dataSources }) => {
      return dataSources.appDb.getReminder(key);
    },
  },
  Mutation: {
    createReminder: (_, { input }, { dataSources }) => {
      const { key, text, remindAt, itemKey } = input;
      return dataSources.appDb.createReminder(key, text, remindAt, itemKey);
    },

    deleteReminder: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.appDb.deleteReminder(key);
    },

    deleteReminderFromItem: (_, { input }, { dataSources }) => {
      const { itemKey } = input;
      return dataSources.appDb.deleteReminderFromItem(itemKey);
    },
  },
};

export default reminder;
