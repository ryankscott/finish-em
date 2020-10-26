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
      'SELECT key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey FROM project WHERE areakey = $areaKey',
      { $areaKey: input.areaKey },
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

//TODO: Not sure why this is an object for key
export const getProject = (input: { key: string }, ctx) => {
  return ctx.db
    .get(
      'SELECT key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey FROM project WHERE key = $key',
      { $key: input.key },
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

export const createProject = (
  input: {
    key: string
    name: string
    deleted: boolean
    description: string
    lastUpdatedAt: string
    deletedAt: string
    createdAt: string
    startAt: string
    endAt: string
    areaKey: string
  },
  ctx,
) => {
  return ctx.db
    .run(
      'INSERT INTO project (key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      input.key,
      input.name,
      input.deleted,
      input.description,
      input.lastUpdatedAt,
      input.deletedAt,
      input.createdAt,
      input.startAt,
      input.endAt,
      input.areaKey,
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
      `UPDATE project SET deleted = true, lastUpdatedAt = current_timestamp, deletedAt = current_timestamp WHERE key = $key`,
      {
        $key: input.key,
      },
    )
    .then((result) => {
      return result.changes
        ? getProject({ key: input.key }, ctx)
        : new Error('Unable to rename project')
    })
}

export const renameProject = (input: { key: string; name: string }, ctx) => {
  return ctx.db
    .run(`UPDATE project SET name = $name, lastUpdatedAt = current_timestamp WHERE key = $key`, {
      $key: input.key,
      $name: input.name,
    })
    .then((result) => {
      return result.changes
        ? getProject({ key: input.key }, ctx)
        : new Error('Unable to rename project')
    })
}

export const changeDescriptionProject = (input: { key: string; description: string }, ctx) => {
  return ctx.db
    .run(
      `UPDATE project SET description = $description, lastUpdatedAt = current_timestamp WHERE key = $key`,
      {
        $key: input.key,
        $description: input.description,
      },
    )
    .then((result) => {
      return result.changes
        ? getProject({ key: input.key }, ctx)
        : new Error('Unable to change description of project')
    })
}

export const setEndDateOfProject = (input: { key: string; endAt: string }, ctx) => {
  return ctx.db
    .run(`UPDATE project SET endAt = $endAt, lastUpdatedAt = current_timestamp WHERE key = $key`, {
      $key: input.key,
      $endAt: input.endAt,
    })
    .then((result) => {
      return result.changes
        ? getProject({ key: input.key }, ctx)
        : new Error('Unable to set end date of project')
    })
}

export const setStartDateOfProject = (input: { key: string; startAt: string }, ctx) => {
  return ctx.db
    .run(
      `UPDATE project SET startAt = $startAt, lastUpdatedAt = current_timestamp WHERE key = $key`,
      {
        $key: input.key,
        $startAt: input.startAt,
      },
    )
    .then((result) => {
      return result.changes
        ? getProject({ key: input.key }, ctx)
        : new Error('Unable to set start date of project')
    })
}
