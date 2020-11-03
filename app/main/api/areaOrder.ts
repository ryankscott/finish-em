import AreaOrder from '../classes/areaOrder'

export const getAreaOrders = (obj, ctx) => {
  return ctx.db
    .all('SELECT areaKey, sortOrder FROM areaOrder')
    .then((result) => result.map((r) => new AreaOrder(r.areaKey, r.sortOrder)))
}

export const getAreaOrder = (input: { areaKey: string }, ctx) => {
  return ctx.db
    .get(`SELECT areaKey, sortOrder FROM areaOrder WHERE areaKey = '${input.areaKey}'`)
    .then((result) => new AreaOrder(result.areaKey, result.sortOrder))
}

export const setAreaOrder = async (input: { areaKey: string; newOrder: number }, ctx) => {
  try {
    const currentAreaOrder = await getAreaOrder({ areaKey: input.areaKey }, ctx)
    const currentOrder = currentAreaOrder.sortOrder
    // Moving down in sort numbers
    if (input.newOrder < currentOrder) {
      const moveDown = await ctx.db.run(
        `UPDATE areaOrder SET sortOrder = sortOrder + 1
         WHERE sortOrder BETWEEN ${input.newOrder} AND ${currentOrder} - 1;
        `,
      )
    } else {
      const moveUp = await ctx.db.run(
        `UPDATE areaOrder SET sortOrder = sortOrder - 1
         WHERE sortOrder BETWEEN ${currentOrder} + 1 AND ${input.newOrder};`,
      )
    }

    const setArea = await ctx.db.run(
      `UPDATE areaOrder SET sortOrder = ${input.newOrder} 
         WHERE areaKey = ${input.areaKey};`,
    )

    return await getAreaOrder({ areaKey: input.areaKey }, ctx)
  } catch (e) {
    return new Error('Unable to set order of areas')
  }
}

export const createAreaOrder = (
  input: {
    areaKey: string
  },
  ctx,
) => {
  return ctx.db
    .run(
      `INSERT INTO AreaOrder (areaKey, sortOrder) VALUES (${input.areaKey},(SELECT MAX(sortOrder) + 1 from AreaOrder)) `,
    )
    .then((result) => {
      return result.changes
        ? getAreaOrder({ areaKey: input.areaKey }, ctx)
        : new Error('Unable to create area order')
    })
}

export const migrateAreaOrder = (
  input: {
    areaKey: string
    sortOrder: number
  },
  ctx,
) => {
  return ctx.db
    .run(`REPLACE INTO AreaOrder (areaKey, sortOrder) VALUES (${input.areaKey},${input.sortOrder})`)
    .then((result) => {
      return result.changes
        ? getAreaOrder({ areaKey: input.areaKey }, ctx)
        : new Error('Unable to migrate area order')
    })
}
