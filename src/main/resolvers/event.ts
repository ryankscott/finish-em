import { Resolvers } from 'main/resolvers-types';

const event: Partial<Resolvers> = {
  Event: {
    calendar: (parent, _, { dataSources }) => {
      return dataSources.apolloDb.getCalendar(parent.key);
    },
  },
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
      const {
        allDay,
        attendees,
        calendarKey,
        description,
        endAt,
        key,
        location,
        recurrence,
        startAt,
        title,
      } = input;
      return dataSources.apolloDb.createEvent(
        allDay,
        attendees,
        calendarKey,
        description,
        endAt,
        key,
        location,
        recurrence,
        startAt,
        title
      );
    },

    deleteEvent: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.deleteEvent(key);
    },
  },
};

export default event;
