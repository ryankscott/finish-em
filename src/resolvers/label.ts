import { Resolvers } from '../resolvers-types';

const label: Partial<Resolvers> = {
  Query: {
    labels: (_, __, { dataSources }) => {
      return dataSources.appDb.getLabels();
    },
    label: (_, { key }, { dataSources }) => {
      return dataSources.appDb.getLabel(key);
    },
  },
  Mutation: {
    createLabel: (_, { input }, { dataSources }) => {
      const { key, name, colour } = input;
      return dataSources.appDb.createLabel(key, name, colour);
    },

    renameLabel: (_, { input }, { dataSources }) => {
      const { key, name } = input;
      return dataSources.appDb.renameLabel(key, name);
    },

    setColourOfLabel: (_, { input }, { dataSources }) => {
      const { key, colour } = input;
      return dataSources.appDb.setColourOfLabel(key, colour);
    },

    deleteLabel: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.appDb.deleteLabel(key);
    },
  },
};

export default label;
