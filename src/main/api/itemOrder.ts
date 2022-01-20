const log = require('electron-log')
import SQL from 'sql-template-strings'
import ItemOrder from '../classes/itemOrder'

export const getItemOrders = (obj, ctx) => {
  return ctx.db
    .all('SELECT itemKey, sortOrder, componentKey FROM itemOrder ORDER BY sortOrder ASC')
    .then((result) => result.map((r) => new ItemOrder(r.itemKey, r.sortOrder, r.componentKey)))
}

export const getItemOrder = (input: { itemKey: string; componentKey: string }, ctx) => {
  return ctx.db
    .get(
      SQL`SELECT itemKey, sortOrder, componentKey FROM itemOrder WHERE itemKey = ${input.itemKey}`,
    )
    .then((result) => new ItemOrder(result.itemKey, result.sortOrder, result.componentKey))
}

export const deleteItemOrders = async (
  input: { itemKeys: string[]; componentKey: string },
  ctx,
) => {
  if (!input.itemKeys.length) {
    return null
  }
  const deleteItems = await ctx.db.run(
    SQL`DELETE from itemOrder WHERE itemKey IN (${input.itemKeys
      .map((i) => `'${i}'`)
      .join(', ')}) AND componentKey = ${input.componentKey}`,
  )
  if (deleteItems) {
    return null
  } else {
    return new Error(`Failed to delete itemOrders and componentKey ${input.componentKey}`)
  }
}

export const deleteItemOrder = async (input: { itemKey: string; componentKey: string }, ctx) => {
  const deleteItem = await ctx.db.run(
    SQL`DELETE from itemOrder WHERE itemKey = ${input.itemKey} AND componentKey = ${input.componentKey}`,
  )
  if (deleteItem) {
    return input.itemKey
  } else {
    return new Error(
      `Failed to delete itemOrder with key ${input.itemKey} and componentKey ${input.componentKey}`,
    )
  }
}

export const deleteItemOrdersByComponent = async (input: { componentKey: string }, ctx) => {
  const deleteItem = await ctx.db.run(
    SQL`DELETE from itemOrder WHERE componentKey = ${input.componentKey}`,
  )
  if (deleteItem) {
    return input.componentKey
  } else {
    return new Error(`Failed to delete itemOrders with componentKey ${input.componentKey}`)
  }
}

export const getItemOrdersByComponent = async (input: { componentKey: string }, ctx) => {
  const result = await ctx.db.all(
    SQL`SELECT itemKey, sortOrder, componentKey FROM itemOrder WHERE componentKey = ${input.componentKey} ORDER BY sortOrder ASC`,
  )
  if (result) {
    return result.map((r) => new ItemOrder(r.itemKey, r.sortOrder, r.componentKey))
  } else return new Error(`Failed to get itemOrders by item - ${input.componentKey}`)
}

export const getItemOrdersByItem = async (input: { itemKey: string }, ctx) => {
  const result = await ctx.db.all(
    SQL`SELECT componentKey, sortOrder  FROM itemOrder WHERE itemKey = ${input.itemKey} ORDER BY componentKey ASC`,
  )
  if (result) {
    return result.map((r) => new ItemOrder(r.itemKey, r.sortOrder, r.componentKey))
  } else return new Error(`Failed to get itemOrders by component - ${input.itemKey}`)
}

export const setItemOrder = async (
  input: { itemKey: string; componentKey: string; sortOrder: number },
  ctx,
) => {
  const currentItemOrder = await getItemOrder(
    { itemKey: input.itemKey, componentKey: input.componentKey },
    ctx,
  )
  const currentOrder = currentItemOrder.sortOrder
  // Moving down in sort numbers
  if (input.sortOrder < currentOrder) {
    const moveDown = await ctx.db.run(
      SQL`UPDATE itemOrder SET sortOrder = sortOrder + 1 WHERE sortOrder BETWEEN ${
        input.sortOrder
      } AND ${currentOrder - 1} AND componentKey = ${input.componentKey};`,
    )
  } else {
    const moveUp = await ctx.db.run(
      SQL`UPDATE itemOrder SET sortOrder = sortOrder - 1 WHERE sortOrder BETWEEN ${
        currentOrder + 1
      } AND ${input.sortOrder} AND componentKey = ${input.componentKey};`,
    )
  }
  const setItem = await ctx.db.run(
    SQL`UPDATE itemOrder SET sortOrder = ${input.sortOrder} WHERE itemKey = ${input.itemKey} and componentKey = ${input.componentKey};`,
  )

  return input.itemKey
}

export const createItemOrder = async (
  input: {
    itemKey: string
    componentKey: string
  },
  ctx,
) => {
  const result = await ctx.db.run(
    SQL`INSERT INTO itemOrder (itemKey, componentKey, sortOrder) VALUES (${input.itemKey},${input.componentKey},(SELECT COALESCE(MAX(sortOrder),0) + 1 FROM itemOrder WHERE componentKey = ${input.componentKey}));`,
  )
  if (result.changes) {
    return getItemOrder({ itemKey: input.itemKey, componentKey: input.componentKey }, ctx)
  }
  return new Error('Unable to create item order')
}

// TODO: See if we can do this faster
export const bulkCreateItemOrders = async (
  input: {
    itemKeys: string[]
    componentKey: string
  },
  ctx,
) => {
  if (!input.itemKeys.length) {
    return null
  }
  const maxOrder = await ctx.db.get(
    `SELECT COALESCE(MAX(sortOrder),0) + 1 as maxOrder FROM itemOrder`,
  )
  // TODO: Look at changing this to a SQL append
  const insertQueries = input.itemKeys.map((i, idx) => {
    return `('${i}','${input.componentKey}',${maxOrder.maxOrder + idx + 1})`
  })

  // TODO: For some reason this doesn't work with the es6 templates
  const query = `INSERT INTO itemOrder (itemKey, componentKey, sortOrder) 
  VALUES ${insertQueries.join(',')};`
  const result = await ctx.db.run(query)
  if (result.changes) {
    return null
  }
  return new Error('Unable to bulk create item order')
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
      SQL`INSERT INTO itemOrder (itemKey, sortOrder) VALUES (${input.itemKey},${input.sortOrder})`,
    )
    .then((result) => {
      return result.changes ? null : new Error('Unable to migrate item order')
    })
}

export const itemOrderRootValues = {
  itemOrders: (obj, ctx) => {
    return getItemOrders(obj, ctx)
  },
  itemOrdersByComponent: (obj, ctx) => {
    return getItemOrdersByComponent(obj, ctx)
  },
  itemOrdersByItem: (obj, ctx) => {
    return getItemOrdersByItem(obj, ctx)
  },
  itemOrder: (key, ctx) => {
    return getItemOrder(key, ctx)
  },
  deleteItemOrder: ({ input }, ctx) => {
    return deleteItemOrder(input, ctx)
  },
  deleteItemOrdersByComponent: ({ input }, ctx) => {
    return deleteItemOrdersByComponent(input, ctx)
  },
  setItemOrder: ({ input }, ctx) => {
    return setItemOrder(input, ctx)
  },
  createItemOrder: ({ input }, ctx) => {
    return createItemOrder(input, ctx)
  },
  bulkCreateItemOrders: ({ input }, ctx) => {
    return bulkCreateItemOrders(input, ctx)
  },
  migrateItemOrder: ({ input }, ctx) => {
    return migrateItemOrder(input, ctx)
  },
}
