import Area from '../classes/area'
import { createAreaOrder } from './areaOrder'

export const getAreas = (obj, ctx) => {
  return ctx.db
    .all('SELECT key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt FROM area')
    .then((result) =>
      result.map(
        (r) =>
          new Area(
            r.key,
            r.name,
            r.deleted,
            r.description,
            r.lastUpdatedAt,
            r.deletedAt,
            r.createdAt,
          ),
      ),
    )
}

export const getArea = (input: { key: string }, ctx) => {
  return ctx.db
    .get(
      `SELECT key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt FROM area WHERE key = '${input.key}'`,
    )
    .then(
      (result) =>
        new Area(
          result.key,
          result.name,
          result.deleted,
          result.description,
          result.lastUpdatedAt,
          result.deletedAt,
          result.createdAt,
        ),
    )
}

export const createCreateAreaQuery = (input: {
  key: string
  name: string
  description: string
}) => {
  return `
INSERT INTO area (key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt)
VALUES ('${input.key}', '${input.name}', false, '${input.description}', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
`
}

export const createArea = (
  input: {
    key: string
    name: string
    description: string
  },
  ctx,
) => {
  return ctx.db.run(createCreateAreaQuery(input)).then((result) => {
    if (result.changes) {
      createAreaOrder({ areaKey: input.key }, ctx)
      return getArea({ key: input.key }, ctx)
    }
    return new Error('Unable to create area')
  })
}

export const createMigrateAreaQuery = (input: {
  key: string
  name: string
  deleted: boolean
  description: string
  lastUpdatedAt: Date
  deletedAt: Date
  createdAt: Date
}) => {
  const lastUpdatedText = input.lastUpdatedAt ? input.lastUpdatedAt.toISOString() : ''
  const deletedText = input.deletedAt ? input.deletedAt.toISOString() : ''
  const createdText = input.createdAt ? input.createdAt.toISOString() : ''
  return `
REPLACE INTO area (key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt )
VALUES ('${input.key}', '${input.name}', ${input.deleted}, '${input.description}', '${lastUpdatedText}', '${deletedText}', '${createdText}')
`
}

export const migrateArea = (
  input: {
    key: string
    name: string
    deleted: boolean
    description: string
    lastUpdatedAt: Date
    deletedAt: Date
    createdAt: Date
  },
  ctx,
) => {
  return ctx.db.run(createMigrateAreaQuery(input)).then((result) => {
    return result.changes ? getArea({ key: input.key }, ctx) : new Error('Unable to migrate area')
  })
}

export const createDeleteAreaInput = (input: { key: string }) => {
  return `UPDATE area SET deleted = true, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), deletedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'`
}
export const deleteArea = (input: { key: string }, ctx) => {
  return ctx.db.run(createDeleteAreaInput(input)).then((result) => {
    return result.changes ? getArea({ key: input.key }, ctx) : new Error('Unable to delete area')
  })
}

export const createRenameAreaQuery = (input: { key: string; name: string }) => {
  return `
UPDATE area SET name = '${input.name}', lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}
export const renameArea = (input: { key: string; name: string }, ctx) => {
  return ctx.db.run(createRenameAreaQuery(input)).then((result) => {
    return result.changes ? getArea({ key: input.key }, ctx) : new Error('Unable to rename area')
  })
}

export const createChangeDescriptionAreaQuery = (input: { key: string; description: string }) => {
  return `
UPDATE area SET description = '${input.description}', lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}
export const changeDescriptionArea = (input: { key: string; description: string }, ctx) => {
  return ctx.db.run(createChangeDescriptionAreaQuery(input)).then((result) => {
    return result.changes
      ? getArea({ key: input.key }, ctx)
      : new Error('Unable to change description of area')
  })
}

export const areaRootValues = {
  areas: (obj, ctx) => {
    return getAreas(obj, ctx)
  },
  area: (key, ctx) => {
    return getArea(key, ctx)
  },
  createArea: ({ input }, ctx) => {
    return createArea(input, ctx)
  },
  migrateArea: ({ input }, ctx) => {
    return migrateArea(input, ctx)
  },
  deleteArea: ({ input }, ctx) => {
    return deleteArea(input, ctx)
  },
  renameArea: ({ input }, ctx) => {
    return renameArea(input, ctx)
  },
  changeDescriptionArea: ({ input }, ctx) => {
    return changeDescriptionArea(input, ctx)
  },
}
