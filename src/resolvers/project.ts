import { Resolvers } from "../resolvers-types";

const project: Partial<Resolvers> = {
  Project: {
    items(parent, _, { dataSources }) {
      return dataSources.appDb.getItemsByProject(parent.key);
    },
    sortOrder(parent, _, { dataSources }) {
      return dataSources.appDb.getProjectOrder(parent.key);
    },
    area(parent, _, { dataSources }) {
      if (!parent.areaKey) {
        return null;
      }
      return dataSources.appDb.getArea(parent?.areaKey);
    },
  },
  Query: {
    projects: (_, __, { dataSources }) => {
      return dataSources.appDb.getProjects();
    },
    project: (_, { key }, { dataSources }) => {
      return dataSources.appDb.getProject(key);
    },
  },
  Mutation: {
    createProject: (_, { input }, { dataSources }) => {
      const { key, name, description, areaKey } = input;
      return dataSources.appDb.createProject(
        key,
        name,
        description ?? "",
        areaKey ?? undefined
      );
    },
    deleteProject: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.appDb.deleteProject(key);
    },
    renameProject: (_, { input }, { dataSources }) => {
      const { key, name } = input;
      return dataSources.appDb.renameProject(key, name);
    },
    setDescriptionOfProject: (_, { input }, { dataSources }) => {
      const { key, description } = input;
      return dataSources.appDb.setDescriptionOfProject(key, description);
    },
    setEndDateOfProject: (_, { input }, { dataSources }) => {
      const { key, endAt } = input;
      return dataSources.appDb.setEndDateOfProject(key, endAt);
    },
    setStartDateOfProject: (_, { input }, { dataSources }) => {
      const { key, startAt } = input;
      return dataSources.appDb.setStartDateOfProject(key, startAt);
    },
    setEmojiOfProject: (_, { input }, { dataSources }) => {
      const { key, emoji } = input;
      return dataSources.appDb.setEmojiOfProject(key, emoji);
    },
    setAreaOfProject: (_, { input }, { dataSources }) => {
      const { key, areaKey } = input;
      return dataSources.appDb.setAreaOfProject(key, areaKey);
    },
  },
};

export default project;
