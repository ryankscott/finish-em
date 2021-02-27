import log from 'electron-log'
import SQL from 'sql-template-strings'
import { v4 as uuidv4 } from 'uuid'
import Component from '../classes/component'
import { createComponentOrder } from './componentOrder'

export const getComponents = (obj, ctx) => {
  return ctx.db
    .all('SELECT key, viewKey, location, type, parameters FROM component')
    .then((result) =>
      result.map((r) => new Component(r.key, r.viewKey, r.location, r.type, r.parameters)),
    )
}

export const getComponent = (input: { key: string }, ctx) => {
  return ctx.db
    .get(
      SQL`SELECT 
            key, 
            viewKey, 
            location, 
            type, 
            parameters 
            FROM component 
            WHERE key = ${input.key};`,
    )
    .then((r) => (r ? new Component(r.key, r.viewKey, r.location, r.type, r.parameters) : null))
}

export const getComponentsByView = (input: { viewKey: string }, ctx) => {
  return ctx.db
    .all(
      SQL`SELECT 
            key, 
            viewKey, 
            location, 
            type, 
            parameters 
            FROM component 
            WHERE viewKey = ${input.viewKey};`,
    )
    .then((result) => {
      return result.length
        ? result.map((r) => new Component(r.key, r.viewKey, r.location, r.type, r.parameters))
        : null
    })
}

export const createComponent = async (
  input: {
    key: string
    viewKey: string
    location: string
    type: string
    parameters: Object
  },
  ctx,
) => {
  const result = await ctx.db.run(SQL`
  INSERT INTO component (key, viewKey, location, type, parameters)
  VALUES (${input.key}, ${input.viewKey}, ${input.location}, 
  ${input.type}, json(${JSON.stringify(input.parameters)})); 
`)
  if (result) {
    const order = await createComponentOrder({ componentKey: input.key }, ctx)
    if (order) {
      return getComponent({ key: input.key }, ctx)
    }
  }
  return new Error('Unable to create component')
}

export const updateParametersOfComponent = (
  input: {
    key: string
    parameters: Object
  },
  ctx,
) => {
  return ctx.db
    .run(
      SQL`
      UPDATE component SET parameters = ${JSON.stringify(input.parameters)} 
      WHERE key = ${input.key};`,
    )
    .then((result) => {
      return result.changes
        ? getComponent({ key: input.key }, ctx)
        : new Error('Unable to set parameters of component')
    })
}

export const migrateComponent = (
  input: {
    key: string
    viewKey: string
    location: string
    type: string
    parameters: Object
  },
  ctx,
) => {
  return ctx.db
    .run(
      SQL`
  REPLACE INTO component (key, viewKey, location, type, parameters)
  VALUES (${input.key}, ${input.viewKey}, ${input.location}, ${input.type}, json(${input.parameters}));`,
    )
    .then((result) => {
      return result.changes
        ? getComponent({ key: input.key }, ctx)
        : new Error('Unable to migrate component')
    })
}
// TODO: #339 Remove all item orders when deleting a component
export const deleteComponent = (input: { key: string }, ctx) => {
  return ctx.db.run(SQL`DELETE FROM component WHERE key = ${input.key}`).then((result) => {
    return result.changes
      ? getComponent({ key: input.key }, ctx)
      : new Error('Unable to delete component')
  })
}

export const cloneComponent = async (input: { key: string }, ctx) => {
  const newKey = uuidv4()
  const result = await ctx.db.run(SQL`
  INSERT INTO component 
  (
    viewKey,
    location,
    type,
    parameters,
    key)
  SELECT 
    viewKey,
    location,
    type,
    parameters,
    ${newKey}
  FROM component 
  WHERE key = ${input.key}`)
  if (result.changes) {
    const order = await createComponentOrder({ componentKey: newKey }, ctx)
    if (order) {
      return getComponent({ key: newKey }, ctx)
    }
  }
  log.error(`Unable to clone component, key - ${input.key}`)
  return new Error('Unable to clone component')
}

export const componentRootValues = {
  components: (obj, ctx) => {
    return getComponents(obj, ctx)
  },
  component: (key, ctx) => {
    return getComponent(key, ctx)
  },
  componentsByView: (key, ctx) => {
    return getComponentsByView(key, ctx)
  },
  createComponent: ({ input }, ctx) => {
    return createComponent(input, ctx)
  },
  setParametersOfComponent: ({ input }, ctx) => {
    return updateParametersOfComponent(input, ctx)
  },
  migrateComponent: ({ input }, ctx) => {
    return migrateComponent(input, ctx)
  },
  deleteComponent: ({ input }, ctx) => {
    return deleteComponent(input, ctx)
  },
  cloneComponent: ({ input }, ctx) => {
    return cloneComponent(input, ctx)
  },
}
