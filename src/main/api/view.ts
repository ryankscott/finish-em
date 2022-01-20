import View from '../classes/view'
import { createViewOrder } from './viewOrder'
import SQL from 'sql-template-strings'

export const getViews = (obj, ctx) => {
  return ctx.db
    .all('SELECT key, name, icon, type, deleted, deletedAt, lastUpdatedAt, createdAt FROM view')
    .then((result) =>
      result.map(
        (r) =>
          new View(
            r.key,
            r.name,
            r.icon,
            r.type,
            r.deleted,
            r.deletedAt,
            r.lastUpdatedAt,
            r.createdAt,
          ),
      ),
    )
}

export const getView = (input: { key: string }, ctx) => {
  return ctx.db
    .get(
      SQL`SELECT key, name, icon, type, deleted, deletedAt, lastUpdatedAt, createdAt FROM view WHERE key = ${input.key}`,
    )
    .then(
      (result) =>
        new View(
          result.key,
          result.name,
          result.icon,
          result.type,
          result.deleted,
          result.deletedAt,
          result.lastUpdatedAt,
          result.createdAt,
        ),
    )
}

export const createView = (
  input: {
    key: string
    name: string
    icon: string
    type: string
  },
  ctx,
) => {
  return ctx.db
    .run(
      SQL`
INSERT INTO view (key, name, icon, type, deleted, deletedAt, lastUpdatedAt,  createdAt)
VALUES (${input.key}, ${input.name}, ${input.icon}, ${input.type}, false, null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
`,
    )
    .then((result) => {
      if (result.changes) {
        createViewOrder({ viewKey: input.key }, ctx)
        return getView({ key: input.key }, ctx)
      }
      return new Error('Unable to create view')
    })
}

export const migrateView = (
  input: {
    key: string
    name: string
    icon: string
    type: string
  },
  ctx,
) => {
  return ctx.db
    .run(
      SQL`
REPLACE INTO view (key, name, icon, type, deleted, deletedAt,lastUpdatedAt, createdAt )
VALUES (${input.key}, ${input.name}, ${input.icon ? input.icon : ''}, ${
        input.type
      }, false, '', '', '')
`,
    )
    .then((result) => {
      return result.changes ? getView({ key: input.key }, ctx) : new Error('Unable to migrate view')
    })
}

export const deleteView = (input: { key: string }, ctx) => {
  return ctx.db
    .run(
      SQL`
  UPDATE view 
  SET deleted = true, 
      lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 
      deletedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
  WHERE key = ${input.key}`,
    )
    .then((result) => {
      return result.changes ? getView({ key: input.key }, ctx) : new Error('Unable to delete view')
    })
}

export const renameView = (input: { key: string; name: string }, ctx) => {
  return ctx.db
    .run(
      SQL`
  UPDATE view 
  SET name = ${input.name}, 
      lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
  WHERE key = ${input.key}
  `,
    )
    .then((result) => {
      return result.changes ? getView({ key: input.key }, ctx) : new Error('Unable to rename view')
    })
}

export const viewRootValues = {
  views: (obj, ctx) => {
    return getViews(obj, ctx)
  },
  view: (key, ctx) => {
    return getView(key, ctx)
  },
  createView: ({ input }, ctx) => {
    return createView(input, ctx)
  },
  migrateView: ({ input }, ctx) => {
    return migrateView(input, ctx)
  },
  deleteView: ({ input }, ctx) => {
    return deleteView(input, ctx)
  },
  renameView: ({ input }, ctx) => {
    return renameView(input, ctx)
  },
}
