import { gql } from '@apollo/client';

export const DELETE_VIEW = gql`
  mutation DeleteView($key: String!) {
    deleteView(input: { key: $key }) {
      key
    }
  }
`;
