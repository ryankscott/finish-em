import { Resolvers } from 'main/resolvers-types';

const project: Partial<Resolvers> = {
  Project: {
    items(parent, _, { dataSources }) {
      return dataSources.apolloDb.getItemsByProject(parent.key);
    },
    /* TODO: Implement me
    sortOrder(parent, _, { dataSources }) {},
    */
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
