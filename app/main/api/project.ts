import Project from '../classes/project'

export const getProjects = (obj, ctx) => {
  return ctx.db
    .all(
      'SELECT key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey FROM project',
    )
    .then((result) =>
      result.map(
        (r) =>
          new Project(
            r.key,
            r.name,
            r.deleted,
            r.description,
            r.lastUpdatedAt,
            r.deletedAt,
            r.createdAt,
            r.startAt,
            r.endAt,
            r.areaKey,
          ),
      ),
    )
}

export const getProjectsByArea = (input: { areaKey: string }, ctx) => {
  console.log(input)
  return ctx.db
    .all(
      `SELECT key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey FROM project WHERE areakey = '${input.areaKey}'`,
    )
    .then((result) =>
      result.map(
        (r) =>
          new Project(
            r.key,
            r.name,
            r.deleted,
            r.description,
            r.lastUpdatedAt,
            r.deletedAt,
            r.createdAt,
            r.startAt,
            r.endAt,
            r.areaKey,
          ),
      ),
    )
}

export const getProject = (input: { key: string }, ctx) => {
  return ctx.db
    .get(
      `SELECT key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey FROM project WHERE key = '${input.key}'`,
    )
    .then(
      (result) =>
        new Project(
          result.key,
          result.name,
          result.deleted,
          result.description,
          result.lastUpdatedAt,
          result.deletedAt,
          result.createdAt,
          result.startAt,
          result.endAt,
          result.areaKey,
        ),
    )
}

export const migrateProject = (
  input: {
    key: string
    name: string
    deleted: boolean
    description: string
    lastUpdatedAt: Date
    deletedAt: Date
    createdAt: Date
    startAt: Date
    endAt: Date
    areaKey: string
  },
  ctx,
) => {
  const lastUpdatedText = input.lastUpdatedAt ? input.lastUpdatedAt.toISOString() : ''
  const deletedText = input.deletedAt ? input.deletedAt.toISOString() : ''
  const createdText = input.createdAt ? input.createdAt.toISOString() : ''
  const startText = input.startAt ? input.startAt.toISOString() : ''
  const endText = input.endAt ? input.endAt.toISOString() : ''
  return ctx.db
    .run(
      `REPLACE INTO project (key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey)
       VALUES ('${input.key}', '${input.name}', ${input.deleted}, '${input.description}', '${lastUpdatedText}', '${deletedText}', '${createdText}', '${startText}', '${endText}', '${input.areaKey}'
)`,
    )
    .then((result) => {
      return result.changes
        ? getProject({ key: input.key }, ctx)
        : new Error('Unable to migrate project')
    })
}

export const createProject = (
  input: {
    key: string
    name: string
    description: string
    startAt: string
    endAt: string
    areaKey: string
  },
  ctx,
) => {
  console.log(
    `INSERT INTO project (key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey) VALUES ('${input.key}', '${input.name}', false, '${input.description}', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), ${input.startAt}, ${input.endAt}, '${input.areaKey}')`,
  )
  return ctx.db
    .run(
      `INSERT INTO project (key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey) VALUES ('${input.key}', '${input.name}', false, '${input.description}', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), ${input.startAt}, ${input.endAt}, '${input.areaKey}')`,
    )
    .then((result) => {
      return result.changes
        ? getProject({ key: input.key }, ctx)
        : new Error('Unable to create project')
    })
}

export const deleteProject = (input: { key: string; name: string }, ctx) => {
  return ctx.db
    .run(
      `UPDATE project SET deleted = true, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), deletedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'`,
    )
    .then((result) => {
      return result.changes
        ? getProject({ key: input.key }, ctx)
        : new Error('Unable to rename project')
    })
}

export const renameProject = (input: { key: string; name: string }, ctx) => {
  return ctx.db
    .run(
      `UPDATE project SET name = '${input.name}', lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'`,
    )
    .then((result) => {
      return result.changes
        ? getProject({ key: input.key }, ctx)
        : new Error('Unable to rename project')
    })
}

export const changeDescriptionProject = (input: { key: string; description: string }, ctx) => {
  return ctx.db
    .run(
      `UPDATE project SET description = '${input.description}', lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'`,
    )
    .then((result) => {
      return result.changes
        ? getProject({ key: input.key }, ctx)
        : new Error('Unable to change description of project')
    })
}

export const setEndDateOfProject = (input: { key: string; endAt: string }, ctx) => {
  return ctx.db
    .run(
      `UPDATE project SET endAt = ${input.endAt}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'`,
    )
    .then((result) => {
      return result.changes
        ? getProject({ key: input.key }, ctx)
        : new Error('Unable to set end date of project')
    })
}

export const setStartDateOfProject = (input: { key: string; startAt: string }, ctx) => {
  return ctx.db
    .run(
      `UPDATE project SET startAt = ${input.startAt}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'`,
    )
    .then((result) => {
      return result.changes
        ? getProject({ key: input.key }, ctx)
        : new Error('Unable to set start date of project')
    })
}

export const setAreaOfProject = (input: { key: string; areaKey: string }, ctx) => {
  return ctx.db
    .run(
      `UPDATE project SET areaKey = ${input.areaKey}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'`,
    )
    .then((result) => {
      return result.changes
        ? getProject({ key: input.key }, ctx)
        : new Error('Unable to set area of project')
    })
}
