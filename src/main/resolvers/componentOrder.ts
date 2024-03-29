import { Resolvers } from '../resolvers-types';

const componentOrder: Partial<Resolvers> = {
  Query: {
    componentOrders: (_, __, { dataSources }) => {
      return dataSources.apolloDb.getComponentOrders();
    },
    componentOrder: (_, { componentKey }, { dataSources }) => {
      return dataSources.apolloDb.getComponentOrder(componentKey);
    },
  },
  Mutation: {
    createComponentOrder(_, { input }, { dataSources }) {
      const { componentKey } = input;
      return dataSources.apolloDb.createComponentOrder(componentKey);
    },

    setComponentOrder(_, { input }, { dataSources }) {
      const { componentKey, sortOrder } = input;
      return dataSources.apolloDb.setComponentOrder(componentKey, sortOrder);
    },
  },
};

export default componentOrder;
