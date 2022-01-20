export const event = `
scalar DateTime

type Attendee {
   name: String
   email: String!
}

input AttendeeInput {
   name: String
   email: String!
}

type Event {
  key: String!
  title: String!
  startAt: DateTime
  endAt: DateTime
  createdAt: DateTime
  description: String
  allDay: Boolean
  calendar: Calendar
  location: String
  attendees: [Attendee]
  recurrence: String
}

input CreateEventInput {
  key: String!
  title: String!
  startAt: DateTime
  endAt: DateTime
  description: String
  allDay: Boolean
  calendarKey: String
  location: String
  attendees: [AttendeeInput]
  recurrence: String
}

input DeleteEventInput {
  key: String!
}

type Query {
  events: [Event]
  event(key: String!): Event
  eventsByCalendar(calendarKey: String!): [Event]
  eventsForActiveCalendar: [Event]
}

type Mutation {
  createEvent(input: CreateEventInput!): Event
  deleteEvent(input: DeleteEventInput!): String
}
`
