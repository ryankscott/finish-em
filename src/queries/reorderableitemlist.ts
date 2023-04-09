import { gql } from '@apollo/client';

export const ITEMS_BY_FILTER = gql`
  query itemsByFilter($filter: String!, $componentKey: String!) {
    items: itemsByFilter(filter: $filter, componentKey: $componentKey) {
      key
      completed
      dueAt
      scheduledAt
      createdAt
      snoozedUntil
      repeat
      label {
        key
      }
      lastUpdatedAt
      project {
        name
        key
      }
      parent {
        key
      }
      children {
        key
        deleted
        completed
      }
      completed
      sortOrders {
        componentKey
        sortOrder
      }
    }
    subtasksVisible @client
  }
`;

export const SET_ITEM_ORDER = gql`
  mutation SetItemOrder(
    $itemKey: String!
    $componentKey: String!
    $sortOrder: Int!
  ) {
    setItemOrder(
      input: {
        itemKey: $itemKey
        componentKey: $componentKey
        sortOrder: $sortOrder
      }
    ) {
      item {
        key
      }
    }
  }
`;
export const DELETE_ITEM_ORDERS_BY_COMPONENT = gql`
  mutation DeleteItemOrdersByComponent($componentKey: String!) {
    deleteItemOrdersByComponent(input: { componentKey: $componentKey })
  }
`;
export const BULK_CREATE_ITEM_ORDERS = gql`
  mutation BulkCreateItemOrders($itemKeys: [String]!, $componentKey: String!) {
    bulkCreateItemOrders(
      input: { itemKeys: $itemKeys, componentKey: $componentKey }
    ) {
      item {
        key
      }
      componentKey
      sortOrder
    }
  }
`;
