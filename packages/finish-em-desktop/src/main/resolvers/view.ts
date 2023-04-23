import { Resolvers } from '../resolvers-types';

const view: Partial<Resolvers> = {
  View: {
    sortOrder: (parent, __, { dataSources }) => {
      return dataSources.apolloDb.getViewOrder(parent.key);
    },
  },
  Query: {
    views: (_, __, { dataSources }) => {
      return dataSources.apolloDb.getViews();
    },
    view: (_, { key }, { dataSources }) => {
      return dataSources.apolloDb.getView(key);
    },
  },
  Mutation: {
    createView: (_, { input }, { dataSources }) => {
      const { key, name, icon, type } = input;
      return dataSources.apolloDb.createView(key, name, icon ?? '', type);
    },
    deleteView: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.deleteView(key);
    },
    renameView: (_, { input }, { dataSources }) => {
      const { key, name } = input;
      return dataSources.apolloDb.renameView(key, name);
    },
  },
};

export default view;
