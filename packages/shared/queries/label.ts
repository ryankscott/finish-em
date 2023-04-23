import { gql } from '@apollo/client';

export const GET_LABELS = gql`
  query {
    labels {
      key
      name
      colour
    }
  }
`;
