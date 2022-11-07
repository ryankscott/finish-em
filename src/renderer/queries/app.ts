import { gql } from '@apollo/client';

export const GET_APP_DATA = gql`
  query GetAppData {
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
  }
`;
