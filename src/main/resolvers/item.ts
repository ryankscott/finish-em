import { Resolvers } from '../resolvers-types';

const item: Partial<Resolvers> = {
  Item: {
    area: (parent, _, { dataSources }) => {
      // Default area is of key 0
      if (parent.areaKey === undefined || parent.areaKey === null) return null;
      return dataSources.apolloDb.getArea(parent?.areaKey);
    },
    label: (parent, _, { dataSources }) => {
      if (!parent.labelKey) return null;
      return dataSources.apolloDb.getLabel(parent?.labelKey);
    },
    project: (parent, _, { dataSources }) => {
      // Default project is of key 0
      if (parent.projectKey === undefined || parent.projectKey === null) {
        return null;
      }
      return dataSources.apolloDb.getProject(parent?.projectKey);
    },
    parent: (parent, _, { dataSources }) => {
      if (!parent.parentKey) return null;
      return dataSources.apolloDb.getItem(parent?.parentKey);
    },
    children: (parent, _, { dataSources }) => {
      return dataSources.apolloDb.getItemsByParent(parent.key);
    },
    reminders: (parent, _, { dataSources }) => {
      return dataSources.apolloDb.getRemindersByItem(parent.key);
    },
    sortOrders: (parent, _, { dataSources }) => {
      return dataSources.apolloDb.getItemOrdersByItem(parent.key);
    },
  },

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
    itemsByFilter: (_, { filter, componentKey }, { dataSources }) => {
      return dataSources.apolloDb.getItemsByFilter(filter, componentKey);
    },
  },
  Mutation: {
    createItem: (_, { input }, { dataSources }) => {
      const {
        key,
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
        labelKey ?? '',
        parentKey ?? '',
        projectKey ?? '',
        repeat ?? '',
        text,
        type,
        dueAt || undefined,
        scheduledAt || undefined
      );
    },

    deleteItem: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.deleteItem(key);
    },

    restoreItem: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.restoreItem(key);
    },

    renameItem: (_, { input }, { dataSources }) => {
      const { key, text } = input;
      return dataSources.apolloDb.renameItem(key, text);
    },

    completeItem: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.completeItem(key);
    },

    unCompleteItem: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.unCompleteItem(key);
    },

    setRepeatOfItem: (_, { input }, { dataSources }) => {
      const { key, repeat } = input;
      return dataSources.apolloDb.setRepeatOfItem(key, repeat);
    },

    cloneItem: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.cloneItem(key);
    },

    permanentDeleteItem: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.apolloDb.permanentDeleteItem(key);
    },

    setProjectOfItem: (_, { input }, { dataSources }) => {
      const { key, projectKey } = input;
      return dataSources.apolloDb.setProjectOfItem(key, projectKey);
    },

    setAreaOfItem: (_, { input }, { dataSources }) => {
      const { key, areaKey } = input;
      return dataSources.apolloDb.setAreaOfItem(key, areaKey);
    },

    setParentOfItem: (_, { input }, { dataSources }) => {
      const { key, parentKey } = input;
      return dataSources.apolloDb.setParentOfItem(key, parentKey);
    },

    setLabelOfItem: (_, { input }, { dataSources }) => {
      const { key, labelKey } = input;
      return dataSources.apolloDb.setLabelOfItem(key, labelKey);
    },

    setScheduledAtOfItem: (_, { input }, { dataSources }) => {
      const { key, scheduledAt } = input;
      return dataSources.apolloDb.setScheduledAtOfItem(
        key,
        scheduledAt ?? null
      );
    },

    setSnoozeOfItem: (_, { input }, { dataSources }) => {
      const { key, snoozedUntil } = input;
      return dataSources.apolloDb.snoozeItem(key, snoozedUntil ?? new Date());
    },

    setDueAtOfItem: (_, { input }, { dataSources }) => {
      const { key, dueAt } = input;
      return dataSources.apolloDb.setDueAtOfItem(key, dueAt ?? null);
    },
  },
};

export default item;
