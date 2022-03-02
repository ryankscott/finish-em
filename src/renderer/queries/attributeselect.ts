import { gql } from '@apollo/client';

export const GET_AREAS = gql`
  query {
    areas {
      key
      emoji
      name
      deleted
    }
  }
`;

export const GET_LABELS = gql`
  query {
    labels {
      key
      name
      colour
    }
  }
`;

export const GET_PROJECTS = gql`
  query {
    projects(input: { deleted: false }) {
      key
      emoji
      name
      area {
        key
        name
      }
    }
  }
`;

export const GET_ITEMS = gql`
  query {
    items {
      key
      text
      deleted
      completed
      project {
        key
        name
      }
      parent {
        key
        text
      }
    }
  }
`;
