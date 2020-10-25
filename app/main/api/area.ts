import Area from '../classes/area'

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

//TODO: Not sure why this is an object for key
export const getArea = (key: { key: string }, ctx) => {
  return ctx.db
    .get(
      'SELECT key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt FROM area WHERE key = $key',
      { $key: key.key },
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

export const createArea = (
  area: {
    key: string
    name: string
    deleted: boolean
    description: string
    lastUpdatedAt: string
    deletedAt: string
    createdAt: string
  },
  ctx,
) => {
  return ctx.db
    .run(
      'INSERT INTO area (key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt ) VALUES (?, ?, ?, ?, ?, ?, ? )',
      area.key,
      area.name,
      area.deleted,
      area.description,
      area.lastUpdatedAt,
      area.deletedAt,
      area.createdAt,
    )
    .then((result) => {
      return result.changes ? getArea({ key: area.key }, ctx) : new Error('Unable to create area')
    })
}
export const deleteArea = (area: { key: string }, ctx) => {
  return ctx.db
    .run(
      `UPDATE area SET deleted = true, lastUpdatedAt = current_timestamp, deletedAt = current_timestamp WHERE key = $key`,
      {
        $key: area.key,
      },
    )
    .then((result) => {
      return result.changes ? getArea({ key: area.key }, ctx) : new Error('Unable to rename area')
    })
}

export const renameArea = (area: { key: string; name: string }, ctx) => {
  return ctx.db
    .run(`UPDATE area SET name = $name, lastUpdatedAt = current_timestamp WHERE key = $key`, {
      $key: area.key,
      $name: area.name,
    })
    .then((result) => {
      return result.changes ? getArea({ key: area.key }, ctx) : new Error('Unable to rename area')
    })
}

export const changeDescriptionArea = (area: { key: string; description: string }, ctx) => {
  return ctx.db
    .run(
      `UPDATE area SET description = $description, lastUpdatedAt = current_timestamp WHERE key = $key`,
      {
        $key: area.key,
        $description: area.description,
      },
    )
    .then((result) => {
      return result.changes
        ? getArea({ key: area.key }, ctx)
        : new Error('Unable to change description of area')
    })
}
