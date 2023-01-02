import { Resolvers } from '../resolvers-types';

const viewOrder: Partial<Resolvers> = {
  Query: {
    viewOrders: (_, __, { dataSources }) => {
      return dataSources.appDb.getViewOrders();
    },
    viewOrder: (_, { viewKey }, { dataSources }) => {
      return dataSources.appDb.getViewOrder(viewKey);
    },
  },
  Mutation: {
    createViewOrder(_, { input }, { dataSources }) {
      const { viewKey } = input;
      return dataSources.appDb.createViewOrder(viewKey);
    },

    setViewOrder(_, { input }, { dataSources }) {
      const { viewKey, sortOrder } = input;
      return dataSources.appDb.setViewOrder(viewKey, sortOrder);
    },
  },
};

export default viewOrder;
