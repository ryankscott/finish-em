import { buildSchema } from 'graphql'
import {
  getLabels,
  getLabel,
  createLabel,
  deleteLabel,
  renameLabel,
  recolourLabel,
  createFeature,
  getFeature,
  getFeatures,
  setFeature,
  getProject,
  getProjects,
  createProject,
  deleteProject,
  renameProject,
  changeDescriptionProject,
  setStartDateOfProject,
  setEndDateOfProject,
  getProjectsByArea,
} from '../api/'

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

input ProjectInput {
    key: String!
    name: String!
    deleted: Boolean!
    description: String
    lastUpdatedAt: String
    deletedAt: String
    createdAt: String
    startAt: String
    endAt: String
    areaKey: String
}

input DeleteProjectInput {
  key: String!
}

input RenameProjectInput {
  key: String!
  name: String!
}

input ChangeDescriptionProjectInput {
  key: String!
  description: String!
}

input SetEndDateOfProjectInput {
  key: String!
  endAt: String!
}

input SetStartDateOfProjectInput {
  key: String!
  startAt: String!
}

input AreaInput {
    key: String!
    name: String!
    deleted: Boolean!
    description: String
    lastUpdatedAt: String
    deletedAt: String
    createdAt: String
}

input DeleteAreaInput {
  key: String!
}

input RenameAreaInput {
  key: String!
  name: String!
}

input ChangeDescriptionAreaInput {
  key: String!
  description: String!
}

type Query {
    labels: [Label],
    label(key: String!): Label,
    features: [Feature],
    feature(key: String!): Feature
    projects: [Project],
    project(key: String!): Project
    projectsByArea(areaKey: String!): Project
    areas: [Area],
    area(key: String!): Area
  }

type Mutation {
    createLabel(input: LabelInput!) : Label,
    renameLabel(input: RenameLabelInput!) : Label,
    recolourLabel(input: RecolourLabelInput!) : Label,
    deleteLabel(input: DeleteLabelInput!): String,

    createFeature(input: FeatureInput!) : Feature,
    setFeature(input: SetFeatureInput!) : Feature,

    createProject(input: ProjectInput!): Project,
    deleteProject(input: DeleteProjectInput!): String,
    renameProject(input: RenameProjectInput!): Project,
    changeDescriptionProject(input: ChangeDescriptionProjectInput!): Project,
    setEndDateOfProject(input: SetEndDateOfProjectInput!): Project,
    setStartDateOfProject(input: SetStartDateOfProjectInput!): Project,

    createArea(input: AreaInput!): Area,
    deleteArea(input: DeleteAreaInput!): String,
    renameArea(input: RenameAreaInput!): Area,
    changeDescriptionArea(input: ChangeDescriptionAreaInput!): Area,
}

`)

export const rootValue = {
  labels: (obj, ctx) => {
    return getLabels(obj, ctx)
  },
  label: (key, ctx) => {
    return getLabel(key, ctx)
  },
  createLabel: ({ input }, ctx) => {
    return createLabel(input, ctx)
  },
  renameLabel: ({ input }, ctx) => {
    return renameLabel(input, ctx)
  },
  recolourLabel: ({ input }, ctx) => {
    return recolourLabel(input, ctx)
  },
  deleteLabel: ({ input }, ctx) => {
    return deleteLabel(input, ctx)
  },
  feature: (key, ctx) => {
    return getFeature(key, ctx)
  },
  features: (obj, ctx) => {
    return getFeatures(obj, ctx)
  },
  createFeature: ({ input }, ctx) => {
    return createFeature(input, ctx)
  },
  setFeature: ({ input }, ctx) => {
    return setFeature(input, ctx)
  },
  projects: (obj, ctx) => {
    return getProjects(obj, ctx)
  },
  projectsByArea: (key, ctx) => {
    return getProjectsByArea(key, ctx)
  },
  project: (key, ctx) => {
    return getProject(key, ctx)
  },
  createProject: ({ input }, ctx) => {
    return createProject(input, ctx)
  },
  deleteProject: ({ input }, ctx) => {
    return deleteProject(input, ctx)
  },
  renameProject: ({ input }, ctx) => {
    return renameProject(input, ctx)
  },
  changeDescriptionProject: ({ input }, ctx) => {
    return changeDescriptionProject(input, ctx)
  },
  setStartDateOfProject: ({ input }, ctx) => {
    return setStartDateOfProject(input, ctx)
  },
  setEndDateOfProject: ({ input }, ctx) => {
    return setEndDateOfProject(input, ctx)
  },
}
