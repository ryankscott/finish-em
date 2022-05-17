import { gql } from '@apollo/client';

export const CREATE_ITEM = gql`
  mutation CreateItem(
    $key: String!
    $type: String!
    $text: String!
    $parentKey: String
    $projectKey: String
    $dueAt: DateTime
    $scheduledAt: DateTime
    $repeat: String
    $labelKey: String
  ) {
    createItem(
      input: {
        key: $key
        type: $type
        text: $text
        parentKey: $parentKey
        projectKey: $projectKey
        dueAt: $dueAt
        scheduledAt: $scheduledAt
        repeat: $repeat
        labelKey: $labelKey
      }
    ) {
      key
      type
      text
      project {
        key
      }
    }
  }
`;

export const ITEM_BY_KEY = gql`
  query itemByKey($key: String!) {
    item: item(key: $key) {
      key
      type
      text
      deleted
      completed
      dueAt
      scheduledAt
      lastUpdatedAt
      completedAt
      createdAt
      deletedAt
      repeat
      reminders {
        key
        deleted
        remindAt
      }
      label {
        key
        name
        colour
      }
      area {
        key
      }
      project {
        key
        name
        emoji
      }
      parent {
        key
        text
      }
      children {
        key
      }
    }
  }
`;

export const COMPLETE_ITEM = gql`
  mutation CompleteItem($key: String!) {
    completeItem(input: { key: $key }) {
      key
      completed
      completedAt
      scheduledAt
      repeat
      dueAt
    }
  }
`;

export const UNCOMPLETE_ITEM = gql`
  mutation UnCompleteItem($key: String!) {
    unCompleteItem(input: { key: $key }) {
      key
      completed
    }
  }
`;

export const DELETE_ITEM = gql`
  mutation DeleteItem($key: String!) {
    deleteItem(input: { key: $key }) {
      key
      deleted
    }
  }
`;

export const PERMANENT_DELETE_ITEM = gql`
  mutation PermanentDeleteItem($key: String!) {
    permanentDeleteItem(input: { key: $key })
  }
`;

export const RESTORE_ITEM = gql`
  mutation RestoreItem($key: String!) {
    restoreItem(input: { key: $key }) {
      key
      deleted
    }
  }
`;

export const CLONE_ITEM = gql`
  mutation CloneItem($key: String!) {
    cloneItem(input: { key: $key }) {
      key
    }
  }
`;

export const SET_PROJECT = gql`
  mutation SetProjectOfItem($key: String!, $projectKey: String!) {
    setProjectOfItem(input: { key: $key, projectKey: $projectKey }) {
      key
      project {
        key
      }
    }
  }
`;

export const SET_SCHEDULED_AT = gql`
  mutation SetScheduledAtOfItem($key: String!, $scheduledAt: DateTime) {
    setScheduledAtOfItem(input: { key: $key, scheduledAt: $scheduledAt }) {
      key
      scheduledAt
    }
  }
`;
export const SET_DUE_AT = gql`
  mutation SetDueAtOfItem($key: String!, $dueAt: DateTime) {
    setDueAtOfItem(input: { key: $key, dueAt: $dueAt }) {
      key
      dueAt
    }
  }
`;

export const RENAME_ITEM = gql`
  mutation RenameItem($key: String!, $text: String!) {
    renameItem(input: { key: $key, text: $text }) {
      key
      text
    }
  }
`;

export const SET_AREA = gql`
  mutation SetAreaOfItem($key: String!, $areaKey: String!) {
    setAreaOfItem(input: { key: $key, areaKey: $areaKey }) {
      key
      area {
        key
        name
      }
    }
  }
`;

export const SET_REPEAT = gql`
  mutation SetRepeatOfItem($key: String!, $repeat: String!) {
    setRepeatOfItem(input: { key: $key, repeat: $repeat }) {
      key
      repeat
      dueAt
    }
  }
`;
export const SET_PARENT = gql`
  mutation SetParentOfItem($key: String!, $parentKey: String!) {
    setParentOfItem(input: { key: $key, parentKey: $parentKey }) {
      key
      parent {
        key
      }
    }
  }
`;
export const SET_LABEL = gql`
  mutation SetLabelOfItem($key: String!, $labelKey: String!) {
    setLabelOfItem(input: { key: $key, labelKey: $labelKey }) {
      key
      label {
        key
      }
    }
  }
`;

export const GET_ITEMS = gql`
  query getItems {
    items {
      key
      text
      deleted
      completed
      project {
        key
        name
      }
      parent {
        key
        text
      }
    }
  }
`;

export const GET_WEEKLY_ITEMS = gql`
  query weeklyItems($filter: String!, $componentKey: String!) {
    items: itemsByFilter(filter: $filter, componentKey: $componentKey) {
      key
      text
      completed
      deleted
      dueAt
      scheduledAt
      lastUpdatedAt
      createdAt
      reminders {
        key
        remindAt
      }
      project {
        key
      }
      parent {
        key
      }
      children {
        key
        project {
          key
          name
        }
      }
    }
    weeklyGoals {
      key
      week
      goal
    }
    newEditor: featureByName(name: "newEditor") {
      key
      enabled
    }
  }
`;

export const SET_WEEKLY_GOAL = gql`
  mutation CreateWeeklyGoal($key: String!, $week: String!, $goal: String) {
    createWeeklyGoal(input: { key: $key, week: $week, goal: $goal }) {
      key
      week
      goal
    }
  }
`;
