import * as api from '../api/'
import { loadSchemaSync } from '@graphql-tools/load'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import * as path from 'path'
import { DateTimeResolver, DateResolver, JSONObjectResolver, JSONResolver } from 'graphql-scalars'

export const schema = loadSchemaSync(path.join(process.cwd(), '/app/main/schemas/*.graphql'), {
  loaders: [new GraphQLFileLoader()],
  resolvers: {
    DateTime: DateTimeResolver,
    Date: DateResolver,
    JSONObject: JSONObjectResolver,
    JSON: JSONResolver,
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
}
