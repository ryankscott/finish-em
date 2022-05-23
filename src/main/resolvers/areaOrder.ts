import { Resolvers } from '../resolvers-types';

const areaOrder: Partial<Resolvers> = {
  Query: {
    areaOrders: (_, __, { dataSources }) => {
      return dataSources.apolloDb.getAreaOrders();
    },
    areaOrder: (_, { areaKey }, { dataSources }) => {
      return dataSources.apolloDb.getAreaOrder(areaKey);
    },
  },
  Mutation: {
    createAreaOrder(_, { input }, { dataSources }) {
      const { areaKey } = input;
      return dataSources.apolloDb.createAreaOrder(areaKey);
    },

    setAreaOrder(_, { input }, { dataSources }) {
      const { areaKey, sortOrder } = input;
      return dataSources.apolloDb.setAreaOrder(areaKey, sortOrder);
    },
  },
};

export default areaOrder;
