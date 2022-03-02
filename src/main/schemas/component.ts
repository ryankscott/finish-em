export const component = `
scalar JSON

type Component {
  key: String!
  viewKey: View!
  location: String!
  type: String!
  parameters: String
  sortOrder: ComponentOrder!
}

input CreateComponentInput {
  key: String!
  viewKey: String!
  location: String!
  type: String!
  parameters: JSON! 
}

input CloneComponentInput {
  key: String!
}

input SetParametersOfComponentInput {
  key: String!
  parameters: JSON!
}

input DeleteComponentInput {
  key: String!
}

input MigrateComponentInput {
  key: String!
  viewKey: String!
  location: String!
  type: String!
  parameters: String!
}

type Query {
  components: [Component]
  component(key: String!): Component
  componentsByView(viewKey: String!): [Component]
}

type Mutation {
  createComponent(input: CreateComponentInput!): Component
  cloneComponent(input: CloneComponentInput!): Component
  setParametersOfComponent(input: SetParametersOfComponentInput!): Component
  migrateComponent(input: MigrateComponentInput!): Component
  deleteComponent(input: DeleteComponentInput!): Component
}
`
