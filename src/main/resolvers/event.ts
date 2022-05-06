import { Resolvers } from 'main/resolvers-types';

const event: Partial<Resolvers> = {
  Query: {
    events: (_, __, { dataSources }) => {
      return dataSources.apolloDb.getEvents();
    },
    event: (_, { key }, { dataSources }) => {
      return dataSources.apolloDb.getEvent(key);
    },
    eventsByCalendar: (_, { calendarKey }, { dataSources }) => {
      return dataSources.apolloDb.getEventsByCalendar(calendarKey);
    },
    eventsForActiveCalendar: (_, __, { dataSources }) => {
      return dataSources.apolloDb.getEventsForActiveCalendar();
    },
  },
  Mutation: {
    createEvent: (_, { input }, { dataSources }) => {
      const { key, name, active } = input;
      return dataSources.apolloDb.createEvent(key, name, active);
    },

    deleteEvent: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.deleteEvent(key);
    },
  },
};

export default event;
