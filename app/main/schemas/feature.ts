export const feature = `
type Feature {
  key: String!
  name: String!
  enabled: Boolean
}

input CreateFeatureInput {
  key: String!
  name: String!
  enabled: Boolean!
}

input SetFeatureInput {
  key: String!
  enabled: Boolean!
}

type Query {
  features: [Feature]
  feature(key: String!): Feature
  featureByName(name: String!): Feature
}

type Mutation {
  createFeature(input: CreateFeatureInput!): Feature
  setFeature(input: SetFeatureInput!): Feature
}
`