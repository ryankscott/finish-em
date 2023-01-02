import { Resolvers } from '../resolvers-types';

const projectOrder: Partial<Resolvers> = {
  Query: {
    projectOrders: (_, __, { dataSources }) => {
      return dataSources.appDb.getProjectOrders();
    },
    projectOrder: (_, { projectKey }, { dataSources }) => {
      return dataSources.appDb.getProjectOrder(projectKey);
    },
  },
  Mutation: {
    createProjectOrder(_, { input }, { dataSources }) {
      const { projectKey } = input;
      return dataSources.appDb.createProjectOrder(projectKey);
    },

    setProjectOrder(_, { input }, { dataSources }) {
      const { projectKey, sortOrder } = input;
      return dataSources.appDb.setProjectOrder(projectKey, sortOrder);
    },
  },
};

export default projectOrder;
