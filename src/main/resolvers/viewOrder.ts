import { Resolvers } from 'main/resolvers-types';

const viewOrder: Partial<Resolvers> = {
  Query: {
    viewOrders: (_, __, { dataSources }) => {
      return dataSources.apolloDb.getViewOrders();
    },
    viewOrder: (_, { viewKey }, { dataSources }) => {
      return dataSources.apolloDb.getViewOrder(viewKey);
    },
  },
  Mutation: {
    createViewOrder(_, { input }, { dataSources }) {
      const { viewKey } = input;
      return dataSources.apolloDb.createViewOrder(viewKey);
    },

    setViewOrder(_, { input }, { dataSources }) {
      const { viewKey, sortOrder } = input;
      return dataSources.apolloDb.setViewOrder(viewKey, sortOrder);
    },
  },
};

export default viewOrder;
