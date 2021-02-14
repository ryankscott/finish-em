export const item = `
scalar DateTime

type Item {
  key: String!
  type: String
  text: String
  deleted: Boolean
  completed: Boolean
  parent: Item
  project: Project
  dueAt: DateTime
  scheduledAt: DateTime
  lastUpdatedAt: DateTime
  completedAt: DateTime
  createdAt: DateTime
  deletedAt: DateTime
  repeat: String
  label: Label
  area: Area
  children: [Item]
  sortOrders: [ItemOrder]
  reminders: [Reminder]
}

input CreateItemInput {
  key: String!
  type: String!
  text: String!
  description: String
  parentKey: String
  projectKey: String
  dueAt: DateTime
  scheduledAt: DateTime
  repeat: String
  labelKey: String
}

input MigrateItemInput {
  key: String!
  type: String
  text: String
  deleted: Boolean
  completed: Boolean
  parentKey: String
  projectKey: String
  dueAt: DateTime
  scheduledAt: DateTime
  lastUpdatedAt: DateTime
  completedAt: DateTime
  createdAt: DateTime
  deletedAt: DateTime
  repeat: String
  labelKey: String
  areaKey: String
}

input SetTypeOfItemInput {
  key: String!
  type: String!
}

input DeleteItemInput {
  key: String!
}
input RestoreItemInput {
  key: String!
}

input RenameItemInput {
  key: String!
  text: String!
}

input CompleteItemInput {
  key: String!
}

input UnCompleteItemInput {
  key: String!
}

input SetRepeatOfItemInput {
  key: String!
  repeat: String
}

input CloneItemInput {
  key: String!
}

input SetProjectOfItemInput {
  key: String!
  projectKey: String
}

input SetAreaOfItemInput {
  key: String!
  areaKey: String
}

input SetScheduledAtOfItemInput {
  key: String!
  scheduledAt: DateTime
}

input SetDueAtOfItemInput {
  key: String!
  dueAt: DateTime
}

input SetParentOfItemInput {
  key: String!
  parentKey: String
}

input PermanentDeleteInput {
  key: String!
}

input SetLabelOfInput {
  key: String!
  labelKey: String
}

type Query {
  items: [Item]
  item(key: String!): Item
  itemsByProject(projectKey: String!): [Item]
  itemsByArea(areaKey: String!): [Item]
  itemsByFilter(filter: String!, componentKey: String!): [Item]
  itemsByParent(parentKey: String!): [Item]
}

type Mutation {
  createItem(input: CreateItemInput!): Item
  migrateItem(input: MigrateItemInput!): Item
  deleteItem(input: DeleteItemInput!): Item
  restoreItem(input: RestoreItemInput!): Item
  renameItem(input: RenameItemInput!): Item
  setTypeOfItem(input: SetTypeOfItemInput!): Item
  completeItem(input: CompleteItemInput!): Item
  unCompleteItem(input: UnCompleteItemInput!): Item
  setRepeatOfItem(input: SetRepeatOfItemInput!): Item
  cloneItem(input: CloneItemInput!): Item
  setProjectOfItem(input: SetProjectOfItemInput!): Item
  setAreaOfItem(input: SetAreaOfItemInput!): Item
  setScheduledAtOfItem(input: SetScheduledAtOfItemInput!): Item
  setDueAtOfItem(input: SetDueAtOfItemInput!): Item
  setParentOfItem(input: SetParentOfItemInput!): Item
  permanentDeleteItem(input: PermanentDeleteInput!): Item
  setLabelOfItem(input: SetLabelOfInput!): Item
}
`
