import log from 'electron-log';
import { Resolvers } from '../resolvers-types';

const itemOrder: Partial<Resolvers> = {
  ItemOrder: {
    item: (parent, _, { dataSources }) => {
      return dataSources.apolloDb.getItem(parent.itemKey);
    },
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
      const { itemKey, componentKey } = input;
      return dataSources.apolloDb.createItemOrder(itemKey, componentKey);
    },

    setItemOrder(_, { input }, { dataSources }) {
      const { itemKey, componentKey, sortOrder } = input;
      return dataSources.apolloDb.setItemOrder(
        itemKey,
        componentKey,
        sortOrder
      );
    },

    deleteItemOrdersByComponent(_, { input }, { dataSources }) {
      const { componentKey } = input;
      return dataSources.apolloDb.deleteItemOrdersByComponent(componentKey);
    },

    bulkCreateItemOrders(_, { input }, { dataSources }) {
      const { itemKeys, componentKey } = input;
      if (!itemKeys) {
        log.error(`Can't bulk create itemOrdres as itemKeys is missing`);
        throw new Error(`Can't bulk create itemOrdres as itemKeys is missing`);
      }
      return dataSources.apolloDb.bulkCreateItemOrders(
        itemKeys as string[],
        componentKey
      );
    },
  },
};

export default itemOrder;
