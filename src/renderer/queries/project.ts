import { gql } from '@apollo/client';

export const GET_PROJECT_BY_KEY = gql`
  query ProjectByKey($key: String!) {
    project(key: $key) {
      key
      name
      deleted
      description
      lastUpdatedAt
      deletedAt
      createdAt
      startAt
      endAt
      emoji
      items {
        key
        type
        text
        deleted
        completed
        dueAt
        scheduledAt
        repeat
      }
    }
    projects(input: { deleted: false }) {
      key
      name
    }
    projectDates: featureByName(name: "projectDates") {
      key
      enabled
    }
    newEditor: featureByName(name: "newEditor") {
      key
      enabled
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($key: String!) {
    deleteProject(input: { key: $key }) {
      key
    }
  }
`;
export const CHANGE_DESCRIPTION_OF_PROJECT = gql`
  mutation ChangeDescriptionProject($key: String!, $description: String!) {
    changeDescriptionProject(input: { key: $key, description: $description }) {
      key
      description
    }
  }
`;
export const RENAME_PROJECT = gql`
  mutation RenameProject($key: String!, $name: String!) {
    renameProject(input: { key: $key, name: $name }) {
      key
      name
    }
  }
`;

export const SET_END_DATE_OF_PROJECT = gql`
  mutation SetEndDateOfProject($key: String!, $endAt: String!) {
    setEndDateOfProject(input: { key: $key, endAt: $endAt }) {
      key
      endAt
    }
  }
`;
export const SET_START_DATE_OF_PROJECT = gql`
  mutation SetStartDateOfProject($key: String!, $startAt: String!) {
    setStartDateOfProject(input: { key: $key, startAt: $startAt }) {
      key
      startAt
    }
  }
`;
export const SET_EMOJI_OF_PROJECT = gql`
  mutation SetEmojiOfProject($key: String!, $emoji: String!) {
    setEmojiOfProject(input: { key: $key, emoji: $emoji }) {
      key
      emoji
    }
  }
`;
