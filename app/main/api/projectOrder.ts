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

export const setProjectOrder = async (input: { projectKey: string; newOrder: number }, ctx) => {
  try {
    const currentProjectOrder = await getProjectOrder({ projectKey: input.projectKey }, ctx)
    const currentOrder = currentProjectOrder.sortOrder
    // Moving down in sort numbers
    if (input.newOrder < currentOrder) {
      const moveDown = await ctx.db.run(
        `UPDATE projectOrder SET sortOrder = sortOrder + 1
         WHERE sortOrder BETWEEN ${input.newOrder} AND ${currentOrder} - 1;
        `,
      )
    } else {
      const moveUp = await ctx.db.run(
        `UPDATE projectOrder SET sortOrder = sortOrder - 1
         WHERE sortOrder BETWEEN ${currentOrder} + 1 AND ${input.newOrder};`,
      )
    }

    const setProject = await ctx.db.run(
      `UPDATE projectOrder SET sortOrder = ${input.newOrder} 
         WHERE projectKey = ${input.projectKey};`,
    )

    return await getProjectOrder({ projectKey: input.projectKey }, ctx)
  } catch (e) {
    return new Error('Unable to set order of projects')
  }
}

export const createProjectOrder = (
  input: {
    projectKey: string
  },
  ctx,
) => {
  return ctx.db
    .run(
      `INSERT INTO ProjectOrder (projectKey, sortOrder) VALUES (${input.projectKey},(SELECT MAX(sortOrder) + 1 from ProjectOrder)) `,
    )
    .then((result) => {
      return result.changes
        ? getProjectOrder({ projectKey: input.projectKey }, ctx)
        : new Error('Unable to create project order')
    })
}

export const migrateProjectOrder = (
  input: {
    projectKey: string
    sortOrder: number
  },
  ctx,
) => {
  console.log(
    `REPLACE INTO ProjectOrder (projectKey, sortOrder) VALUES ('${input.projectKey}', ${input.sortOrder})`,
  )
  return ctx.db
    .run(
      `REPLACE INTO ProjectOrder (projectKey, sortOrder) VALUES ('${input.projectKey}', ${input.sortOrder})`,
    )
    .then((result) => {
      return result.changes
        ? getProjectOrder({ projectKey: input.projectKey }, ctx)
        : new Error('Unable to create project order')
    })
}
