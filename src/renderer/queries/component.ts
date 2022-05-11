import { gql } from '@apollo/client';

export const GET_COMPONENT_BY_KEY = gql`
  query getComponentByKey($key: String!) {
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
    component(key: $key) {
      key
      parameters
    }
  }
`;

export const UPDATE_COMPONENT = gql`
  mutation SetParametersOfComponent($key: String!, $parameters: JSON!) {
    setParametersOfComponent(input: { key: $key, parameters: $parameters }) {
      key
      parameters
    }
  }
`;

export const DELETE_COMPONENT = gql`
  mutation DeleteComponent($key: String!) {
    deleteComponent(input: { key: $key })
  }
`;
export const CLONE_COMPONENT = gql`
  mutation CloneComponent($key: String!) {
    cloneComponent(input: { key: $key }) {
      key
    }
  }
`;

export const ADD_COMPONENT = gql`
  mutation CreateComponent($input: CreateComponentInput!) {
    createComponent(input: $input) {
      key
    }
  }
`;

export const SET_COMPONENT_ORDER = gql`
  mutation SetComponentOrder($componentKey: String!, $sortOrder: Int!) {
    setComponentOrder(
      input: { componentKey: $componentKey, sortOrder: $sortOrder }
    ) {
      componentKey
    }
  }
`;

export const GET_COMPONENTS_BY_VIEW = gql`
  query ComponentsByView($viewKey: String!) {
    view(key: $viewKey) {
      key
      name
      type
    }
    componentsByView(viewKey: $viewKey) {
      key
      type
      location
      parameters
      sortOrder {
        sortOrder
      }
    }
  }
`;
