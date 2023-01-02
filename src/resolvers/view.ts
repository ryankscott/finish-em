import { Resolvers } from '../resolvers-types';

const view: Partial<Resolvers> = {
  View: {
    sortOrder: (parent, __, { dataSources }) => {
      return dataSources.appDb.getViewOrder(parent.key);
    },
  },
  Query: {
    views: (_, __, { dataSources }) => {
      return dataSources.appDb.getViews();
    },
    view: (_, { key }, { dataSources }) => {
      return dataSources.appDb.getView(key);
    },
  },
  Mutation: {
    createView: (_, { input }, { dataSources }) => {
      const { key, name, icon, type } = input;
      return dataSources.appDb.createView(key, name, icon ?? '', type);
    },
    deleteView: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.appDb.deleteView(key);
    },
    renameView: (_, { input }, { dataSources }) => {
      const { key, name } = input;
      return dataSources.appDb.renameView(key, name);
    },
  },
};

export default view;
