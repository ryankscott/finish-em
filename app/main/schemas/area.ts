export const area = `
scalar DateTime

type Area {
  key: String!
  name: String
  deleted: Boolean
  description: String
  lastUpdatedAt: DateTime
  deletedAt: DateTime
  createdAt: DateTime
  projects: [Project]
  items: [Item]
  sortOrder: AreaOrder
}

input MigrateAreaInput {
  key: String!
  name: String
  deleted: Boolean
  description: String
  lastUpdatedAt: DateTime
  deletedAt: DateTime
  createdAt: DateTime
}

input CreateAreaInput {
  key: String!
  name: String!
  description: String
}

input DeleteAreaInput {
  key: String!
}

input RenameAreaInput {
  key: String!
  name: String!
}

input ChangeDescriptionAreaInput {
  key: String!
  description: String!
}

type Query {
  areas: [Area]
  area(key: String!): Area
}

type Mutation {
  createArea(input: CreateAreaInput!): Area
  migrateArea(input: MigrateAreaInput!): Area
  deleteArea(input: DeleteAreaInput!): Area
  renameArea(input: RenameAreaInput!): Area
  changeDescriptionArea(input: ChangeDescriptionAreaInput!): Area
}
`