import { gql } from '@apollo/client';

export const GET_APP_DATA = gql`
  query getAppData {
    projects(input: { deleted: false }) {
      key
      sortOrder {
        sortOrder
      }
    }

    reminders {
      key
      text
      remindAt
    }
    features {
      key
      enabled
    }

    sidebarVisible @client
    focusbarVisible @client
    activeItem @client
    shortcutDialogVisible @client
  }
`;

export const CREATE_ITEM = gql`
  mutation CreateItem(
    $key: String!
    $type: String!
    $text: String!
    $parentKey: String
    $projectKey: String
  ) {
    createItem(
      input: {
        key: $key
        type: $type
        text: $text
        parentKey: $parentKey
        projectKey: $projectKey
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
