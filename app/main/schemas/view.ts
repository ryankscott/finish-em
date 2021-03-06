export const view = `
scalar DateTime

type View {
  key: String!
  name: String!
  icon: String!
  type: String!
  deleted: Boolean!
  deletedAt: DateTime
  createdAt: DateTime
  sortOrder: ViewOrder
}

input MigrateViewInput {
  key: String!
  name: String!
  icon: String
  type: String!
}

input CreateViewInput {
  key: String!
  name: String!
  icon: String
  type: String!
}

input DeleteViewInput {
  key: String!
}

input RenameViewInput {
  key: String!
  name: String!
}

type Query {
  views: [View]
  view(key: String!): View
}

type Mutation {
  createView(input: CreateViewInput!): View
  migrateView(input: MigrateViewInput!): View
  deleteView(input: DeleteViewInput!): View
  renameView(input: RenameViewInput!): View
}
`
