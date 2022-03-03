import { gql } from '@apollo/client';

export const GET_AREA_BY_KEY = gql`
  query AreaByKey($key: String!) {
    area(key: $key) {
      key
      name
      deleted
      description
      lastUpdatedAt
      deletedAt
      createdAt
      emoji
      projects {
        key
        name
        description
        items {
          type
          key
          text
        }
      }
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
    areas {
      key
      name
      emoji
    }
    newEditor: featureByName(name: "newEditor") {
      key
      enabled
    }
  }
`;

export const DELETE_AREA = gql`
  mutation DeleteArea($key: String!) {
    deleteArea(input: { key: $key }) {
      key
    }
  }
`;

export const CHANGE_DESCRIPTION_AREA = gql`
  mutation ChangeDescriptionArea($key: String!, $description: String!) {
    changeDescriptionArea(input: { key: $key, description: $description }) {
      key
      description
    }
  }
`;

export const RENAME_AREA = gql`
  mutation RenameArea($key: String!, $name: String!) {
    renameArea(input: { key: $key, name: $name }) {
      key
      name
    }
  }
`;
export const SET_EMOJI = gql`
  mutation SetEmojiOfArea($key: String!, $emoji: String!) {
    setEmojiOfArea(input: { key: $key, emoji: $emoji }) {
      key
      emoji
    }
  }
`;

export const SET_AREA_ORDER = gql`
  mutation SetAreaOrder($areaKey: String!, $sortOrder: Int!) {
    setAreaOrder(input: { areaKey: $areaKey, sortOrder: $sortOrder }) {
      areaKey
      sortOrder
    }
  }
`;
export const CREATE_AREA = gql`
  mutation CreateArea($key: String!, $name: String!, $description: String) {
    createArea(input: { key: $key, name: $name, description: $description }) {
      key
      name
    }
  }
`;

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
