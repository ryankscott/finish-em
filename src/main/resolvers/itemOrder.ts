import { Resolvers } from 'main/resolvers-types';

const itemOrder: Partial<Resolvers> = {
  Query: {
    itemOrders: (_, __, { dataSources }) => {
      return dataSources.apolloDb.getItemOrders();
    },
    itemOrder: (_, { itemKey }, { dataSources }) => {
      return dataSources.apolloDb.getItemOrder(itemKey);
    },
  },
  Mutation: {
    createItemOrder(_, { input }, { dataSources }) {
      const { itemKey } = input;
      return dataSources.apolloDb.createItemOrder(itemKey);
    },

    setItemOrder(_, { input }, { dataSources }) {
      const { itemKey, sortOrder } = input;
      return dataSources.apolloDb.setItemOrder(itemKey, sortOrder);
    },
  },
};

export default itemOrder;
