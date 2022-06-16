import { gql } from '@apollo/client';

export const DELETE_VIEW = gql`
  mutation DeleteView($key: String!) {
    deleteView(input: { key: $key }) {
      key
    }
  }
`;

export const GET_VIEW_BY_KEY = gql`
  query ViewByKey($key: String!) {
    view(key: $key) {
      key
      name
      type
      icon
    }
  }
`;
