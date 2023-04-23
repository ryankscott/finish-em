import { Resolvers } from '../resolvers-types';

const label: Partial<Resolvers> = {
  Query: {
    labels: (_, __, { dataSources }) => {
      return dataSources.apolloDb.getLabels();
    },
    label: (_, { key }, { dataSources }) => {
      return dataSources.apolloDb.getLabel(key);
    },
  },
  Mutation: {
    createLabel: (_, { input }, { dataSources }) => {
      const { key, name, colour } = input;
      return dataSources.apolloDb.createLabel(key, name, colour);
    },

    renameLabel: (_, { input }, { dataSources }) => {
      const { key, name } = input;
      return dataSources.apolloDb.renameLabel(key, name);
    },

    setColourOfLabel: (_, { input }, { dataSources }) => {
      const { key, colour } = input;
      return dataSources.apolloDb.setColourOfLabel(key, colour);
    },

    deleteLabel: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.deleteLabel(key);
    },
  },
};

export default label;
