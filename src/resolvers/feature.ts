import { Resolvers } from '../resolvers-types';

const feature: Partial<Resolvers> = {
  Query: {
    features: (_, __, { dataSources }) => {
      return dataSources.appDb.getFeatures();
    },
    feature: (_, { key }, { dataSources }) => {
      return dataSources.appDb.getFeature(key);
    },
    featureByName: (_, { name }, { dataSources }) => {
      return dataSources.appDb.getFeatureByName(name);
    },
  },
  Mutation: {
    setFeature: (_, { input }, { dataSources }) => {
      const { key, enabled } = input;
      return dataSources.appDb.setFeature(key, enabled);
    },
    setFeatureMetadata: (_, { input }, { dataSources }) => {
      const { key, metadata } = input;
      return dataSources.appDb.setFeatureMetadata(key, metadata);
    },

    createFeature: (_, { input }, { dataSources }) => {
      const { key, name, enabled, metadata } = input;
      return dataSources.appDb.createFeature(key, name, enabled, metadata);
    },
  },
};

export default feature;
