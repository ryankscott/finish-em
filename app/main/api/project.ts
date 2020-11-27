import Project from '../classes/project'
import { createProjectOrder } from './projectOrder'

export const createGetProjectsQuery = (input: { deleted: boolean }) => {
  const deletedText = input.deleted != undefined ? `AND deleted = ${input.deleted}` : ''
  return `
SELECT key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey
FROM project
WHERE 1 = 1
${deletedText}
;`
}

export const getProjects = (input: { deleted: boolean }, ctx) => {
  return ctx.db.all(createGetProjectsQuery(input)).then((result) => {
    return result.map((r) => {
      return new Project(
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
      )
    })
  })
}

export const getProjectsByArea = (input: { areaKey: string }, ctx) => {
  return ctx.db
    .all(
      `
SELECT key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey FROM project
WHERE areaKey = '${input.areaKey}'
AND deleted = false`,
    )
    .then((result) =>
      result.map((r) =>
        r
          ? new Project(
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
            )
          : null,
      ),
    )
}

export const getProject = (input: { key: string }, ctx) => {
  return ctx.db
    .get(
      `SELECT key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey FROM project WHERE key = '${input.key}'`,
    )
    .then((result) => {
      return result
        ? new Project(
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
          )
        : null
    })
}

export const getProjectByName = (input: { name: string }, ctx) => {
  return ctx.db
    .get(
      `SELECT key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey FROM project WHERE name = '${input.name}'`,
    )
    .then((result) => {
      return result
        ? new Project(
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
          )
        : null
    })
}

export const createMigrateProjectQuery = (input: {
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
}) => {
  const lastUpdatedText = input.lastUpdatedAt ? input.lastUpdatedAt.toISOString() : ''
  const deletedText = input.deletedAt ? input.deletedAt.toISOString() : ''
  const createdText = input.createdAt ? input.createdAt.toISOString() : ''
  const startText = input.startAt ? input.startAt.toISOString() : ''
  const endText = input.endAt ? input.endAt.toISOString() : ''
  return `
REPLACE INTO project (key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey)
VALUES ('${input.key}', '${input.name}', ${input.deleted}, '${input.description}', '${lastUpdatedText}', '${deletedText}', '${createdText}', '${startText}', '${endText}', '${input.areaKey}')
`
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
  return ctx.db.run(createMigrateProjectQuery(input)).then((result) => {
    return result.changes
      ? getProject({ key: input.key }, ctx)
      : new Error('Unable to migrate project')
  })
}

export const createCreateProjectQuery = (input: {
  key: string
  name: string
  description: string
  startAt: string
  endAt: string
  areaKey: string
}) => {
  return `INSERT INTO project (key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey) VALUES ('${input.key}', '${input.name}', false, '${input.description}', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), ${input.startAt}, ${input.endAt}, '${input.areaKey}')`
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
  return ctx.db.run(createCreateProjectQuery(input)).then((result) => {
    if (result.changes) {
      createProjectOrder({ projectKey: input.key }, ctx)
      return getProject({ key: input.key }, ctx)
    }
    return new Error('Unable to create project')
  })
}

export const createDeleteProjectQuery = (input: { key: string }) => {
  return `UPDATE project SET deleted = true, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), deletedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'`
}
export const deleteProject = (input: { key: string; name: string }, ctx) => {
  return ctx.db.run(createDeleteProjectQuery(input)).then((result) => {
    return result.changes
      ? getProject({ key: input.key }, ctx)
      : new Error('Unable to delete project')
  })
}

export const createRenameProjectQuery = (input: { key: string; name: string }) => {
  return `UPDATE project SET name = '${input.name}', lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'`
}
export const renameProject = (input: { key: string; name: string }, ctx) => {
  return ctx.db.run(createRenameProjectQuery(input)).then((result) => {
    return result.changes
      ? getProject({ key: input.key }, ctx)
      : new Error('Unable to rename project')
  })
}

export const createChangeDescriptionQuery = (input: { key: string; description: string }) => {
  return `UPDATE project SET description = '${input.description}', lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'`
}
export const changeDescriptionProject = (input: { key: string; description: string }, ctx) => {
  return ctx.db.run(createChangeDescriptionQuery(input)).then((result) => {
    return result.changes
      ? getProject({ key: input.key }, ctx)
      : new Error('Unable to change description of project')
  })
}

export const createSetEndDateOfProject = (input: { key: string; endAt: string }) => {
  return `UPDATE project SET endAt = '${input.endAt}', lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'`
}
export const setEndDateOfProject = (input: { key: string; endAt: string }, ctx) => {
  return ctx.db.run(createSetEndDateOfProject(input)).then((result) => {
    return result.changes
      ? getProject({ key: input.key }, ctx)
      : new Error('Unable to set end date of project')
  })
}

export const createSetStartDateOfProject = (input: { key: string; startAt: string }) => {
  return `UPDATE project SET startAt = '${input.startAt}', lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'`
}
export const setStartDateOfProject = (input: { key: string; startAt: string }, ctx) => {
  return ctx.db.run(createSetStartDateOfProject(input)).then((result) => {
    return result.changes
      ? getProject({ key: input.key }, ctx)
      : new Error('Unable to set start date of project')
  })
}

export const createSetAreaOfProject = (input: { key: string; areaKey: string }) => {
  return `UPDATE project SET areaKey = ${input.areaKey}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'`
}
export const setAreaOfProject = (input: { key: string; areaKey: string }, ctx) => {
  return ctx.db.run(createSetAreaOfProject(input)).then((result) => {
    return result.changes
      ? getProject({ key: input.key }, ctx)
      : new Error('Unable to set area of project')
  })
}

export const projectRootValues = {
  projects: ({ input }, ctx) => {
    return getProjects(input, ctx)
  },
  projectsByArea: ({ input }, ctx) => {
    return getProjectsByArea(input, ctx)
  },
  project: (key, ctx) => {
    return getProject(key, ctx)
  },
  createProject: ({ input }, ctx) => {
    return createProject(input, ctx)
  },
  migrateProject: ({ input }, ctx) => {
    return migrateProject(input, ctx)
  },
  deleteProject: ({ input }, ctx) => {
    return deleteProject(input, ctx)
  },
  renameProject: ({ input }, ctx) => {
    return renameProject(input, ctx)
  },
  changeDescriptionProject: ({ input }, ctx) => {
    return changeDescriptionProject(input, ctx)
  },
  setStartDateOfProject: ({ input }, ctx) => {
    return setStartDateOfProject(input, ctx)
  },
  setEndDateOfProject: ({ input }, ctx) => {
    return setEndDateOfProject(input, ctx)
  },
  setAreaOfProject: ({ input }, ctx) => {
    return setAreaOfProject(input, ctx)
  },
}
