import { Resolvers } from '../resolvers-types';

const calendar: Partial<Resolvers> = {
  Calendar: {
    events: (parent, _, { dataSources }) => {
      return dataSources.apolloDb.getEventsByCalendar(parent.key);
    },
  },
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

    setActiveCalendar: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.setActiveCalendar(key);
    },
  },
};

export default calendar;
