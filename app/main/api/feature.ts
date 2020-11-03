import Feature from '../classes/feature'

export const getFeatures = (obj, ctx) => {
  return ctx.db
    .all('SELECT key, name, enabled FROM feature')
    .then((result) => result.map((r) => new Feature(r.key, r.name, r.enabled)))
}

export const getFeature = (input: { key: string }, ctx) => {
  return ctx.db
    .get(`SELECT key, name, enabled FROM feature WHERE key = '${input.key}'`)
    .then((result) => {
      return new Feature(result.key, result.name, result.enabled)
    })
}

export const setFeature = (input: { key: string; enabled: boolean }, ctx) => {
  return ctx.db
    .run(`UPDATE feature SET enabled = ${input.enabled} WHERE key = '${input.key}'`)
    .then((result) => {
      return result.changes
        ? getFeature({ key: input.key }, ctx)
        : new Error('Unable to create feature')
    })
}

export const createFeature = (input: { key: string; name: string; enabled: boolean }, ctx) => {
  return ctx.db
    .run(
      'INSERT INTO feature (key, name, enabled) VALUES (${input.key}, ${input.name}, ${input.enabled})',
    )
    .then((result) => {
      return result.changes
        ? getFeature({ key: input.key }, ctx)
        : new Error('Unable to create feature')
    })
}
