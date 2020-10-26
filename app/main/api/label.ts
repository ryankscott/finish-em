import Label from '../classes/label'
import CSS from 'csstype'

export const getLabels = (obj, ctx) => {
  return ctx.db.all('SELECT key, name, colour FROM label').then((result) => {
    return result.map((r) => new Label(r.key, r.name, r.colour))
  })
}

// TODO: Not sure why this is an object for key
export const getLabel = (input: { key: string }, ctx) => {
  console.log(input)
  return ctx.db
    .get('SELECT key, name, colour FROM label WHERE key = $key', {
      $key: input.key,
    })
    .then((result) => {
      return new Label(result.key, result.name, result.colour)
    })
}

export const createLabel = (
  input: { key: string; name: string; colour: CSS.Property.Color },
  ctx,
) => {
  return ctx.db
    .run(
      'INSERT INTO label(key, name, colour ) VALUES (?, ?, ?)',
      input.key,
      input.name,
      input.colour,
    )
    .then((result) => {
      return result.changes
        ? getLabel({ key: input.key }, ctx)
        : new Error('Unable to create label')
    })
}

export const renameLabel = (label: { key: string; name: string }, ctx) => {
  return ctx.db
    .run(`UPDATE label SET name = $name WHERE key = $key`, {
      $key: label.key,
      $name: label.name,
    })
    .then((result) => {
      return result.changes
        ? getLabel({ key: label.key }, ctx)
        : new Error('Unable to rename label')
    })
}

export const recolourLabel = (label: { key: string; colour: CSS.Property.Color }, ctx) => {
  return ctx.db
    .run('UPDATE label SET colour = $colour WHERE key = $key', {
      $key: label.key,
      $colour: label.colour,
    })
    .then((result) => {
      return result.changes
        ? getLabel({ key: label.key }, ctx)
        : new Error('Unable to recolour label')
    })
}

export const deleteLabel = (input: { key: string }, ctx) => {
  return ctx.db.run('DELETE FROM label WHERE key = $key', { $key: input.key }).then((result) => {
    return result.changes ? input.key : new Error(`Unable to delete label with key ${input.key}`)
  })
}
