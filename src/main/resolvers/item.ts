import { Resolvers } from 'main/resolvers-types';

const item: Partial<Resolvers> = {
  Query: {
    items: (_, __, { dataSources }) => {
      return dataSources.apolloDb.getItems();
    },
    item: (_, { key }, { dataSources }) => {
      return dataSources.apolloDb.getItem(key);
    },
    itemsByProject: (_, { projectKey }, { dataSources }) => {
      return dataSources.apolloDb.getItemsByProject(projectKey);
    },
    itemsByArea: (_, { areaKey }, { dataSources }) => {
      return dataSources.apolloDb.getItemsByArea(areaKey);
    },
    itemsByParent: (_, { parentKey }, { dataSources }) => {
      return dataSources.apolloDb.getItemsByParent(parentKey);
    },
    itemsByFilter: (_, { filter }, { dataSources }) => {
      return dataSources.apolloDb.getItemsByFilter(filter);
    },
  },
  Mutation: {
    createItem: (_, { input }, { dataSources }) => {
      const {
        key,
        description,
        dueAt,
        labelKey,
        parentKey,
        projectKey,
        repeat,
        scheduledAt,
        text,
        type,
      } = input;
      return dataSources.apolloDb.createItem(
        key,
        description,
        dueAt,
        labelKey,
        parentKey,
        projectKey,
        repeat,
        scheduledAt,
        text,
        type
      );
    },

    // TODO: Implement me
    deleteItem: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.deleteItem(key);
    },

    // TODO: Implement me
    restoreItem: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.restoreItem(key);
    },

    // TODO: Implement me
    renameItem: (_, { input }, { dataSources }) => {
      const { key, text } = input;
      return dataSources.apolloDb.renameItem(key, text);
    },

    // TODO: Implement me
    completeItem: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.completeItem(key);
    },

    // TODO: Implement me
    unCompleteItem: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.unCompleteItem(key);
    },

    // TODO: Implement me
    setRepeatOfItem: (_, { input }, { dataSources }) => {
      const { key, repeat } = input;
      return dataSources.apolloDb.setRepeatOfItem(key, repeat);
    },

    // TODO: Implement me
    cloneItem: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.cloneItem(key);
    },

    // TODO: Implement me
    permanentDeleteItem: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.permanentDeleteItem(key);
    },

    // TODO: Implement me
    setProjectOfItem: (_, { input }, { dataSources }) => {
      const { key, projectKey } = input;
      return dataSources.apolloDb.setProjectOfItem(key, projectKey);
    },

    // TODO: Implement me
    setAreaOfItem: (_, { input }, { dataSources }) => {
      const { key, areaKey } = input;
      return dataSources.apolloDb.setAreaOfItem(key, areaKey);
    },

    // TODO: Implement me
    setParentOfItem: (_, { input }, { dataSources }) => {
      const { key, parentKey } = input;
      return dataSources.apolloDb.setParentOfItem(key, parentKey);
    },

    // TODO: Implement me
    setLabelOfItem: (_, { input }, { dataSources }) => {
      const { key, labelKey } = input;
      return dataSources.apolloDb.setLabelOfItem(key, labelKey);
    },

    // TODO: Implement me
    setScheduledAtOfItem: (_, { input }, { dataSources }) => {
      const { key, scheduledAt } = input;
      return dataSources.apolloDb.setScheduledAtOfItem(key, scheduledAt);
    },

    // TODO: Implement me
    setDueAtOfItem: (_, { input }, { dataSources }) => {
      const { key, dueAt } = input;
      return dataSources.apolloDb.setDueAtOfItem(key, dueAt);
    },
  },
};

export default item;
