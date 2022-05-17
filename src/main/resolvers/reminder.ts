import { Resolvers } from 'main/resolvers-types';

const reminder: Partial<Resolvers> = {
  Query: {
    reminders: (_, __, { dataSources }) => {
      return dataSources.apolloDb.getReminders();
    },
    reminder: (_, { key }, { dataSources }) => {
      return dataSources.apolloDb.getReminder(key);
    },
  },
  Mutation: {
    createReminder: (_, { input }, { dataSources }) => {
      const { key, text, remindAt, itemKey } = input;
      return dataSources.apolloDb.createReminder(key, text, remindAt, itemKey);
    },

    deleteReminder: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.deleteReminder(key);
    },

    deleteReminderFromItem: (_, { input }, { dataSources }) => {
      const { itemKey } = input;
      return dataSources.apolloDb.deleteReminderFromItem(itemKey);
    },
  },
};

export default reminder;
