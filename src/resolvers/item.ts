import { Resolvers } from "../resolvers-types";

const item: Partial<Resolvers> = {
  Item: {
    area: (parent, _, { dataSources }) => {
      // Default area is of key 0
      if (parent.areaKey === undefined || parent.areaKey === null) return null;
      return dataSources.appDb.getArea(parent?.areaKey);
    },
    label: (parent, _, { dataSources }) => {
      if (!parent.labelKey) return null;
      return dataSources.appDb.getLabel(parent?.labelKey);
    },
    project: (parent, _, { dataSources }) => {
      // Default project is of key 0
      if (parent.projectKey === undefined || parent.projectKey === null) {
        return null;
      }
      return dataSources.appDb.getProject(parent?.projectKey);
    },
    parent: (parent, _, { dataSources }) => {
      if (!parent.parentKey) return null;
      return dataSources.appDb.getItem(parent?.parentKey);
    },
    children: (parent, _, { dataSources }) => {
      return dataSources.appDb.getItemsByParent(parent.key);
    },
    reminders: (parent, _, { dataSources }) => {
      return dataSources.appDb.getRemindersByItem(parent.key);
    },
    sortOrders: (parent, _, { dataSources }) => {
      return dataSources.appDb.getItemOrdersByItem(parent.key);
    },
  },

  Query: {
    items: (_, __, { dataSources }) => {
      return dataSources.appDb.getItems();
    },
    item: (_, { key }, { dataSources }) => {
      return dataSources.appDb.getItem(key);
    },
    itemsByProject: (_, { projectKey }, { dataSources }) => {
      return dataSources.appDb.getItemsByProject(projectKey);
    },
    itemsByArea: (_, { areaKey }, { dataSources }) => {
      return dataSources.appDb.getItemsByArea(areaKey);
    },
    itemsByParent: (_, { parentKey }, { dataSources }) => {
      return dataSources.appDb.getItemsByParent(parentKey);
    },
    itemsByFilter: (_, { filter, componentKey }, { dataSources }) => {
      return dataSources.appDb.getItemsByFilter(filter, componentKey);
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
      return dataSources.appDb.createItem(
        key,
        projectKey ?? "0",
        repeat ?? "",
        text,
        type,
        labelKey,
        parentKey,
        dueAt,
        scheduledAt
      );
    },

    deleteItem: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.appDb.deleteItem(key);
    },

    restoreItem: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.appDb.restoreItem(key);
    },

    renameItem: (_, { input }, { dataSources }) => {
      const { key, text } = input;
      return dataSources.appDb.renameItem(key, text);
    },

    completeItem: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.appDb.completeItem(key);
    },

    unCompleteItem: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.appDb.unCompleteItem(key);
    },

    setRepeatOfItem: (_, { input }, { dataSources }) => {
      const { key, repeat } = input;
      return dataSources.appDb.setRepeatOfItem(key, repeat);
    },

    cloneItem: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.appDb.cloneItem(key);
    },

    permanentDeleteItem: (_, { input }, { dataSources }) => {
      const { key } = input;
      return dataSources.appDb.permanentDeleteItem(key);
    },

    setProjectOfItem: (_, { input }, { dataSources }) => {
      const { key, projectKey } = input;
      return dataSources.appDb.setProjectOfItem(key, projectKey);
    },

    setAreaOfItem: (_, { input }, { dataSources }) => {
      const { key, areaKey } = input;
      return dataSources.appDb.setAreaOfItem(key, areaKey);
    },

    setParentOfItem: (_, { input }, { dataSources }) => {
      const { key, parentKey } = input;
      return dataSources.appDb.setParentOfItem(key, parentKey);
    },

    setLabelOfItem: (_, { input }, { dataSources }) => {
      const { key, labelKey } = input;
      return dataSources.appDb.setLabelOfItem(key, labelKey);
    },

    setScheduledAtOfItem: (_, { input }, { dataSources }) => {
      const { key, scheduledAt } = input;
      console.log(typeof scheduledAt);
      console.log(scheduledAt);
      return dataSources.appDb.setScheduledAtOfItem(key, scheduledAt ?? null);
    },

    setSnoozeOfItem: (_, { input }, { dataSources }) => {
      const { key, snoozedUntil } = input;
      // @ts-ignore
      return dataSources.appDb.snoozeItem(key, snoozedUntil ?? new Date());
    },

    setDueAtOfItem: (_, { input }, { dataSources }) => {
      const { key, dueAt } = input;
      return dataSources.appDb.setDueAtOfItem(key, dueAt ?? null);
    },
  },
};

export default item;
