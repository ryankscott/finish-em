import { gql } from '@apollo/client';
import { Calendar, Feature, Label } from 'main/generated/typescript-helpers';

export type FeaturesAndLabels = {
  features: Feature[];
  labels: Label[];
  calendars: Calendar[];
  activeCalendar: Calendar;
};
export const GET_FEATURES_AND_LABELS = gql`
  query settings {
    features {
      key
      name
      enabled
      metadata
    }
    labels {
      key
      name
      colour
    }
    calendars {
      key
      name
    }
    activeCalendar: getActiveCalendar {
      key
      name
    }
  }
`;

export const SET_ACTIVE_CALENDAR = gql`
  mutation SetActiveCalendar($key: String!) {
    setActiveCalendar(input: { key: $key }) {
      key
      name
      active
    }
  }
`;

export const SET_FEATURE = gql`
  mutation SetFeature($key: String!, $enabled: Boolean!) {
    setFeature(input: { key: $key, enabled: $enabled }) {
      key
      enabled
    }
  }
`;
export const SET_FEATURE_METADATA = gql`
  mutation SetFeatureMetadata($key: String!, $metadata: JSON!) {
    setFeatureMetadata(input: { key: $key, metadata: $metadata }) {
      key
      metadata
    }
  }
`;

export const RENAME_LABEL = gql`
  mutation RenameLabel($key: String!, $name: String!) {
    renameLabel(input: { key: $key, name: $name }) {
      key
      name
    }
  }
`;

export const RECOLOUR_LABEL = gql`
  mutation SetColourOfLabel($key: String!, $colour: String!) {
    setColourOfLabel(input: { key: $key, colour: $colour }) {
      key
      colour
    }
  }
`;

export const DELETE_LABEL = gql`
  mutation DeleteLabel($key: String!) {
    deleteLabel(input: { key: $key })
  }
`;

export const CREATE_LABEL = gql`
  mutation CreateLabel($key: String!, $name: String!, $colour: String!) {
    createLabel(input: { key: $key, name: $name, colour: $colour }) {
      key
      name
    }
  }
`;
