import { Resolvers } from '../resolvers-types';

const componentOrder: Partial<Resolvers> = {
  Query: {
    componentOrders: (_, __, { dataSources }) => {
      return dataSources.appDb.getComponentOrders();
    },
    componentOrder: (_, { componentKey }, { dataSources }) => {
      return dataSources.appDb.getComponentOrder(componentKey);
    },
  },
  Mutation: {
    createComponentOrder(_, { input }, { dataSources }) {
      const { componentKey } = input;
      return dataSources.appDb.createComponentOrder(componentKey);
    },

    setComponentOrder(_, { input }, { dataSources }) {
      const { componentKey, sortOrder } = input;
      return dataSources.appDb.setComponentOrder(componentKey, sortOrder);
    },
  },
};

export default componentOrder;
