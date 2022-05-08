import { Resolvers } from 'main/resolvers-types';

const itemOrder: Partial<Resolvers> = {
  ItemOrder: {
    item: ({ item }, _, { dataSources }) => dataSources.item.getItem(item.key),
  },
  Query: {
    itemOrders: (_, __, { dataSources }) => {
      return dataSources.apolloDb.getItemOrders();
    },
    itemOrder: (_, { itemKey, componentKey }, { dataSources }) => {
      return dataSources.apolloDb.getItemOrder(itemKey, componentKey);
    },

    itemOrdersByComponent: (_, { componentKey }, { dataSources }) => {
      return dataSources.apolloDb.getItemOrdersByComponent(componentKey);
    },

    itemOrdersByItem: (_, { itemKey }, { dataSources }) => {
      return dataSources.apolloDb.getItemOrdersByItem(itemKey);
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

    deleteItemOrdersByComponent(_, { input }, { dataSources }) {
      const { componentKey } = input;
      return dataSources.apolloDb.deleteItemOrdersByComponent(componentKey);
    },

    bulkCreateItemOrders(_, { input }, { dataSources }) {
      const { itemKeys } = input;
      return dataSources.apolloDb.bulkCreateItemOrders(itemKeys);
    },
  },
};

export default itemOrder;
