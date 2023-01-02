import { Resolvers } from '../resolvers-types';

const component: Partial<Resolvers> = {
  Component: {
    sortOrder: (parent, __, { dataSources }) => {
      return dataSources.appDb.getComponentOrder(parent.key);
    },
  },
  Query: {
    components: (_, __, { dataSources }) => {
      return dataSources.appDb.getComponents();
    },
    component: (_, { key }, { dataSources }) => {
      return dataSources.appDb.getComponent(key);
    },
    componentsByView: (_, { viewKey }, { dataSources }) => {
      return dataSources.appDb.getComponentsByView(viewKey);
    },
  },
  Mutation: {
    createComponent: (_, { input }, { dataSources }) => {
      const { key, viewKey, location, type, parameters } = input;
      return dataSources.appDb.createComponent(
        key,
        viewKey,
        location,
        type,
        parameters
      );
    },

    cloneComponent: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.appDb.cloneComponent(key);
    },

    deleteComponent: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.appDb.deleteComponent(key);
    },

    setParametersOfComponent: (_, { input }, { dataSources }) => {
      const { key, parameters } = input;
      return dataSources.appDb.setParametersOfComponent(key, parameters);
    },
  },
};

export default component;
