import { Resolvers } from 'main/resolvers-types';

const projectOrder: Partial<Resolvers> = {
  Query: {
    projectOrders: (_, __, { dataSources }) => {
      return dataSources.apolloDb.getProjectOrders();
    },
    projectOrder: (_, { projectKey }, { dataSources }) => {
      return dataSources.apolloDb.getProjectOrder(projectKey);
    },
  },
  Mutation: {
    createProjectOrder(_, { input }, { dataSources }) {
      const { projectKey } = input;
      return dataSources.apolloDb.createProjectOrder(projectKey);
    },

    setProjectOrder(_, { input }, { dataSources }) {
      const { projectKey, sortOrder } = input;
      return dataSources.apolloDb.setProjectOrder(projectKey, sortOrder);
    },
  },
};

export default projectOrder;
