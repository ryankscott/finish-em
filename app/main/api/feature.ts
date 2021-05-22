import Feature from '../classes/feature'

export const getFeatures = (obj, ctx) => {
  return ctx.db
    .all('SELECT key, name, enabled, metadata FROM feature')
    .then((result) => result.map((r) => new Feature(r.key, r.name, r.enabled, r.metadata)))
}

export const getFeature = (input: { key: string }, ctx) => {
  return ctx.db
    .get(`SELECT key, name, enabled, metadata FROM feature WHERE key = '${input.key}'`)
    .then((result) => {
      return result ? new Feature(result.key, result.name, result.enabled, result.metadata) : null
    })
}
export const getFeatureByName = (input: { name: string }, ctx) => {
  return ctx.db
    .get(`SELECT key, name, enabled, metadata FROM feature WHERE name = '${input.name}'`)
    .then((result) => {
      return result ? new Feature(result.key, result.name, result.enabled, result.metadata) : null
    })
}

export const setFeature = (input: { key: string; enabled: boolean }, ctx) => {
  return ctx.db
    .run(`UPDATE feature SET enabled = ${input.enabled} WHERE key = '${input.key}'`)
    .then((result) => {
      return result.changes
        ? getFeature({ key: input.key }, ctx)
        : new Error('Unable to set feature')
    })
}

export const setFeatureMetadata = (input: { key: string; metadata: Object }, ctx) => {
  return ctx.db
    .run(
      `UPDATE feature SET metadata = '${JSON.stringify(input.metadata)}' WHERE key = '${
        input.key
      }'`,
    )
    .then((result) => {
      return result.changes
        ? getFeature({ key: input.key }, ctx)
        : new Error('Unable to set feature metadata')
    })
}

export const createFeature = (
  input: { key: string; name: string; enabled: boolean; metadata: object },
  ctx,
) => {
  return ctx.db
    .run(
      `INSERT INTO feature (key, name, enabled, metadata) VALUES (${input.key}, ${input.name}, ${
        input.enabled
      }, ${JSON.stringify(input.metadata)})`,
    )
    .then((result) => {
      return result.changes
        ? getFeature({ key: input.key }, ctx)
        : new Error('Unable to create feature')
    })
}

export const featureRootValues = {
  feature: (key, ctx) => {
    return getFeature(key, ctx)
  },
  featureByName: (name, ctx) => {
    return getFeatureByName(name, ctx)
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
  setFeatureMetadata: ({ input }, ctx) => {
    return setFeatureMetadata(input, ctx)
  },
}
