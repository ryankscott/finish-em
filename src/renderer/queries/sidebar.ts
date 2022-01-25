import { gql } from '@apollo/client';
import { View, Area, Project } from 'main/generated/typescript-helpers';

export type SidebarData = {
  areas: Area[];
  views: View[];
  projects: Project[];
};
export const GET_SIDEBAR = gql`
  query GetSidebarData {
    areas {
      name
      key
      deleted
      emoji
      sortOrder {
        areaKey
        sortOrder
      }
    }
    views {
      key
      name
      icon
      type
      sortOrder {
        viewKey
        sortOrder
      }
    }
    projects(input: { deleted: false }) {
      key
      name
      emoji
      area {
        key
      }
      sortOrder {
        projectKey
        sortOrder
      }
    }
  }
`;

export const SET_PROJECT_ORDER = gql`
  mutation SetProjectOrder($projectKey: String!, $sortOrder: Int!) {
    setProjectOrder(input: { projectKey: $projectKey, sortOrder: $sortOrder }) {
      projectKey
      sortOrder
    }
  }
`;
export const SET_AREA_OF_PROJECT = gql`
  mutation SetAreaOfProject($key: String!, $areaKey: String!) {
    setAreaOfProject(input: { key: $key, areaKey: $areaKey }) {
      key
      area {
        key
      }
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
export const CREATE_PROJECT = gql`
  mutation CreateProject(
    $key: String!
    $name: String!
    $description: String!
    $startAt: DateTime
    $endAt: DateTime
    $areaKey: String!
  ) {
    createProject(
      input: {
        key: $key
        name: $name
        description: $description
        startAt: $startAt
        endAt: $endAt
        areaKey: $areaKey
      }
    ) {
      key
      name
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
