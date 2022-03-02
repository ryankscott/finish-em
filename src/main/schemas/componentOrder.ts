export const componentOrder = `
type ComponentOrder {
  componentKey: String!
  sortOrder: Int!
}

input SetComponentOrderInput {
  componentKey: String!
  sortOrder: Int!
}

input CreateComponentOrderInput {
  componentKey: String!
}
input MigrateComponentOrderInput {
  componentKey: String!
  sortOrder: Int!
}

type Query {
  componentOrders: [ComponentOrder]
  componentOrder(componentKey: String!): ComponentOrder
}

type Mutation {
  setComponentOrder(input: SetComponentOrderInput!): ComponentOrder
  createComponentOrder(input: CreateComponentOrderInput!): ComponentOrder
  migrateComponentOrder(input: MigrateComponentOrderInput!): ComponentOrder
}
`
