export const itemOrder = `
type ItemOrder {
  itemKey: String!
  sortOrder: Int!
}

input CreateItemOrderInput {
  itemKey: String!
  sortOrder: Int!
}

input SetItemOrderInput {
  itemKey: String!
  sortOrder: Int!
}
input MigrateItemOrderInput {
  itemKey: String!
  sortOrder: Int!
}

type Query {
  itemOrders: [ItemOrder]
  itemOrder(itemKey: String!): ItemOrder
}

type Mutation {
  setItemOrder(input: SetItemOrderInput!): ItemOrder
  createItemOrder(input: CreateItemOrderInput!): ItemOrder
  migrateItemOrder(input: MigrateItemOrderInput!): ItemOrder
}
`
