import Area from '../classes/area'
import { createAreaOrder } from './areaOrder'
import { getItemsByArea, setAreaOfItem } from './item'
import { getProjectsByArea, setAreaOfProject } from './project'
import log from 'electron-log'
import SQL from 'sql-template-strings'
import { createView } from './view'

export const getAreas = (obj, ctx) => {
  return ctx.db
    .all(
      'SELECT key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, emoji FROM area',
    )
    .then((result) =>
      result.map(
        (a) =>
          new Area(
            a.key,
            a.name,
            a.deleted,
            a.description,
            a.lastUpdatedAt,
            a.deletedAt,
            a.createdAt,
            a.emoji,
          ),
      ),
    )
}

export const getArea = (input: { key: string }, ctx) => {
  return ctx.db
    .get(
      SQL`SELECT key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, emoji 
      FROM area 
      WHERE key = ${input.key}`,
    )
    .then((result) => {
      return result
        ? new Area(
            result.key,
            result.name,
            result.deleted,
            result.description,
            result.lastUpdatedAt,
            result.deletedAt,
            result.createdAt,
            result.emoji,
          )
        : null
    })
}

export const createArea = async (
  input: {
    key: string
    name: string
    description: string
  },
  ctx,
) => {
  const areas = await getAreas({}, ctx)
  const exists = areas.map((a) => a.name == input.name).includes(true)
  if (exists) {
    log.error(`Unable to create area - name already in use`)
    return new Error('Unable to create area - name already in use')
  }
  return ctx.db
    .run(
      SQL`
  INSERT INTO area (key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt)
  VALUES (${input.key}, ${input.name}, false, ${input.description}, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  `,
    )
    .then((result) => {
      if (result.changes) {
        createAreaOrder({ areaKey: input.key }, ctx)
        createView({ key: input.key, name: input.name, icon: '', type: 'area' }, ctx)
        return getArea({ key: input.key }, ctx)
      }
      log.error(`Unable to create area`)
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
  return SQL`
REPLACE INTO area (key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt )
VALUES (${input.key}, ${input.name}, ${input.deleted}, ${input.description}, ${lastUpdatedText}, ${deletedText}, ${createdText})
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
    if (result.changes) {
      return getArea({ key: input.key }, ctx)
    }
    log.error('Unable to migrate area')
    return new Error('Unable to migrate area')
  })
}

export const deleteArea = (input: { key: string }, ctx) => {
  return ctx.db
    .run(
      SQL`UPDATE area SET deleted = true, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), deletedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = ${input.key}`,
    )
    .then(async (result) => {
      if (result.changes) {
        const items = await getItemsByArea({ areaKey: input.key }, ctx)
        items.map((i) => {
          return setAreaOfItem({ key: i.key, areaKey: '0' }, ctx)
        })
        const projects = await getProjectsByArea({ areaKey: input.key }, ctx)
        projects.map((p) => {
          return setAreaOfProject({ key: p.key, areaKey: '0' }, ctx)
        })
        return getArea({ key: input.key }, ctx)
      }
      log.error('Unable to delete area')
      return new Error('Unable to delete area')
    })
}

export const renameArea = async (input: { key: string; name: string }, ctx) => {
  const areas = await getAreas({}, ctx)
  const exists = areas.map((a) => a.name == input.name).includes(true)
  if (exists) {
    log.error(`Unable to create area - name already in use`)
    return new Error('Unable to create area - name already in use')
  }
  return ctx.db
    .run(
      SQL`UPDATE area SET name = ${input.name}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = ${input.key}`,
    )
    .then((result) => {
      if (result.changes) {
        return getArea({ key: input.key }, ctx)
      }
      log.error(`Unable to rename area`)
      return new Error('Unable to rename area')
    })
}

export const changeDescriptionArea = (input: { key: string; description: string }, ctx) => {
  return ctx.db
    .run(
      SQL`
UPDATE area SET description = ${input.description}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = ${input.key}
`,
    )
    .then((result) => {
      if (result.changes) {
        return getArea({ key: input.key }, ctx)
      }
      log.error('Unable to change description of area')
      return new Error('Unable to change description of area')
    })
}

export const setEmojiOfArea = (input: { key: string; emoji: string }, ctx) => {
  return ctx.db
    .run(
      SQL`
UPDATE area SET emoji= ${input.emoji}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = ${input.key}
`,
    )
    .then((result) => {
      if (result.changes) {
        return getArea({ key: input.key }, ctx)
      }
      log.error('Unable to set emoji of area')
      return new Error('Unable to set emoji of area')
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
  setEmojiOfArea: ({ input }, ctx) => {
    return setEmojiOfArea(input, ctx)
  },
  changeDescriptionArea: ({ input }, ctx) => {
    return changeDescriptionArea(input, ctx)
  },
}
