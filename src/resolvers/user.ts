import { Resolvers } from "../resolvers-types";

const user: Partial<Resolvers> = {
  Query: {
    user: (_, input, { dataSources }) => {
      const { key } = input;
      return dataSources.userDb.getUser(key);
    },
  },
  Mutation: {
    createUser: (_, { input }, { dataSources }) => {
      const { key, email, password, name } = input;
      return dataSources.userDb.createUser(key, email, password, name);
    },

    loginUser: (_, { input }, { dataSources }) => {
      const { email, password } = input;
      return dataSources.userDb.loginUser(email, password);
    },

    deleteUser: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.userDb.deleteUser(key);
    },
  },
};

export default user;
