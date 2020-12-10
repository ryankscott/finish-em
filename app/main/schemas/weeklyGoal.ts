export const weeklyGoal = `
type WeeklyGoal {
  key: String!
  week: String!
  goal: String
}

input CreateWeeklyGoalInput {
  key: String!
  week: String!
  goal: String
}

type Query {
  weeklyGoals: [WeeklyGoal]
  weeklyGoal(key: String!): WeeklyGoal
  weeklyGoalByName(name: String!): WeeklyGoal
}

type Mutation {
  createWeeklyGoal(input: CreateWeeklyGoalInput!): WeeklyGoal
}
`
