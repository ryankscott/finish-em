import * as api from '../api/'
import { mergeTypeDefs } from '@graphql-tools/merge'
import { DateTimeResolver, JSONResolver  } from 'graphql-scalars'
import { area } from './area'
import { areaOrder } from './areaOrder'
import { calendar } from './calendar'
import { component } from './component'
import { componentOrder } from './componentOrder'
import { event } from './event'
import { feature } from './feature',
import { item } from './item'
import { itemOrder } from './itemOrder'
import { label } from './label'
import { project } from './project'
import { projectOrder } from './projectOrder'
import { reminder } from './reminder'
import { view } from './view'
import { viewOrder } from './viewOrder'
import { weeklyGoal } from './weeklyGoal'
import { makeExecutableSchema } from '@graphql-tools/schema'

const typeDefs = mergeTypeDefs([
  area,
  areaOrder,
  calendar,
  component,
  componentOrder,
  event,
  feature,
  item,
  itemOrder,
  label,
  project,
  projectOrder,
  reminder,
  view,
  viewOrder,
  weeklyGoal,
])

export const schema = makeExecutableSchema({
  typeDefs: typeDefs,
  resolvers: {
    DateTime: DateTimeResolver,
    JSON: JSONResolver
  },
})

export const rootValue = {
  ...api.itemRootValues,
  ...api.labelRootValues,
  ...api.featureRootValues,
  ...api.projectRootValues,
  ...api.projectOrderRootValues,
  ...api.areaRootValues,
  ...api.areaOrderRootValues,
  ...api.reminderRootValues,
  ...api.calendarRootValues,
  ...api.eventRootValues,
  ...api.itemOrderRootValues,
  ...api.viewRootValues,
  ...api.viewOrderRootValues,
  ...api.componentRootValues,
  ...api.componentOrderRootValues,
  ...api.weeklyGoalRootValues,
}
