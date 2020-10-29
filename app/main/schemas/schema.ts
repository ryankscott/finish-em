import { buildSchema } from 'graphql'
import {
  getLabels,
  getLabel,
  createLabel,
  deleteLabel,
  renameLabel,
  recolourLabel,
  createFeature,
  getFeature,
  getFeatures,
  setFeature,
  getProject,
  getProjects,
  createProject,
  deleteProject,
  renameProject,
  changeDescriptionProject,
  setStartDateOfProject,
  setEndDateOfProject,
  getProjectsByArea,
  getArea,
  getAreas,
  getAreaOrder,
  getAreaOrders,
  setAreaOrder,
  createAreaOrder,
  createArea,
  deleteArea,
  renameArea,
  changeDescriptionArea,
  getReminder,
  getReminders,
  createReminder,
  deleteReminder,
  getProjectOrder,
  getProjectOrders,
  setProjectOrder,
  createProjectOrder,
} from '../api/'
import { loadSchemaSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import * as path from 'path'

export const schema = loadSchemaSync(path.join(process.cwd(), '/app/main/schemas/schema.graphql'), {
  loaders: [new GraphQLFileLoader()],
})

// TODO: Look at removing this
export const rootValue = {
  labels: (obj, ctx) => {
    return getLabels(obj, ctx)
  },
  label: (key, ctx) => {
    return getLabel(key, ctx)
  },
  createLabel: ({ input }, ctx) => {
    return createLabel(input, ctx)
  },
  renameLabel: ({ input }, ctx) => {
    return renameLabel(input, ctx)
  },
  recolourLabel: ({ input }, ctx) => {
    return recolourLabel(input, ctx)
  },
  deleteLabel: ({ input }, ctx) => {
    return deleteLabel(input, ctx)
  },
  feature: (key, ctx) => {
    return getFeature(key, ctx)
  },
  features: (obj, ctx) => {
    return getFeatures(obj, ctx)
  },
  createFeature: ({ input }, ctx) => {
    return createFeature(input, ctx)
  },
  setFeature: ({ input }, ctx) => {
    return setFeature(input, ctx)
  },
  projects: (obj, ctx) => {
    return getProjects(obj, ctx)
  },
  projectsByArea: (key, ctx) => {
    return getProjectsByArea(key, ctx)
  },
  project: (key, ctx) => {
    return getProject(key, ctx)
  },
  createProject: ({ input }, ctx) => {
    return createProject(input, ctx)
  },
  deleteProject: ({ input }, ctx) => {
    return deleteProject(input, ctx)
  },
  renameProject: ({ input }, ctx) => {
    return renameProject(input, ctx)
  },
  changeDescriptionProject: ({ input }, ctx) => {
    return changeDescriptionProject(input, ctx)
  },
  setStartDateOfProject: ({ input }, ctx) => {
    return setStartDateOfProject(input, ctx)
  },
  setEndDateOfProject: ({ input }, ctx) => {
    return setEndDateOfProject(input, ctx)
  },
  projectOrders: (obj, ctx) => {
    return getProjectOrders(obj, ctx)
  },
  projectOrder: (key, ctx) => {
    return getProjectOrder(key, ctx)
  },
  setProjectOrder: ({ input }, ctx) => {
    return setProjectOrder(input, ctx)
  },
  createProjectOrder: ({ input }, ctx) => {
    return createProjectOrder(input, ctx)
  },
  areas: (obj, ctx) => {
    return getAreas(obj, ctx)
  },
  area: (key, ctx) => {
    return getArea(key, ctx)
  },
  areaOrders: (obj, ctx) => {
    return getAreaOrders(obj, ctx)
  },
  areaOrder: (key, ctx) => {
    return getAreaOrder(key, ctx)
  },
  setAreaOrder: ({ input }, ctx) => {
    return setAreaOrder(input, ctx)
  },
  createAreaOrder: ({ input }, ctx) => {
    return createAreaOrder(input, ctx)
  },
  createArea: ({ input }, ctx) => {
    return createArea(input, ctx)
  },
  deleteArea: ({ input }, ctx) => {
    return deleteArea(input, ctx)
  },
  renameArea: ({ input }, ctx) => {
    return renameArea(input, ctx)
  },
  changeDescriptionArea: ({ input }, ctx) => {
    return changeDescriptionArea(input, ctx)
  },
  reminders: (obj, ctx) => {
    return getReminders(obj, ctx)
  },
  reminder: (key, ctx) => {
    return getReminder(key, ctx)
  },
  createReminder: ({ input }, ctx) => {
    return createReminder(input, ctx)
  },
  deleteReminder: ({ input }, ctx) => {
    return deleteReminder(input, ctx)
  },
}
