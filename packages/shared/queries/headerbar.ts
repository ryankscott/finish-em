import { gql } from '@apollo/client';

export const GET_HEADER_BAR_DATA = gql`
  query GetHeaderBarData {
    projects(input: { deleted: false }) {
      key
      name
    }
    areas {
      key
      name
    }
    items {
      key
      text
      deleted
      lastUpdatedAt
    }
  }
`;
