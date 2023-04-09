import { gql } from '@apollo/client';

export const CREATE_USER = gql`
  mutation CreateUser(
    $key: String!
    $email: String!
    $password: String!
    $name: String!
  ) {
    createUser(
      input: { key: $key, email: $email, password: $password, name: $name }
    ) {
      key
    }
  }
`;

export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(input: { email: $email, password: $password }) {
      key
      email
      token
    }
  }
`;
