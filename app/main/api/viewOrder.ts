import ViewOrder from '../classes/viewOrder'

export const getViewOrders = (obj, ctx) => {
  return ctx.db
    .all('SELECT viewKey, sortOrder FROM viewOrder')
    .then((result) => result.map((r) => new ViewOrder(r.viewKey, r.sortOrder)))
}

export const getViewOrder = (input: { viewKey: string }, ctx) => {
  return ctx.db
    .get(`SELECT viewKey, sortOrder FROM viewOrder WHERE viewKey = '${input.viewKey}'`)
    .then((result) => new ViewOrder(result.viewKey, result.sortOrder))
}

export const setViewOrder = async (input: { viewKey: string; sortOrder: number }, ctx) => {
  try {
    const currentViewOrder = await getViewOrder({ viewKey: input.viewKey }, ctx)
    const currentOrder = currentViewOrder.sortOrder
    // Moving down in sort numbers
    if (input.sortOrder < currentOrder) {
      const moveDown = await ctx.db.run(
        `UPDATE viewOrder SET sortOrder = sortOrder + 1
         WHERE sortOrder BETWEEN ${input.sortOrder} AND ${currentOrder} - 1;
        `,
      )
    } else {
      const moveUp = await ctx.db.run(
        `UPDATE viewOrder SET sortOrder = sortOrder - 1
         WHERE sortOrder BETWEEN ${currentOrder} + 1 AND ${input.sortOrder};`,
      )
    }

    const setView = await ctx.db.run(
      `UPDATE viewOrder SET sortOrder = ${input.sortOrder} 
         WHERE viewKey = ${input.viewKey};`,
    )

    return await getViewOrder({ viewKey: input.viewKey }, ctx)
  } catch (e) {
    return new Error('Unable to set order of views')
  }
}

export const createViewOrder = (
  input: {
    viewKey: string
  },
  ctx,
) => {
  return ctx.db
    .run(
      `INSERT INTO viewOrder (viewKey, sortOrder) VALUES ('${input.viewKey}',(SELECT COALESCE(MAX(sortOrder),0) + 1 from viewOrder)) `,
    )
    .then((result) => {
      return result.changes
        ? getViewOrder({ viewKey: input.viewKey }, ctx)
        : new Error('Unable to create view order')
    })
}

export const migrateViewOrder = (
  input: {
    viewKey: string
    sortOrder: number
  },
  ctx,
) => {
  return ctx.db
    .run(
      `REPLACE INTO viewOrder (viewKey, sortOrder) VALUES ('${input.viewKey}',${input.sortOrder})`,
    )
    .then((result) => {
      return result.changes
        ? getViewOrder({ viewKey: input.viewKey }, ctx)
        : new Error('Unable to migrate view order')
    })
}

export const viewOrderRootValues = {
  viewOrders: (obj, ctx) => {
    return getViewOrders(obj, ctx)
  },
  viewOrder: (key, ctx) => {
    return getViewOrder(key, ctx)
  },
  setViewOrder: ({ input }, ctx) => {
    return setViewOrder(input, ctx)
  },
  createViewOrder: ({ input }, ctx) => {
    return createViewOrder(input, ctx)
  },
  migrateViewOrder: ({ input }, ctx) => {
    return migrateViewOrder(input, ctx)
  },
}
