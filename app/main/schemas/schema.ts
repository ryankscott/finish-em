import * as resolvers from '../api/'
import { loadSchemaSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import * as path from 'path'

export const schema = loadSchemaSync(path.join(process.cwd(), '/app/main/schemas/*.graphql'), {
  loaders: [new GraphQLFileLoader()],
})

// TODO: Look at removing this
export const rootValue = {
  labels: (obj, ctx) => {
    return resolvers.getLabels(obj, ctx)
  },
  label: (key, ctx) => {
    return resolvers.getLabel(key, ctx)
  },
  createLabel: ({ input }, ctx) => {
    return resolvers.createLabel(input, ctx)
  },
  renameLabel: ({ input }, ctx) => {
    return resolvers.renameLabel(input, ctx)
  },
  recolourLabel: ({ input }, ctx) => {
    return resolvers.recolourLabel(input, ctx)
  },
  deleteLabel: ({ input }, ctx) => {
    return resolvers.deleteLabel(input, ctx)
  },
  feature: (key, ctx) => {
    return resolvers.getFeature(key, ctx)
  },
  features: (obj, ctx) => {
    return resolvers.getFeatures(obj, ctx)
  },
  createFeature: ({ input }, ctx) => {
    return resolvers.createFeature(input, ctx)
  },
  setFeature: ({ input }, ctx) => {
    return resolvers.setFeature(input, ctx)
  },
  projects: (obj, ctx) => {
    return resolvers.getProjects(obj, ctx)
  },
  projectsByArea: (key, ctx) => {
    return resolvers.getProjectsByArea(key, ctx)
  },
  project: (key, ctx) => {
    return resolvers.getProject(key, ctx)
  },
  createProject: ({ input }, ctx) => {
    return resolvers.createProject(input, ctx)
  },
  deleteProject: ({ input }, ctx) => {
    return resolvers.deleteProject(input, ctx)
  },
  renameProject: ({ input }, ctx) => {
    return resolvers.renameProject(input, ctx)
  },
  changeDescriptionProject: ({ input }, ctx) => {
    return resolvers.changeDescriptionProject(input, ctx)
  },
  setStartDateOfProject: ({ input }, ctx) => {
    return resolvers.setStartDateOfProject(input, ctx)
  },
  setEndDateOfProject: ({ input }, ctx) => {
    return resolvers.setEndDateOfProject(input, ctx)
  },
  projectOrders: (obj, ctx) => {
    return resolvers.getProjectOrders(obj, ctx)
  },
  projectOrder: (key, ctx) => {
    return resolvers.getProjectOrder(key, ctx)
  },
  setProjectOrder: ({ input }, ctx) => {
    return resolvers.setProjectOrder(input, ctx)
  },
  createProjectOrder: ({ input }, ctx) => {
    return resolvers.createProjectOrder(input, ctx)
  },
  areas: (obj, ctx) => {
    return resolvers.getAreas(obj, ctx)
  },
  area: (key, ctx) => {
    return resolvers.getArea(key, ctx)
  },
  areaOrders: (obj, ctx) => {
    return resolvers.getAreaOrders(obj, ctx)
  },
  areaOrder: (key, ctx) => {
    return resolvers.getAreaOrder(key, ctx)
  },
  setAreaOrder: ({ input }, ctx) => {
    return resolvers.setAreaOrder(input, ctx)
  },
  createAreaOrder: ({ input }, ctx) => {
    return resolvers.createAreaOrder(input, ctx)
  },
  createArea: ({ input }, ctx) => {
    return resolvers.createArea(input, ctx)
  },
  deleteArea: ({ input }, ctx) => {
    return resolvers.deleteArea(input, ctx)
  },
  renameArea: ({ input }, ctx) => {
    return resolvers.renameArea(input, ctx)
  },
  changeDescriptionArea: ({ input }, ctx) => {
    return resolvers.changeDescriptionArea(input, ctx)
  },
  reminders: (obj, ctx) => {
    return resolvers.getReminders(obj, ctx)
  },
  reminder: (key, ctx) => {
    return resolvers.getReminder(key, ctx)
  },
  createReminder: ({ input }, ctx) => {
    return resolvers.createReminder(input, ctx)
  },
  deleteReminder: ({ input }, ctx) => {
    return resolvers.deleteReminder(input, ctx)
  },
}
