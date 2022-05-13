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
      if (!startAt) {
        throw new Error('Failed to create event - startAt is required');
      }
      if (!endAt) {
        throw new Error('Failed to create event - endAt is required');
      }
      if (!attendees) {
        throw new Error('Failed to create event - attendees is required');
      }
      return dataSources.apolloDb.createEvent(
        key,
        title,
        description ?? '',
        startAt,
        endAt,
        allDay ?? false,
        calendarKey ?? '',
        location ?? '',
        // @ts-ignore
        attendees ?? null,
        recurrence
      );
    },

    deleteEvent: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.deleteEvent(key);
    },
  },
};

export default event;
