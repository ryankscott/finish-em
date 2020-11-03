import * as api from '../api/'
import { loadSchemaSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import * as path from 'path'
import { DateTimeResolver, DateResolver } from 'graphql-scalars'

export const schema = loadSchemaSync(path.join(process.cwd(), '/app/main/schemas/*.graphql'), {
  loaders: [new GraphQLFileLoader()],
  resolvers: {
    DateTime: DateTimeResolver,
    Date: DateResolver,
  },
})

// TODO: Look at removing this
export const rootValue = {
  labels: (obj, ctx) => {
    return api.getLabels(obj, ctx)
  },
  label: (key, ctx) => {
    return api.getLabel(key, ctx)
  },
  createLabel: ({ input }, ctx) => {
    return api.createLabel(input, ctx)
  },
  renameLabel: ({ input }, ctx) => {
    return api.renameLabel(input, ctx)
  },
  setColourOfLabel: ({ input }, ctx) => {
    return api.setColourOfLabel(input, ctx)
  },
  deleteLabel: ({ input }, ctx) => {
    return api.deleteLabel(input, ctx)
  },
  feature: (key, ctx) => {
    return api.getFeature(key, ctx)
  },
  features: (obj, ctx) => {
    return api.getFeatures(obj, ctx)
  },
  createFeature: ({ input }, ctx) => {
    return api.createFeature(input, ctx)
  },
  setFeature: ({ input }, ctx) => {
    return api.setFeature(input, ctx)
  },
  projects: (obj, ctx) => {
    return api.getProjects(obj, ctx)
  },
  projectsByArea: (key, ctx) => {
    return api.getProjectsByArea(key, ctx)
  },
  project: (key, ctx) => {
    return api.getProject(key, ctx)
  },
  createProject: ({ input }, ctx) => {
    return api.createProject(input, ctx)
  },
  migrateProject: ({ input }, ctx) => {
    return api.migrateProject(input, ctx)
  },
  deleteProject: ({ input }, ctx) => {
    return api.deleteProject(input, ctx)
  },
  renameProject: ({ input }, ctx) => {
    return api.renameProject(input, ctx)
  },
  changeDescriptionProject: ({ input }, ctx) => {
    return api.changeDescriptionProject(input, ctx)
  },
  setStartDateOfProject: ({ input }, ctx) => {
    return api.setStartDateOfProject(input, ctx)
  },
  setEndDateOfProject: ({ input }, ctx) => {
    return api.setEndDateOfProject(input, ctx)
  },
  projectOrders: (obj, ctx) => {
    return api.getProjectOrders(obj, ctx)
  },
  projectOrder: (key, ctx) => {
    return api.getProjectOrder(key, ctx)
  },
  setProjectOrder: ({ input }, ctx) => {
    return api.setProjectOrder(input, ctx)
  },
  createProjectOrder: ({ input }, ctx) => {
    return api.createProjectOrder(input, ctx)
  },
  migrateProjectOrder: ({ input }, ctx) => {
    return api.migrateProjectOrder(input, ctx)
  },
  areas: (obj, ctx) => {
    return api.getAreas(obj, ctx)
  },
  area: (key, ctx) => {
    return api.getArea(key, ctx)
  },
  areaOrders: (obj, ctx) => {
    return api.getAreaOrders(obj, ctx)
  },
  areaOrder: (key, ctx) => {
    return api.getAreaOrder(key, ctx)
  },
  setAreaOrder: ({ input }, ctx) => {
    return api.setAreaOrder(input, ctx)
  },
  createAreaOrder: ({ input }, ctx) => {
    return api.createAreaOrder(input, ctx)
  },
  migrateAreaOrder: ({ input }, ctx) => {
    return api.migrateAreaOrder(input, ctx)
  },
  createArea: ({ input }, ctx) => {
    return api.createArea(input, ctx)
  },
  migrateArea: ({ input }, ctx) => {
    return api.migrateArea(input, ctx)
  },
  deleteArea: ({ input }, ctx) => {
    return api.deleteArea(input, ctx)
  },
  renameArea: ({ input }, ctx) => {
    return api.renameArea(input, ctx)
  },
  changeDescriptionArea: ({ input }, ctx) => {
    return api.changeDescriptionArea(input, ctx)
  },
  reminders: (obj, ctx) => {
    return api.getReminders(obj, ctx)
  },
  reminder: (key, ctx) => {
    return api.getReminder(key, ctx)
  },
  createReminder: ({ input }, ctx) => {
    return api.createReminder(input, ctx)
  },
  deleteReminder: ({ input }, ctx) => {
    return api.deleteReminder(input, ctx)
  },
  createCalendar: ({ input }, ctx) => {
    return api.createCalendar(input, ctx)
  },
  deleteCalendar: ({ input }, ctx) => {
    return api.deleteCalendar(input, ctx)
  },
  setActiveCalendar: ({ input }, ctx) => {
    return api.setActiveCalendar(input, ctx)
  },
  createEvent: ({ input }, ctx) => {
    return api.createEvent(input, ctx)
  },
  items: (obj, ctx) => {
    return api.getItems(obj, ctx)
  },
  item: (key, ctx) => {
    return api.getItem(key, ctx)
  },
  createItem: ({ input }, ctx) => {
    return api.createItem(input, ctx)
  },
  deleteItem: ({ input }, ctx) => {
    return api.deleteItem(input, ctx)
  },
  renameItem: ({ input }, ctx) => {
    return api.renameItem(input, ctx)
  },
  setTypeOfItem: ({ input }, ctx) => {
    return api.setTypeOfItem(input, ctx)
  },
  completeItem: ({ input }, ctx) => {
    return api.completeItem(input, ctx)
  },
  uncompleteItem: ({ input }, ctx) => {
    return api.unCompleteItem(input, ctx)
  },
  setRepeatOfItem: ({ input }, ctx) => {
    return api.setRepeatOfItem(input, ctx)
  },
  cloneItem: ({ input }, ctx) => {
    return api.cloneItem(input, ctx)
  },
  setProjectOfItem: ({ input }, ctx) => {
    return api.setProjectOfItem(input, ctx)
  },
  setScheduledDateOfItem: ({ input }, ctx) => {
    return api.setScheduledDateOfItem(input, ctx)
  },
  setDueDateOfItem: ({ input }, ctx) => {
    return api.setDueDateOfItem(input, ctx)
  },
  setParentOfItem: ({ input }, ctx) => {
    return api.setParentOfItem(input, ctx)
  },
  permanentDeleteItem: ({ input }, ctx) => {
    return api.permanentDeleteItem(input, ctx)
  },
  setLabelOfItem: ({ input }, ctx) => {
    return api.setLabelOfItem(input, ctx)
  },
  itemOrders: (obj, ctx) => {
    return api.getItemOrders(obj, ctx)
  },
  itemOrder: (key, ctx) => {
    return api.getItemOrder(key, ctx)
  },
  setItemOrder: ({ input }, ctx) => {
    return api.setItemOrder(input, ctx)
  },
  createItemOrder: ({ input }, ctx) => {
    return api.createItemOrder(input, ctx)
  },
  migrateItem: ({ input }, ctx) => {
    return api.migrateItem(input, ctx)
  },
  migrateItemOrder: ({ input }, ctx) => {
    return api.migrateItemOrder(input, ctx)
  },
}
