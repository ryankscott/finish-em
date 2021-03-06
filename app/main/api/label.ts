import Label from '../classes/label'
import CSS from 'csstype'
import SqlString from 'sqlstring-sqlite'

export const getLabels = (obj, ctx) => {
  return ctx.db.all('SELECT key, name, colour FROM label').then((result) => {
    return result.map((r) => new Label(r.key, r.name, r.colour))
  })
}

export const getLabel = (input: { key: string }, ctx) => {
  return ctx.db
    .get(`SELECT key, name, colour FROM label WHERE key = '${input.key}'`)
    .then((result) => {
      return result ? new Label(result.key, result.name, result.colour) : null
    })
}

export const createLabel = (
  input: { key: string; name: string; colour: CSS.Property.Color },
  ctx,
) => {
  return ctx.db
    .run(
      `INSERT INTO label(key, name, colour ) VALUES ('${input.key}', ${SqlString.escape(
        input.name,
      )}, '${input.colour}')`,
    )
    .then((result) => {
      return result.changes
        ? getLabel({ key: input.key }, ctx)
        : new Error('Unable to create label')
    })
}

export const renameLabel = (input: { key: string; name: string }, ctx) => {
  return ctx.db
    .run(`UPDATE label SET name = ${SqlString.escape(input.name)} WHERE key = '${input.key}'`)
    .then((result) => {
      return result.changes
        ? getLabel({ key: input.key }, ctx)
        : new Error('Unable to rename label')
    })
}

export const setColourOfLabel = (input: { key: string; colour: CSS.Property.Color }, ctx) => {
  return ctx.db
    .run(`UPDATE label SET colour = '${input.colour}' WHERE key = '${input.key}'`)
    .then((result) => {
      return result.changes
        ? getLabel({ key: input.key }, ctx)
        : new Error('Unable to recolour label')
    })
}

export const deleteLabel = (input: { key: string }, ctx) => {
  return ctx.db.run(`DELETE FROM label WHERE key = '${input.key}'`).then((result) => {
    return result.changes ? input.key : new Error(`Unable to delete label with key ${input.key}`)
  })
}

export const labelRootValues = {
  labels: (obj, ctx) => {
    return getLabels(obj, ctx)
  },
  label: (key, ctx) => {
    return getLabel(key, ctx)
  },
  createLabel: ({ input }, ctx) => {
    return createLabel(input, ctx)
  },
  renameLabel: ({ input }, ctx) => {
    return renameLabel(input, ctx)
  },
  setColourOfLabel: ({ input }, ctx) => {
    return setColourOfLabel(input, ctx)
  },
  deleteLabel: ({ input }, ctx) => {
    return deleteLabel(input, ctx)
  },
}
