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
  }
`;
