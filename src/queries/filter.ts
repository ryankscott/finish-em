import { gql } from '@apollo/client';

export const GET_FILTER_DATA = gql`
  query {
    projects(input: { deleted: false }) {
      key
      name
    }
    areas {
      key
      name
    }
    labels {
      key
      name
    }
  }
`;
