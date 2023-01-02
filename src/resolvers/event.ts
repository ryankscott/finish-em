import { Resolvers } from "../resolvers-types";

const event: Partial<Resolvers> = {
  Event: {
    calendar: (parent, _, { dataSources }) => {
      return dataSources.appDb.getCalendar(parent.key);
    },
  },
  Query: {
    events: (_, __, { dataSources }) => {
      return dataSources.appDb.getEvents();
    },
    event: (_, { key }, { dataSources }) => {
      return dataSources.appDb.getEvent(key);
    },
    eventsByCalendar: (_, { calendarKey }, { dataSources }) => {
      return dataSources.appDb.getEventsByCalendar(calendarKey);
    },
    eventsForActiveCalendar: (_, __, { dataSources }) => {
      return dataSources.appDb.getEventsForActiveCalendar();
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
        throw new Error("Failed to create event - startAt is required");
      }
      if (!endAt) {
        throw new Error("Failed to create event - endAt is required");
      }
      if (!attendees) {
        throw new Error("Failed to create event - attendees is required");
      }
      return dataSources.appDb.createEvent(
        key,
        title,
        description ?? "",
        startAt,
        endAt,
        allDay ?? false,
        calendarKey ?? "",
        location ?? "",
        // @ts-ignore
        attendees ?? null,
        recurrence
      );
    },

    deleteEvent: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.appDb.deleteEvent(key);
    },
  },
};

export default event;
