import { InMemoryCache } from '@apollo/client';

export const queryCache = new InMemoryCache({
  typePolicies: {
    Label: {
      keyFields: ['key'],
    },
    Feature: {
      keyFields: ['key'],
    },
    Project: {
      keyFields: ['key'],
    },
    Item: {
      keyFields: ['key'],
    },
    Area: {
      keyFields: ['key'],
    },
    View: {
      keyFields: ['key'],
    },
    Component: {
      keyFields: ['key'],
    },
    Query: {},
  },
});
