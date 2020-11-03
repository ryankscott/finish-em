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

export const setItemOrder = async (input: { itemKey: string; newOrder: number }, ctx) => {
  try {
    const currentItemOrder = await getItemOrder({ itemKey: input.itemKey }, ctx)
    const currentOrder = currentItemOrder.sortOrder
    // Moving down in sort numbers
    if (input.newOrder < currentOrder) {
      const moveDown = await ctx.db.run(
        `UPDATE itemOrder SET sortOrder = sortOrder + 1
         WHERE sortOrder BETWEEN ${input.newOrder} AND ${currentOrder} - 1;
        `,
      )
    } else {
      const moveUp = await ctx.db.run(
        `UPDATE itemOrder SET sortOrder = sortOrder - 1
         WHERE sortOrder BETWEEN ${currentOrder} + 1 AND ${input.newOrder};`,
      )
    }

    const setItem = await ctx.db.run(
      `UPDATE itemOrder SET sortOrder = ${input.newOrder} 
         WHERE itemKey = '${input.itemKey}';`,
    )

    return await getItemOrder({ itemKey: input.itemKey }, ctx)
  } catch (e) {
    return new Error('Unable to set order of items')
  }
}

export const createItemOrder = (
  input: {
    itemKey: string
  },
  ctx,
) => {
  return ctx.db
    .run(
      `INSERT INTO ItemOrder (itemKey, sortOrder) VALUES ('${input.itemKey}',(SELECT MAX(sortOrder) + 1 from ItemOrder)) `,
    )
    .then((result) => {
      return result.changes
        ? getItemOrder({ itemKey: input.itemKey }, ctx)
        : new Error('Unable to create item order')
    })
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
      `INSERT INTO ItemOrder (itemKey, sortOrder) VALUES ('${input.itemKey}',${input.sortOrder})`,
    )
    .then((result) => {
      return result.changes
        ? getItemOrder({ itemKey: input.itemKey }, ctx)
        : new Error('Unable to migrate item order')
    })
}
