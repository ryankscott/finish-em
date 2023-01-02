import { Resolvers } from "../resolvers-types";

const area: Partial<Resolvers> = {
  Area: {
    items(parent, _, { dataSources }) {
      return dataSources.appDb.getItemsByArea(parent.key);
    },

    projects(parent, _, { dataSources }) {
      return dataSources.appDb.getProjectsByArea(parent.key);
    },

    sortOrder(parent, _, { dataSources }) {
      return dataSources.appDb.getAreaOrder(parent.key);
    },
  },
  Query: {
    areas: (_, __, { dataSources }) => {
      return dataSources.appDb.getAreas();
    },
    area: (_, { key }, { dataSources }) => {
      return dataSources.appDb.getArea(key);
    },
  },
  Mutation: {
    createArea: (_, { input }, { dataSources }) => {
      const { key, name, description } = input;
      return dataSources.appDb.createArea(key, name, description ?? "");
    },

    deleteArea: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.appDb.deleteArea(key);
    },
    renameArea: (_, { input }, { dataSources }) => {
      const { key, name } = input;
      return dataSources.appDb.renameArea(key, name);
    },
    setDescriptionOfArea: (_, { input }, { dataSources }) => {
      const { key, description } = input;
      return dataSources.appDb.setDescriptionOfArea(key, description);
    },
    setEmojiOfArea: (_, { input }, { dataSources }) => {
      const { key, emoji } = input;
      return dataSources.appDb.setEmojiOfArea(key, emoji);
    },
  },
};

export default area;
