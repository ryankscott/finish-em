import { Resolvers } from 'main/resolvers-types';

const weeklyGoal: Partial<Resolvers> = {
  Query: {
    weeklyGoals: (_, __, { dataSources }) => {
      return dataSources.apolloDb.getWeeklyGoals();
    },
    weeklyGoal: (_, { key }, { dataSources }) => {
      return dataSources.apolloDb.getWeeklyGoal(key);
    },
    weeklyGoalByName: (_, { name }, { dataSources }) => {
      return dataSources.apolloDb.getWeeklyGoalByName(name);
    },
  },
  Mutation: {
    createWeeklyGoal: (_, { input }, { dataSources }) => {
      const { key, week, goal } = input;
      return dataSources.apolloDb.createWeeklyGoal(key, week, goal);
    },
  },
};

export default weeklyGoal;
