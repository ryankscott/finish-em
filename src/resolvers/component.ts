import { Resolvers } from '../resolvers-types';

const component: Partial<Resolvers> = {
  Component: {
    sortOrder: (parent, __, { dataSources }) => {
      return dataSources.apolloDb.getComponentOrder(parent.key);
    },
  },
  Query: {
    components: (_, __, { dataSources }) => {
      return dataSources.apolloDb.getComponents();
    },
    component: (_, { key }, { dataSources }) => {
      return dataSources.apolloDb.getComponent(key);
    },
    componentsByView: (_, { viewKey }, { dataSources }) => {
      return dataSources.apolloDb.getComponentsByView(viewKey);
    },
  },
  Mutation: {
    createComponent: (_, { input }, { dataSources }) => {
      const { key, viewKey, location, type, parameters } = input;
      return dataSources.apolloDb.createComponent(
        key,
        viewKey,
        location,
        type,
        parameters
      );
    },

    cloneComponent: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.cloneComponent(key);
    },

    deleteComponent: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.deleteComponent(key);
    },

    setParametersOfComponent: (_, { input }, { dataSources }) => {
      const { key, parameters } = input;
      return dataSources.apolloDb.setParametersOfComponent(key, parameters);
    },
  },
};

export default component;
