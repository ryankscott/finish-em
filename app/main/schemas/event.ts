export const event = `
scalar DateTime

type Event {
  key: String!
  title: String!
  startAt: DateTime
  endAt: DateTime
  createdAt: DateTime
  description: String
  allDay: Boolean
  calendar: Calendar
}

input CreateEventInput {
  key: String!
  title: String!
  startAt: DateTime
  endAt: DateTime
  description: String
  allDay: Boolean
  calendarKey: String
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
