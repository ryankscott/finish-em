export const component = `
type Component {
  key: String!
  viewKey: View!
  location: String!
  type: String!
  parameters: String
  sortOrder: ComponentOrder!
}

input CreateFilteredItemListComponentInput {
  key: String!
  viewKey: String!
  location: String!
  type: String!
  parameters: FilteredItemListPropsInput
}

input CreateViewHeaderComponentInput {
  key: String!
  viewKey: String!
  location: String!
  type: String!
  parameters: ViewHeaderPropsInput
}

input FilteredItemListPropsInput {
  legacyFilter: String
  filter: String
  hiddenIcons: [String]
  isFilterable: Boolean
  listName: String
  flattenSubtasks: Boolean
  showCompletedToggle: Boolean
  initiallyExpanded: Boolean
}
input SetParametersOfFilteredItemListComponentInput {
  key: String!
  parameters: FilteredItemListPropsInput!
}

input ViewHeaderPropsInput {
  name: String!
  icon: String
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
  createFilteredItemListComponent(input: CreateFilteredItemListComponentInput!): Component
  createViewHeaderComponent(input: CreateViewHeaderComponentInput!): Component
  setParametersOfFilteredItemListComponent(
    input: SetParametersOfFilteredItemListComponentInput!
  ): Component
  migrateComponent(input: MigrateComponentInput!): Component
  deleteComponent(input: DeleteComponentInput!): Component
}
`