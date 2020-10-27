import AreaOrder from '../classes/areaOrder'

export const getAreaOrders = (obj, ctx) => {
  return ctx.db
    .all('SELECT areaKey, sortOrder FROM areaOrder')
    .then((result) => result.map((r) => new AreaOrder(r.areaKey, r.sortOrder)))
}

export const getAreaOrder = (input: { areaKey: string }, ctx) => {
  return ctx.db
    .get(`SELECT areaKey, sortOrder FROM areaOrder WHERE areaKey = ${input.areaKey}`)
    .then((result) => new AreaOrder(result.areaKey, result.sortOrder))
}

export const setAreaOrder = (input: { areaKey: string; newOrder: number }, ctx) => {
  return ctx.db
    .run(
      `UPDATE areaOrder SET sortOrder = sortOrder+1 WHERE sortOrder >= ${input.newOrder} AND sortOrder < (SELECT sortOrder FROM areaOrder WHERE areaKey = ${input.areaKey});
       UPDATE areaOrder SET sortOrder = ${input.newOrder} WHERE areaKey = ${input.areaKey};
    `,
    )
    .then((result) =>
      result.changes
        ? getAreaOrder({ areaKey: input.areaKey }, ctx)
        : new Error('Unable to set order of areas'),
    )
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

// update MyTable
//    Set ListOrder=ListOrder+1
//        where ListOrder>=1 -- The New position
//            and ListOrder <(Select ListOrder from MyTable where BookMark='f')

// update MyTable
//     Set ListOrder=1 -- The New Position
//         Where Bookmark='f'
