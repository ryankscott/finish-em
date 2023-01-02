import { Resolvers } from '../resolvers-types';

const weeklyGoal: Partial<Resolvers> = {
  Query: {
    weeklyGoals: (_, __, { dataSources }) => {
      return dataSources.appDb.getWeeklyGoals();
    },
    weeklyGoal: (_, { key }, { dataSources }) => {
      return dataSources.appDb.getWeeklyGoal(key);
    },
    weeklyGoalByName: (_, { name }, { dataSources }) => {
      return dataSources.appDb.getWeeklyGoalByName(name);
    },
  },
  Mutation: {
    createWeeklyGoal: (_, { input }, { dataSources }) => {
      const { key, week, goal } = input;
      return dataSources.appDb.createWeeklyGoal(key, week, goal);
    },
  },
};

export default weeklyGoal;
