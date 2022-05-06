import { Resolvers } from 'main/resolvers-types';

const feature: Partial<Resolvers> = {
  Query: {
    features: (_, __, { dataSources }) => {
      return dataSources.apolloDb.getFeatures();
    },
    feature: (_, { key }, { dataSources }) => {
      return dataSources.apolloDb.getFeature(key);
    },
    featureByName: (_, { name }, { dataSources }) => {
      return dataSources.apolloDb.getFeatureByName(name);
    },
  },
  Mutation: {
    setFeature: (_, { input }, { dataSources }) => {
      const { key, enabled } = input;
      return dataSources.apolloDb.setFeature(key, enabled);
    },
    setFeatureMetadata: (_, { input }, { dataSources }) => {
      const { key, metadata } = input;
      return dataSources.apolloDb.setFeatureMetadata(key, metadata);
    },

    createFeature: (_, { input }, { dataSources }) => {
      const { key, name, enabled, metadata } = input;
      return dataSources.apolloDb.createFeature(key, name, enabled, metadata);
    },
  },
};

export default feature;
