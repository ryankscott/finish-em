import { Resolvers } from '../resolvers-types';

const areaOrder: Partial<Resolvers> = {
  Query: {
    areaOrders: (_, __, { dataSources }) => {
      return dataSources.appDb.getAreaOrders();
    },
    areaOrder: (_, { areaKey }, { dataSources }) => {
      return dataSources.appDb.getAreaOrder(areaKey);
    },
  },
  Mutation: {
    createAreaOrder(_, { input }, { dataSources }) {
      const { areaKey } = input;
      return dataSources.appDb.createAreaOrder(areaKey);
    },

    setAreaOrder(_, { input }, { dataSources }) {
      const { areaKey, sortOrder } = input;
      return dataSources.appDb.setAreaOrder(areaKey, sortOrder);
    },
  },
};

export default areaOrder;
