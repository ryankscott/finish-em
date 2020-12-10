export const projectOrder = `
type ProjectOrder {
  projectKey: String!
  sortOrder: Int!
}

input CreateProjectOrderInput {
  projectKey: String!
  sortOrder: Int!
}

input SetProjectOrderInput {
  projectKey: String!
  sortOrder: Int!
}

input MigrateProjectOrderInput {
  projectKey: String!
  sortOrder: Int!
}

type Query {
  projectOrders: [ProjectOrder]
  projectOrder(projectKey: String!): ProjectOrder
}

type Mutation {
  setProjectOrder(input: SetProjectOrderInput!): ProjectOrder
  createProjectOrder(input: CreateProjectOrderInput!): ProjectOrder
  migrateProjectOrder(input: MigrateProjectOrderInput!): ProjectOrder
}
`
