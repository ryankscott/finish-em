import { Resolvers } from 'main/resolvers-types';

const calendar: Partial<Resolvers> = {
  Query: {
    calendars: (_, __, { dataSources }) => {
      return dataSources.apolloDb.getCalendars();
    },
    calendar: (_, { key }, { dataSources }) => {
      return dataSources.apolloDb.getCalendar(key);
    },
    getActiveCalendar: (_, __, { dataSources }) => {
      return dataSources.apolloDb.getActiveCalendar();
    },
  },
  Mutation: {
    createCalendar: (_, { input }, { dataSources }) => {
      const { key, name, active } = input;
      return dataSources.apolloDb.createCalendar(key, name, active);
    },

    deleteCalendar: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.deleteCalendar(key);
    },

    setActiveCalendar: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.setActiveCalendar(key);
    },
  },
};

export default calendar;
