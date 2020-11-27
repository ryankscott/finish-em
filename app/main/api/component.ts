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
      `SELECT key, viewKey, location, type, parameters FROM component where key = '${input.key}' `,
    )
    .then((r) => (r ? new Component(r.key, r.viewKey, r.location, r.type, r.parameters) : null))
}
export const getComponentsByView = (input: { viewKey: string }, ctx) => {
  return ctx.db
    .all(
      `SELECT key, viewKey, location, type, parameters FROM component where viewKey = '${input.viewKey}';`,
    )
    .then((result) => {
      return result.length
        ? result.map((r) => new Component(r.key, r.viewKey, r.location, r.type, r.parameters))
        : null
    })
}

export const createCreateComponentQuery = (input: {
  key: string
  viewKey: string
  location: string
  type: string
  parameters: Object
}) => {
  console.log(
    `
    INSERT INTO component (key, viewKey, location, type, parameters)
    VALUES ('${input.key}', '${input.viewKey}', '${input.location}', '${
      input.type
    }', json('${JSON.stringify(input.parameters)}')); 
    `,
  )
  return `
INSERT INTO component (key, viewKey, location, type, parameters)
VALUES ('${input.key}', '${input.viewKey}', '${input.location}', '${
    input.type
  }', json('${JSON.stringify(input.parameters)}')); 
`
}

export const createComponent = (
  input: {
    key: string
    viewKey: string
    location: string
    type: string
    parameters: Object
  },
  ctx,
) => {
  return ctx.db.run(createCreateComponentQuery(input)).then((result) => {
    if (result.changes) {
      createComponentOrder({ componentKey: input.key }, ctx)
      return getComponent({ key: input.key }, ctx)
    }
    return new Error('Unable to create component')
  })
}

export const createMigrateComponentQuery = (input: {
  key: string
  viewKey: string
  location: string
  type: string
  parameters: Object
}) => {
  return `
REPLACE INTO component (key, viewKey, location, type, parameters)
VALUES ('${input.key}', '${input.viewKey}', '${input.location}', '${input.type}', json('${input.parameters}')); 
`
}

export const createUpdateParametersOfComponentQuery = (input: {
  key: string
  parameters: Object
}) => {
  return `
UPDATE component SET parameters = json('${JSON.stringify(input.parameters)}') WHERE key = '${
    input.key
  }'; 
`
}

export const updateParametersOfComponent = (
  input: {
    key: string
    parameters: Object
  },
  ctx,
) => {
  return ctx.db.run(createUpdateParametersOfComponentQuery(input)).then((result) => {
    return result.changes
      ? getComponent({ key: input.key }, ctx)
      : new Error('Unable to create component')
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
  return ctx.db.run(createMigrateComponentQuery(input)).then((result) => {
    return result.changes
      ? getComponent({ key: input.key }, ctx)
      : new Error('Unable to migrate component')
  })
}

export const createDeleteComponentInput = (input: { key: string }) => {
  return `DELETE FROM component WHERE key = '${input.key}'`
}
export const deleteComponent = (input: { key: string }, ctx) => {
  return ctx.db.run(createDeleteComponentInput(input)).then((result) => {
    return result.changes
      ? getComponent({ key: input.key }, ctx)
      : new Error('Unable to delete component')
  })
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
  createFilteredItemListComponent: ({ input }, ctx) => {
    return createComponent(input, ctx)
  },
  createViewHeaderComponent: ({ input }, ctx) => {
    return createComponent(input, ctx)
  },
  setParametersOfFilteredItemListComponent: ({ input }, ctx) => {
    return updateParametersOfComponent(input, ctx)
  },
  migrateComponent: ({ input }, ctx) => {
    return migrateComponent(input, ctx)
  },
  deleteComponent: ({ input }, ctx) => {
    return deleteComponent(input, ctx)
  },
}
