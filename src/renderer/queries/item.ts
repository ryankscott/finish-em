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

export const GET_ITEM_BY_KEY = gql`
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
    activeItem @client
    subtasksVisible @client
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
