import { gql } from '@apollo/client';

/* eslint-disable import/prefer-default-export */
export const GET_DAILY_EVENTS = gql`
  query dailyEvents {
    eventsForActiveCalendar {
      key
      title
      startAt
      endAt
      description
      allDay
      recurrence
      attendees {
        name
        email
      }
      location
    }

    calendarIntegration: featureByName(name: "calendarIntegration") {
      key
      enabled
    }
  }
`;
