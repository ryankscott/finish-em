import ItemOrder from '../classes/itemOrder'

export const getItemOrders = (obj, ctx) => {
  return ctx.db
    .all('SELECT itemKey, sortOrder FROM itemOrder')
    .then((result) => result.map((r) => new ItemOrder(r.itemKey, r.sortOrder)))
}

export const getItemOrder = (input: { itemKey: string }, ctx) => {
  return ctx.db
    .get(`SELECT itemKey, sortOrder FROM itemOrder WHERE itemKey = '${input.itemKey}'`)
    .then((result) => new ItemOrder(result.itemKey, result.sortOrder))
}

export const setItemOrder = async (input: { itemKey: string; sortOrder: number }, ctx) => {
  try {
    const currentItemOrder = await getItemOrder({ itemKey: input.itemKey }, ctx)
    const currentOrder = currentItemOrder.sortOrder
    // Moving down in sort numbers
    if (input.sortOrder < currentOrder) {
      const moveDown = await ctx.db.run(
        `UPDATE itemOrder SET sortOrder = sortOrder + 1
         WHERE sortOrder BETWEEN ${input.sortOrder} AND ${currentOrder} - 1;
        `,
      )
    } else {
      const moveUp = await ctx.db.run(
        `UPDATE itemOrder SET sortOrder = sortOrder - 1
         WHERE sortOrder BETWEEN ${currentOrder} + 1 AND ${input.sortOrder};`,
      )
    }

    const setItem = await ctx.db.run(
      `UPDATE itemOrder SET sortOrder = ${input.sortOrder} 
         WHERE itemKey = '${input.itemKey}';`,
    )

    return await getItemOrder({ itemKey: input.itemKey }, ctx)
  } catch (e) {
    return new Error('Unable to set order of items')
  }
}

export const createCreateItemOrderQuery = (input: { itemKey: string }) => {
  return `
      INSERT INTO itemOrder (itemKey, sortOrder) VALUES ('${input.itemKey}',(SELECT COALESCE(MAX(sortOrder),0) + 1 from itemOrder)) 
`
}

export const createItemOrder = async (
  input: {
    itemKey: string
  },
  ctx,
) => {
  const result = await ctx.db.run(createCreateItemOrderQuery(input))
  if (result.changes) {
    return getItemOrder({ itemKey: input.itemKey }, ctx)
  }
  return new Error('Unable to create item order')
}

export const migrateItemOrder = (
  input: {
    itemKey: string
    sortOrder: number
  },
  ctx,
) => {
  return ctx.db
    .run(
      `INSERT INTO itemOrder (itemKey, sortOrder) VALUES ('${input.itemKey}',${input.sortOrder})`,
    )
    .then((result) => {
      return result.changes
        ? getItemOrder({ itemKey: input.itemKey }, ctx)
        : new Error('Unable to migrate item order')
    })
}

export const itemOrderRootValues = {
  itemOrders: (obj, ctx) => {
    return getItemOrders(obj, ctx)
  },
  itemOrder: (key, ctx) => {
    return getItemOrder(key, ctx)
  },
  setItemOrder: ({ input }, ctx) => {
    return setItemOrder(input, ctx)
  },
  createItemOrder: ({ input }, ctx) => {
    return createItemOrder(input, ctx)
  },
  migrateItemOrder: ({ input }, ctx) => {
    return migrateItemOrder(input, ctx)
  },
}
