import { Resolvers } from '../resolvers-types';

const project: Partial<Resolvers> = {
  Project: {
    items(parent, _, { dataSources }) {
      return dataSources.apolloDb.getItemsByProject(parent.key);
    },
    sortOrder(parent, _, { dataSources }) {
      return dataSources.apolloDb.getProjectOrder(parent.key);
    },
    area(parent, _, { dataSources }) {
      if (!parent.areaKey) {
        return null;
      }
      return dataSources.apolloDb.getArea(parent?.areaKey);
    },
  },
  Query: {
    projects: (_, __, { dataSources }) => {
      return dataSources.apolloDb.getProjects();
    },
    project: (_, { key }, { dataSources }) => {
      return dataSources.apolloDb.getProject(key);
    },
  },
  Mutation: {
    createProject: (_, { input }, { dataSources }) => {
      const { key, name, description, areaKey } = input;
      return dataSources.apolloDb.createProject(
        key,
        name,
        description ?? '',
        areaKey ?? undefined
      );
    },
    deleteProject: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.deleteProject(key);
    },
    renameProject: (_, { input }, { dataSources }) => {
      const { key, name } = input;
      return dataSources.apolloDb.renameProject(key, name);
    },
    setDescriptionOfProject: (_, { input }, { dataSources }) => {
      const { key, description } = input;
      return dataSources.apolloDb.setDescriptionOfProject(key, description);
    },
    setEndDateOfProject: (_, { input }, { dataSources }) => {
      const { key, endAt } = input;
      return dataSources.apolloDb.setEndDateOfProject(key, endAt);
    },
    setStartDateOfProject: (_, { input }, { dataSources }) => {
      const { key, startAt } = input;
      return dataSources.apolloDb.setStartDateOfProject(key, startAt);
    },
    setEmojiOfProject: (_, { input }, { dataSources }) => {
      const { key, emoji } = input;
      return dataSources.apolloDb.setEmojiOfProject(key, emoji);
    },
    setAreaOfProject: (_, { input }, { dataSources }) => {
      const { key, areaKey } = input;
      return dataSources.apolloDb.setAreaOfProject(key, areaKey);
    },
  },
};

export default project;
