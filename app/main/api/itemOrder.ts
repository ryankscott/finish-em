const log = require('electron-log')
import ItemOrder from '../classes/itemOrder'

export const getItemOrders = (obj, ctx) => {
  return ctx.db
    .all('SELECT itemKey, sortOrder, componentKey FROM itemOrder ORDER BY sortOrder ASC')
    .then((result) => result.map((r) => new ItemOrder(r.itemKey, r.sortOrder, r.componentKey)))
}

export const getItemOrder = (input: { itemKey: string; componentKey: string }, ctx) => {
  return ctx.db
    .get('SELECT itemKey, sortOrder, componentKey FROM itemOrder WHERE itemKey = ?', input.itemKey)
    .then((result) => new ItemOrder(result.itemKey, result.sortOrder, result.componentKey))
}

export const deleteItemOrder = async (input: { itemKey: string; componentKey: string }, ctx) => {
  const deleteItem = await ctx.db.run(
    'DELETE from itemOrder WHERE itemKey = ? AND componentKey = ?',
    input.itemKey,
    input.componentKey,
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
  console.log(input.componentKey)
  const deleteItem = await ctx.db.run(
    'DELETE from itemOrder WHERE componentKey = ?',
    input.componentKey,
  )
  if (deleteItem) {
    return input.componentKey
  } else {
    return new Error(`Failed to delete itemOrders with componentKey ${input.componentKey}`)
  }
}

export const getItemOrdersByComponent = async (input: { componentKey: string }, ctx) => {
  const result = await ctx.db.all(
    'SELECT itemKey, sortOrder, componentKey FROM itemOrder WHERE componentKey = ? ORDER BY sortOrder ASC',
    input.componentKey,
  )
  if (result) {
    return result.map((r) => new ItemOrder(r.itemKey, r.sortOrder, r.componentKey))
  } else return new Error(`Failed to get itemOrders by item - ${input.componentKey}`)
}

export const getItemOrdersByItem = async (input: { itemKey: string }, ctx) => {
  const result = await ctx.db.all(
    'SELECT componentKey, sortOrder  FROM itemOrder WHERE itemKey = ? ORDER BY componentKey ASC',
    input.itemKey,
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
      'UPDATE itemOrder SET sortOrder = sortOrder + 1 WHERE sortOrder BETWEEN ? AND ? AND componentKey = ?;',
      input.sortOrder,
      currentOrder - 1,
      input.componentKey,
    )
  } else {
    const moveUp = await ctx.db.run(
      'UPDATE itemOrder SET sortOrder = sortOrder - 1 WHERE sortOrder BETWEEN ? AND ? AND componentKey = ?;',
      currentOrder + 1,
      input.sortOrder,
      input.componentKey,
    )
  }
  const setItem = await ctx.db.run(
    'UPDATE itemOrder SET sortOrder = ? WHERE itemKey = ? and componentKey = ?;',
    input.sortOrder,
    input.itemKey,
    input.componentKey,
  )

  return await getItemOrder({ itemKey: input.itemKey, componentKey: input.componentKey }, ctx)
}

export const createItemOrder = async (
  input: {
    itemKey: string
    componentKey: string
  },
  ctx,
) => {
  const result = await ctx.db.run(
    'INSERT INTO itemOrder (itemKey, componentKey, sortOrder) VALUES (?,?,(SELECT COALESCE(MAX(sortOrder),0) + 1 FROM itemOrder WHERE componentKey = ?));',
    input.itemKey,
    input.componentKey,
    input.componentKey,
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
  // TODO: Get the max sortOrder

  const insertQueries = input.itemKeys.map((i, idx) => {
    return `('${i}','${input.componentKey}',${idx + 1})`
  })
  const query = `
  INSERT INTO itemOrder (itemKey, componentKey, sortOrder) VALUES 
  ${insertQueries.join(',')};`
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
    .run('INSERT INTO itemOrder (itemKey, sortOrder) VALUES (?,?)', input.itemKey, input.sortOrder)
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
