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
  ...api.itemRootValues,
  ...api.labelRootValues,
  ...api.featureRootValues,
  ...api.projectRootValues,
  ...api.areaRootValues,
  ...api.areaOrderRootValues,
  ...api.reminderRootValues,
  ...api.calendarRootValues,
  ...api.eventRootValues,
  ...api.itemOrderRootValues,
}
