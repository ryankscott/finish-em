import { Resolvers } from "../resolvers-types";
const logger = require("../logger");

const itemOrder: Partial<Resolvers> = {
  ItemOrder: {
    item: (parent, _, { dataSources }) => {
      return dataSources.appDb.getItem(parent.itemKey);
    },
  },
  Query: {
    itemOrders: (_, __, { dataSources }) => {
      return dataSources.appDb.getItemOrders();
    },
    itemOrder: (_, { itemKey, componentKey }, { dataSources }) => {
      return dataSources.appDb.getItemOrder(itemKey, componentKey);
    },

    itemOrdersByComponent: (_, { componentKey }, { dataSources }) => {
      return dataSources.appDb.getItemOrdersByComponent(componentKey);
    },

    itemOrdersByItem: (_, { itemKey }, { dataSources }) => {
      return dataSources.appDb.getItemOrdersByItem(itemKey);
    },
  },
  Mutation: {
    createItemOrder(_, { input }, { dataSources }) {
      const { itemKey, componentKey } = input;
      return dataSources.appDb.createItemOrder(itemKey, componentKey);
    },

    setItemOrder(_, { input }, { dataSources }) {
      const { itemKey, componentKey, sortOrder } = input;
      return dataSources.appDb.setItemOrder(itemKey, componentKey, sortOrder);
    },

    deleteItemOrdersByComponent(_, { input }, { dataSources }) {
      const { componentKey } = input;
      return dataSources.appDb.deleteItemOrdersByComponent(componentKey);
    },

    bulkCreateItemOrders(_, { input }, { dataSources }) {
      const { itemKeys, componentKey } = input;
      if (!itemKeys) {
        logger.error(`Can't bulk create itemOrdres as itemKeys is missing`);
        throw new Error(`Can't bulk create itemOrdres as itemKeys is missing`);
      }
      return dataSources.appDb.bulkCreateItemOrders(
        itemKeys as string[],
        componentKey
      );
    },
  },
};

export default itemOrder;
