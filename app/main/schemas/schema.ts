import { buildSchema } from "graphql";
import {
  getLabels,
  getLabel,
  createLabel,
  deleteLabel,
  renameLabel,
  recolourLabel
} from "../api/label";
import {
  createFeature,
  getFeature,
  getFeatures,
  setFeature
} from "../api/feature";

// TODO: Work out where / how to store ordering
export const schema = buildSchema(`
  type Label {
    key: String!,
    name: String,
    colour: String,
  }

  type Calendar {
    key: String!,
    name: String,
  }

  type Feature {
    key: String!,
    name: String!,
    enabled: Boolean,
  }

  type Reminder {
    key: String!,
    text: String,
    deleted: Boolean,
    remindAt: String,
    item: Item 
    lastUpdatedAt: String,
    deletedAt: String,
    createdAt: String,
  }

  type Event {
    key: String!,
    title: String,
    start: String,
    end: String,
    description: String,
    allDay: Boolean,
    calendar: Calendar,
  }

  type Area {
    key: String!,
    name: String,
    deleted: Boolean,
    description: String,
    lastUpdatedAt: String,
    deletedAt: String,
    createdAt: String,
  }

  type Project {
    key: String!,
    name: String,
    deleted:  Boolean,
    description: String,
    lastUpdatedAt: String,
    deletedAt: String,
    createdAt: String,
    startAt: String,
    endAt: String,
    area: Area,
  }

  type Item {
    key: String!,
    type: String, 
    text: String,
    deleted: Boolean,
    completed: Boolean
    parent: Item,
    project: Project, 
    dueDate: String,
    scheduledDate: String,
    lastUpdatedAt: String,
    completedAt: String,
    createdAt: String,
    deletedAt: String,
    repeat: String,
    label: Label, 
    area: Area,
  }


  input LabelInput {
    key: String!,
    name: String!,
    colour: String!
  }

  input RenameLabelInput {
   key: String!,
   name: String!
 }
  input RecolourLabelInput {
   key: String!,
   colour: String!
}

  input DeleteLabelInput {
   key: String!
  }

  input FeatureInput{
    key: String!,
    name: String!,
    enabled: Boolean!
  }
  input SetFeatureInput{
    key: String!,
    enabled: Boolean!
  }

type Query {
    labels: [Label],
    label(key: String!): Label,
    features: [Feature],
    feature(key: String!): Feature
  }

type Mutation {
    createLabel(input: LabelInput!) : Label,
    renameLabel(input: RenameLabelInput!) : Label,
    recolourLabel(input: RecolourLabelInput!) : Label,
    deleteLabel(input: DeleteLabelInput!): String,
    createFeature(input: FeatureInput!) : Feature,
    setFeature(input: SetFeatureInput!) : Feature,
}

`);

export const rootValue = {
  labels: (obj, ctx) => {
    return getLabels(obj, ctx);
  },
  label: (key, ctx) => {
    return getLabel(key, ctx);
  },
  createLabel: ({ input }, ctx) => {
    return createLabel(input, ctx);
  },
  renameLabel: ({ input }, ctx) => {
    return renameLabel(input, ctx);
  },
  recolourLabel: ({ input }, ctx) => {
    return recolourLabel(input, ctx);
  },
  deleteLabel: ({ input }, ctx) => {
    return deleteLabel(input, ctx);
  },
  feature: (key, ctx) => {
    return getFeature(key, ctx);
  },
  features: (obj, ctx) => {
    return getFeatures(obj, ctx);
  },
  createFeature: ({ input }, ctx) => {
    return createFeature(input, ctx);
  },
  setFeature: ({ input }, ctx) => {
    return setFeature(input, ctx);
  }
};
