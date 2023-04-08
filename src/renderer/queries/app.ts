import { gql } from '@apollo/client';

export const GET_APP_DATA = gql`
  query GetAppData {
    reminders {
      key
      text
      remindAt
    }
  }
`;
