import { Resolvers } from "../resolvers-types";

const calendar: Partial<Resolvers> = {
  Calendar: {
    events: (parent, _, { dataSources }) => {
      return dataSources.appDb.getEventsByCalendar(parent.key);
    },
  },
  Query: {
    calendars: (_, __, { dataSources }) => {
      return dataSources.appDb.getCalendars();
    },
    calendar: (_, { key }, { dataSources }) => {
      return dataSources.appDb.getCalendar(key);
    },
    getActiveCalendar: (_, __, { dataSources }) => {
      return dataSources.appDb.getActiveCalendar();
    },
  },
  Mutation: {
    createCalendar: (_, { input }, { dataSources }) => {
      const { key, name, active } = input;
      return dataSources.appDb.createCalendar(key, name, active);
    },

    setActiveCalendar: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.appDb.setActiveCalendar(key);
    },
  },
};

export default calendar;
