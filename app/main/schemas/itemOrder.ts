export const itemOrder = `
type ItemOrder {
  item: Item!
  componentKey: String!
  sortOrder: Int!
}

input CreateItemOrderInput {
  itemKey: String!
  componentKey: String!
  sortOrder: Int!
}

input SetItemOrderInput {
  itemKey: String!
  componentKey: String!
  sortOrder: Int!
}
input MigrateItemOrderInput {
  itemKey: String!
  componentKey: String!
  sortOrder: Int!
}

type Query {
  itemOrders: [ItemOrder]
  itemOrder(itemKey: String!): ItemOrder
  itemOrdersByComponent(componentKey: String!): [ItemOrder]
  itemOrdersByItem(itemKey: String!): [ItemOrder]
}

type Mutation {
  setItemOrder(input: SetItemOrderInput!): ItemOrder
  createItemOrder(input: CreateItemOrderInput!): ItemOrder
  migrateItemOrder(input: MigrateItemOrderInput!): ItemOrder
}
`
