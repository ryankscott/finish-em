import { Resolvers } from 'main/resolvers-types';

const project: Partial<Resolvers> = {
  Project: {
    items(parent, _, { dataSources }) {
      return dataSources.apolloDb.getItemsByProject(parent.key);
    },
    sortOrder(parent, _, { dataSources }) {
      return dataSources.apolloDb.getProjectOrder(parent.key);
    },
    area(parent, _, { dataSources }) {
      console.log({ parent });
      // TODO: Fix types
      // @ts-ignore
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
  Mutation: {},
};

export default project;
