import { Resolvers } from 'main/resolvers-types';

const area: Partial<Resolvers> = {
  Area: {
    items(parent, _, { dataSources }) {
      return dataSources.apolloDb.getItemsByArea(parent.key);
    },

    projects(parent, _, { dataSources }) {
      return dataSources.apolloDb.getProjectsByArea(parent.key);
    },

    sortOrder(parent, _, { dataSources }) {
      return dataSources.apolloDb.getAreaOrder(parent.key);
    },
  },
  Query: {
    areas: (_, __, { dataSources }) => {
      return dataSources.apolloDb.getAreas();
    },
    area: (_, { key }, { dataSources }) => {
      return dataSources.apolloDb.getArea(key);
    },
  },
  Mutation: {
    createArea: (_, { input }, { dataSources }) => {
      const { key, name, description } = input;
      return dataSources.apolloDb.createArea(key, name, description ?? '');
    },

    deleteArea: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.deleteArea(key);
    },
    renameArea: (_, { input }, { dataSources }) => {
      const { key, name } = input;
      return dataSources.apolloDb.renameArea(key, name);
    },
    setDescriptionOfArea: (_, { input }, { dataSources }) => {
      const { key, description } = input;
      return dataSources.apolloDb.setDescriptionOfArea(key, description);
    },
    setEmojiOfArea: (_, { input }, { dataSources }) => {
      const { key, emoji } = input;
      return dataSources.apolloDb.setEmojiOfArea(key, emoji);
    },
  },
};

export default area;
