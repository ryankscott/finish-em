import View from '../classes/view'
import { createViewOrder } from './viewOrder'
import SqlString from 'sqlstring-sqlite'

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
      `SELECT key, name, icon, type, deleted, deletedAt, lastUpdatedAt, createdAt FROM view WHERE key = '${input.key}'`,
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

export const createCreateViewQuery = (input: {
  key: string
  name: string
  icon: string
  type: string
}) => {
  return `
INSERT INTO view (key, name, icon, type, deleted, deletedAt, lastUpdatedAt,  createdAt)
VALUES ('${input.key}', ${SqlString.escape(input.name)}, '${input.icon}', '${
    input.type
  }', false, null,  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
`
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
  return ctx.db.run(createCreateViewQuery(input)).then((result) => {
    if (result.changes) {
      createViewOrder({ viewKey: input.key }, ctx)
      return getView({ key: input.key }, ctx)
    }
    return new Error('Unable to create view')
  })
}

export const createMigrateViewQuery = (input: {
  key: string
  name: string
  icon: string
  type: string
}) => {
  const iconText = input.icon ? input.icon : ''
  return `
REPLACE INTO view (key, name, icon, type, deleted, deletedAt,lastUpdatedAt, createdAt )
VALUES ('${input.key}', ${SqlString.escape(input.name)}, '${iconText}', '${
    input.type
  }', false, '', '', '')
`
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
  return ctx.db.run(createMigrateViewQuery(input)).then((result) => {
    return result.changes ? getView({ key: input.key }, ctx) : new Error('Unable to migrate view')
  })
}

export const createDeleteViewInput = (input: { key: string }) => {
  return `UPDATE view SET deleted = true, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), deletedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'`
}
export const deleteView = (input: { key: string }, ctx) => {
  return ctx.db.run(createDeleteViewInput(input)).then((result) => {
    return result.changes ? getView({ key: input.key }, ctx) : new Error('Unable to delete view')
  })
}

export const createRenameViewQuery = (input: { key: string; name: string }) => {
  return `
UPDATE view SET name = ${SqlString.escape(
    input.name,
  )}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}
export const renameView = (input: { key: string; name: string }, ctx) => {
  return ctx.db.run(createRenameViewQuery(input)).then((result) => {
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
