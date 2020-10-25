import Project from '../classes/project'

export const getProjects = (obj, ctx) => {
  return ctx.db
    .all(
      'SELECT key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaId FROM project',
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
            r.areaId,
          ),
      ),
    )
}

//TODO: Not sure why this is an object for key
export const getProject = (key: { key: string }, ctx) => {
  return ctx.db
    .get(
      'SELECT key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaId FROM project WHERE key = $key',
      { $key: key.key },
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
          result.areaId,
        ),
    )
}

export const createProject = (
  project: {
    key: string
    name: string
    deleted: boolean
    description: string
    lastUpdatedAt: string
    deletedAt: string
    createdAt: string
    startAt: string
    endAt: string
    areaId: string
  },
  ctx,
) => {
  return ctx.db
    .run(
      'INSERT INTO project (key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      project.key,
      project.name,
      project.deleted,
      project.description,
      project.lastUpdatedAt,
      project.deletedAt,
      project.createdAt,
      project.startAt,
      project.endAt,
      project.areaId,
    )
    .then((result) => {
      return result.changes
        ? getProject({ key: project.key }, ctx)
        : new Error('Unable to create project')
    })
}

export const deleteProject = (project: { key: string; name: string }, ctx) => {
  return ctx.db
    .run(
      `UPDATE project SET deleted = true, lastUpdatedAt = current_timestamp, deletedAt = current_timestamp WHERE key = $key`,
      {
        $key: project.key,
      },
    )
    .then((result) => {
      return result.changes
        ? getProject({ key: project.key }, ctx)
        : new Error('Unable to rename project')
    })
}

export const renameProject = (project: { key: string; name: string }, ctx) => {
  return ctx.db
    .run(`UPDATE project SET name = $name, lastUpdatedAt = current_timestamp WHERE key = $key`, {
      $key: project.key,
      $name: project.name,
    })
    .then((result) => {
      return result.changes
        ? getProject({ key: project.key }, ctx)
        : new Error('Unable to rename project')
    })
}

export const changeDescriptionProject = (project: { key: string; description: string }, ctx) => {
  return ctx.db
    .run(
      `UPDATE project SET description = $description, lastUpdatedAt = current_timestamp WHERE key = $key`,
      {
        $key: project.key,
        $description: project.description,
      },
    )
    .then((result) => {
      return result.changes
        ? getProject({ key: project.key }, ctx)
        : new Error('Unable to change description of project')
    })
}

export const setEndDateOfProject = (project: { key: string; endAt: string }, ctx) => {
  return ctx.db
    .run(`UPDATE project SET endAt = $endAt, lastUpdatedAt = current_timestamp WHERE key = $key`, {
      $key: project.key,
      $endAt: project.endAt,
    })
    .then((result) => {
      return result.changes
        ? getProject({ key: project.key }, ctx)
        : new Error('Unable to set end date of project')
    })
}

export const setStartDateOfProject = (project: { key: string; startAt: string }, ctx) => {
  return ctx.db
    .run(
      `UPDATE project SET startAt = $startAt, lastUpdatedAt = current_timestamp WHERE key = $key`,
      {
        $key: project.key,
        $startAt: project.startAt,
      },
    )
    .then((result) => {
      return result.changes
        ? getProject({ key: project.key }, ctx)
        : new Error('Unable to set start date of project')
    })
}
