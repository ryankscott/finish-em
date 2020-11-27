import ComponentOrder from '../classes/componentOrder'

export const getComponentOrders = (obj, ctx) => {
  return ctx.db
    .all('SELECT componentKey, sortOrder FROM componentOrder')
    .then((result) => result.map((r) => new ComponentOrder(r.componentKey, r.sortOrder)))
}

export const getComponentOrder = (input: { componentKey: string }, ctx) => {
  return ctx.db
    .get(
      `SELECT componentKey, sortOrder FROM componentOrder WHERE componentKey = '${input.componentKey}'`,
    )
    .then((result) => new ComponentOrder(result.componentKey, result.sortOrder))
}

export const setComponentOrder = async (
  input: { componentKey: string; sortOrder: number },
  ctx,
) => {
  try {
    const currentComponentOrder = await getComponentOrder({ componentKey: input.componentKey }, ctx)
    const currentOrder = currentComponentOrder.sortOrder
    // Moving down in sort numbers
    if (input.sortOrder < currentOrder) {
      const moveDown = await ctx.db.run(
        `UPDATE componentOrder SET sortOrder = sortOrder + 1
         WHERE sortOrder BETWEEN ${input.sortOrder} AND ${currentOrder} - 1;
        `,
      )
    } else {
      const moveUp = await ctx.db.run(
        `UPDATE componentOrder SET sortOrder = sortOrder - 1
         WHERE sortOrder BETWEEN ${currentOrder} + 1 AND ${input.sortOrder};`,
      )
    }

    const setComponent = await ctx.db.run(
      `UPDATE componentOrder SET sortOrder = ${input.sortOrder} 
         WHERE componentKey = ${input.componentKey};`,
    )

    return await getComponentOrder({ componentKey: input.componentKey }, ctx)
  } catch (e) {
    return new Error('Unable to set order of components')
  }
}

export const createComponentOrder = (
  input: {
    componentKey: string
  },
  ctx,
) => {
  return ctx.db
    .run(
      `INSERT INTO componentOrder (componentKey, sortOrder) VALUES ('${input.componentKey}',(SELECT MAX(sortOrder) + 1 from componentOrder)) `,
    )
    .then((result) => {
      return result.changes
        ? getComponentOrder({ componentKey: input.componentKey }, ctx)
        : new Error('Unable to create component order')
    })
}

export const migrateComponentOrder = (
  input: {
    componentKey: string
    sortOrder: number
  },
  ctx,
) => {
  return ctx.db
    .run(
      `REPLACE INTO componentOrder (componentKey, sortOrder) VALUES ('${input.componentKey}',${input.sortOrder})`,
    )
    .then((result) => {
      return result.changes
        ? getComponentOrder({ componentKey: input.componentKey }, ctx)
        : new Error('Unable to migrate component order')
    })
}

export const componentOrderRootValues = {
  componentOrders: (obj, ctx) => {
    return getComponentOrders(obj, ctx)
  },
  componentOrder: (key, ctx) => {
    return getComponentOrder(key, ctx)
  },
  setComponentOrder: ({ input }, ctx) => {
    return setComponentOrder(input, ctx)
  },
  createComponentOrder: ({ input }, ctx) => {
    return createComponentOrder(input, ctx)
  },
  migrateComponentOrder: ({ input }, ctx) => {
    return migrateComponentOrder(input, ctx)
  },
}
