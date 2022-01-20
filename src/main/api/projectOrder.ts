import ProjectOrder from '../classes/projectOrder'

export const getProjectOrders = (obj, ctx) => {
  return ctx.db
    .all('SELECT projectKey, sortOrder FROM projectOrder')
    .then((result) => result.map((r) => new ProjectOrder(r.projectKey, r.sortOrder)))
}

export const getProjectOrder = (input: { projectKey: string }, ctx) => {
  return ctx.db
    .get(`SELECT projectKey, sortOrder FROM projectOrder WHERE projectKey = '${input.projectKey}'`)
    .then((result) => new ProjectOrder(result.projectKey, result.sortOrder))
}

export const setProjectOrder = async (input: { projectKey: string; sortOrder: number }, ctx) => {
  try {
    const currentProjectOrder = await getProjectOrder({ projectKey: input.projectKey }, ctx)
    const currentOrder = await currentProjectOrder.sortOrder
    // Moving down in sort numbers
    if (input.sortOrder < currentOrder) {
      const moveDown = await ctx.db.run(
        `UPDATE projectOrder SET sortOrder = sortOrder + 1
         WHERE sortOrder BETWEEN ${input.sortOrder} AND ${currentOrder} - 1;
        `,
      )
    } else {
      const moveUp = await ctx.db.run(
        `UPDATE projectOrder SET sortOrder = sortOrder - 1
         WHERE sortOrder BETWEEN ${currentOrder} + 1 AND ${input.sortOrder};`,
      )
    }
    const setProject = await ctx.db.run(
      `UPDATE projectOrder SET sortOrder = ${input.sortOrder} 
         WHERE projectKey = '${input.projectKey}';`,
    )

    return await getProjectOrder({ projectKey: input.projectKey }, ctx)
  } catch (e) {
    console.log(e)
    return new Error('Unable to set order of projects')
  }
}

export const createCreateProjectOrderQuery = (input: { projectKey: string }) => {
  return `INSERT INTO projectOrder (projectKey, sortOrder) VALUES ('${input.projectKey}',(SELECT COALESCE(MAX(sortOrder),0) + 1 from projectOrder));`
}
export const createProjectOrder = (
  input: {
    projectKey: string
  },
  ctx,
) => {
  return ctx.db.run(createCreateProjectOrderQuery(input)).then((result) => {
    return result.changes
      ? getProjectOrder({ projectKey: input.projectKey }, ctx)
      : new Error('Unable to create project order')
  })
}

export const createMigrateProjectOrder = (input: { projectKey: string; sortOrder: number }) => {
  return `REPLACE INTO projectOrder (projectKey, sortOrder) VALUES ('${input.projectKey}', ${input.sortOrder})`
}
export const migrateProjectOrder = (
  input: {
    projectKey: string
    sortOrder: number
  },
  ctx,
) => {
  return ctx.db.run(createMigrateProjectOrder(input)).then((result) => {
    return result.changes
      ? getProjectOrder({ projectKey: input.projectKey }, ctx)
      : new Error('Unable to create project order')
  })
}

export const projectOrderRootValues = {
  projectOrders: (obj, ctx) => {
    return getProjectOrders(obj, ctx)
  },
  projectOrder: (key, ctx) => {
    return getProjectOrder(key, ctx)
  },
  setProjectOrder: ({ input }, ctx) => {
    return setProjectOrder(input, ctx)
  },
  createProjectOrder: ({ input }, ctx) => {
    return createProjectOrder(input, ctx)
  },
  migrateProjectOrder: ({ input }, ctx) => {
    return migrateProjectOrder(input, ctx)
  },
}
