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

export const setAreaOrder = async (input: { areaKey: string; sortOrder: number }, ctx) => {
  try {
    const currentAreaOrder = await getAreaOrder({ areaKey: input.areaKey }, ctx)
    const currentOrder = currentAreaOrder.sortOrder
    // Moving down in sort numbers
    if (input.sortOrder < currentOrder) {
      const moveDown = await ctx.db.run(
        `UPDATE areaOrder SET sortOrder = sortOrder + 1
         WHERE sortOrder BETWEEN ${input.sortOrder} AND ${currentOrder} - 1;
        `,
      )
    } else {
      const moveUp = await ctx.db.run(
        `UPDATE areaOrder SET sortOrder = sortOrder - 1
         WHERE sortOrder BETWEEN ${currentOrder} + 1 AND ${input.sortOrder};`,
      )
    }

    const setArea = await ctx.db.run(
      `UPDATE areaOrder SET sortOrder = ${input.sortOrder} 
         WHERE areaKey = '${input.areaKey}';`,
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
      `INSERT INTO areaOrder (areaKey, sortOrder) VALUES ('${input.areaKey}', (SELECT MAX(sortOrder) + 1 from areaOrder)) `,
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
    .run(
      `REPLACE INTO areaOrder (areaKey, sortOrder) VALUES ('${input.areaKey}',${input.sortOrder})`,
    )
    .then((result) => {
      return result.changes
        ? getAreaOrder({ areaKey: input.areaKey }, ctx)
        : new Error('Unable to migrate area order')
    })
}

export const areaOrderRootValues = {
  areaOrders: (obj, ctx) => {
    return getAreaOrders(obj, ctx)
  },
  areaOrder: (key, ctx) => {
    return getAreaOrder(key, ctx)
  },
  setAreaOrder: ({ input }, ctx) => {
    return setAreaOrder(input, ctx)
  },
  createAreaOrder: ({ input }, ctx) => {
    return createAreaOrder(input, ctx)
  },
  migrateAreaOrder: ({ input }, ctx) => {
    return migrateAreaOrder(input, ctx)
  },
}
