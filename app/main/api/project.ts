import SQL from 'sql-template-strings'
import Project from '../classes/project'
import { getItemsByProject, setProjectOfItem } from './item'
import { createProjectOrder } from './projectOrder'
import { createView, deleteView, renameView } from './view'

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
        r.emoji,
      )
    })
  })
}

export const getProjectsByArea = (input: { areaKey: string }, ctx) => {
  return ctx.db
    .all(
      SQL`
SELECT key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey, emoji FROM project
WHERE areaKey = ${input.areaKey}
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
              r.emoji,
            )
          : null,
      ),
    )
}

export const getProject = (input: { key: string }, ctx) => {
  return ctx.db
    .get(
      SQL`SELECT key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey, emoji FROM project WHERE key = ${input.key}`,
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
            result.emoji,
          )
        : null
    })
}

export const getProjectByName = (input: { name: string }, ctx) => {
  return ctx.db
    .get(
      SQL`SELECT key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey, emoji FROM project WHERE name = ${input.name}`,
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
            result.emoji,
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
  return SQL`
REPLACE INTO project (key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey)
VALUES (${input.key}, ${input.name}, ${input.deleted}, ${input.description}, ${lastUpdatedText}, ${deletedText}, ${createdText}, ${startText}, ${endText}, ${input.areaKey})
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

export const createProject = async (
  input: {
    key: string
    name: string
    description: string
    startAt: string
    endAt: string
    areaKey: string
    emoji: string
  },
  ctx,
) => {
  const projects = await getProjects({ deleted: false }, ctx)
  const exists = projects.map((p) => p.name == input.name).includes(true)
  if (exists) {
    return new Error('Unable to create project - name already in use')
  }

  return ctx.db
    .run(
      SQL`INSERT INTO project (key, name, deleted, description, lastUpdatedAt, deletedAt, createdAt, startAt, endAt, areaKey, emoji) VALUES 
  (${input.key}, ${input.name}, false, 
  ${input.description}, 
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), null, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 
  ${input.startAt}, ${input.endAt}, ${input.areaKey}, ${input.emoji})`,
    )
    .then((result) => {
      if (result.changes) {
        createProjectOrder({ projectKey: input.key }, ctx)
        createView({ key: input.key, name: input.name, icon: '', type: 'project' }, ctx)
        return getProject({ key: input.key }, ctx)
      }
      return new Error('Unable to create project')
    })
}

export const deleteProject = async (input: { key: string; name: string }, ctx) => {
  return ctx.db
    .run(
      SQL`UPDATE project SET deleted = true, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), deletedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = ${input.key}`,
    )
    .then(async (result) => {
      if (result.changes) {
        // Remove project from all items in that project
        const items = await getItemsByProject({ projectKey: input.key }, ctx)
        items.map((i) => {
          return setProjectOfItem({ key: i.key, projectKey: '0' }, ctx)
        })

        deleteView({ key: input.key }, ctx)
        return getProject({ key: input.key }, ctx)
      }
      return new Error('Unable to delete project')
    })
}

export const renameProject = async (input: { key: string; name: string }, ctx) => {
  const projects = await getProjects({ deleted: false }, ctx)
  const exists = projects.map((p) => p.name == input.name).includes(true)
  if (exists) {
    return new Error('Unable to create project - name already in use')
  }
  return ctx.db
    .run(
      SQL`UPDATE project SET name = ${input.name}, 
  lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = ${input.key}`,
    )
    .then((result) => {
      if (result.changes) {
        renameView({ key: input.key, name: input.name }, ctx)
        return getProject({ key: input.key }, ctx)
      }
      return new Error('Unable to rename project')
    })
}

export const changeDescriptionProject = (input: { key: string; description: string }, ctx) => {
  return ctx.db
    .run(
      SQL`UPDATE project SET description = ${input.description}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = ${input.key}`,
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
      SQL`UPDATE project SET endAt = ${input.endAt}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = ${input.key}`,
    )
    .then((result) => {
      return result.changes
        ? getProject({ key: input.key }, ctx)
        : new Error('Unable to set end date of project')
    })
}

export const setEmojiOfProject = (input: { key: string; emoji: string }, ctx) => {
  return ctx.db
    .run(
      SQL`UPDATE project SET emoji = ${input.emoji}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = ${input.key}`,
    )
    .then((result) => {
      console.log(result)
      return result.changes
        ? getProject({ key: input.key }, ctx)
        : new Error('Unable to set emoji of project')
    })
}

export const setStartDateOfProject = (input: { key: string; startAt: string }, ctx) => {
  return ctx.db
    .run(
      SQL`UPDATE project SET startAt = ${input.startAt}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = ${input.key}`,
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
      SQL`UPDATE project SET areaKey = ${input.areaKey}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = ${input.key}`,
    )
    .then((result) => {
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
  setEmojiOfProject: ({ input }, ctx) => {
    return setEmojiOfProject(input, ctx)
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
