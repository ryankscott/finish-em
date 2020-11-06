import Item from '../classes/item'
import { v4 as uuidv4 } from 'uuid'

export const getItems = (obj, ctx) => {
  return ctx.db
    .all(
      'SELECT key, type, text, deleted, completed, parentKey, projectKey, dueAt, scheduledAt, lastUpdatedAt, completedAt, createdAt, deletedAt, repeat, labelKey, areaKey FROM item',
    )
    .then((result) =>
      result.map(
        (r) =>
          new Item(
            r.key,
            r.type,
            r.text,
            r.deleted,
            r.completed,
            r.parentKey,
            r.projectKey,
            r.dueAt,
            r.scheduledAt,
            r.lastUpdatedAt,
            r.completedAt,
            r.createdAt,
            r.deletedAt,
            r.repeat,
            r.labelKey,
            r.areaKey,
          ),
      ),
    )
}

export const getItem = (input: { key: string }, ctx) => {
  return ctx.db
    .get(
      `SELECT key, type, text, deleted, completed, parentKey, projectKey, dueAt, scheduledAt, lastUpdatedAt, completedAt, createdAt, deletedAt, repeat, labelKey, areaKey FROM item WHERE key = '${input.key}'`,
    )
    .then(
      (result) =>
        new Item(
          result.key,
          result.type,
          result.text,
          result.deleted,
          result.completed,
          result.parentKey,
          result.projectKey,
          result.dueAt,
          result.scheduledAt,
          result.lastUpdatedAt,
          result.completedAt,
          result.createdAt,
          result.deletedAt,
          result.repeat,
          result.labelKey,
          result.areaKey,
        ),
    )
}
export const createCreateItemQuery = (input: {
  key: string
  type: string
  text: string
  description: string
  parentKey: string
  projectKey: string
  dueAt: string
  scheduledAt: string
  repeat: string
  labelKey: string
  areaKey: string
}): string => {
  return `
INSERT INTO item (key, type, text, deleted, completed, parentKey, projectKey, dueAt, scheduledAt, lastUpdatedAt, completedAt, createdAt, deletedAt, repeat, labelKey, areaKey)
VALUES ('{$input.key}', '${input.type}', '${input.text}', false, false, '${input.parentKey}', '${input.projectKey}', '${input.dueAt}', '${input.scheduledAt}', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), '', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), '', '${input.repeat}', '${input.labelKey}', '${input.areaKey}')`
}

export const createItem = (
  input: {
    key: string
    type: string
    text: string
    description: string
    parentKey: string
    projectKey: string
    dueAt: string
    scheduledAt: string
    repeat: string
    labelKey: string
    areaKey: string
  },
  ctx,
) => {
  return ctx.db.run(createCreateItemQuery(input)).then((result) => {
    return result.changes ? getItem({ key: input.key }, ctx) : new Error('Unable to create item')
  })
}
export const createMigrateItemQuery = (input: {
  key: string
  type: string
  text: string
  deleted: boolean
  completed: boolean
  parentKey: string
  projectKey: string
  dueAt: Date
  scheduledAt: Date
  lastUpdatedAt: Date
  completedAt: Date
  createdAt: Date
  deletedAt: Date
  repeat: string
  labelKey: string
  areaKey: string
}): string => {
  const lastUpdatedText = input.lastUpdatedAt ? `'${input.lastUpdatedAt.toISOString()}'` : null
  const completedText = input.completedAt ? `'${input.completedAt.toISOString()}}'` : null
  const deletedText = input.deletedAt ? `'${input.deletedAt.toISOString()}'` : null
  const createdText = input.createdAt ? `'${input.createdAt.toISOString()}'` : null
  const scheduledText = input.scheduledAt ? `'${input.scheduledAt.toISOString()}'` : null
  const dueText = input.dueAt ? `'${input.dueAt.toISOString()}'` : null
  const repeatText = input.repeat ? `'${input.repeat}'` : null
  const labelText = input.labelKey ? `'${input.labelKey}'` : null
  const areaText = input.areaKey ? `'${input.areaKey}'` : null
  const parentText = input.parentKey ? `'${input.parentKey}'` : null
  const projectText = input.projectKey ? `'${input.projectKey}'` : null

  return `INSERT INTO item (key, type, text, deleted, completed, parentKey, projectKey, dueAt, scheduledAt, lastUpdatedAt, completedAt, createdAt, deletedAt, repeat, labelKey, areaKey)
        VALUES ('${input.key}', '${input.type}', '${input.text}', ${input.deleted}, ${input.completed}, ${parentText}, ${projectText}, ${dueText}, ${scheduledText}, ${lastUpdatedText}, ${completedText}, ${createdText}, ${deletedText}, ${repeatText}, ${labelText}, ${areaText})`
}
export const migrateItem = (
  input: {
    key: string
    type: string
    text: string
    deleted: boolean
    completed: boolean
    parentKey: string
    projectKey: string
    dueAt: Date
    scheduledAt: Date
    lastUpdatedAt: Date
    completedAt: Date
    createdAt: Date
    deletedAt: Date
    repeat: string
    labelKey: string
    areaKey: string
  },
  ctx,
) => {
  return ctx.db.run(createMigrateItemQuery(input)).then((result) => {
    return result.changes ? getItem({ key: input.key }, ctx) : new Error('Unable to migrate item')
  })
}

export const createDeleteItemQuery = (input: { key: string; name: string }) => {
  return `
UPDATE item SET deleted = true, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), deletedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const deleteItem = (input: { key: string; name: string }, ctx) => {
  return ctx.db.run(createDeleteItemQuery(input)).then((result) => {
    return result.changes ? getItem({ key: input.key }, ctx) : new Error('Unable to delete item')
  })
}

export const createRenameItemQuery = (input: { key: string; text: string }) => {
  return `
UPDATE item SET text = ${input.text}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const renameItem = (input: { key: string; text: string }, ctx) => {
  return ctx.db.run(createRenameItemQuery(input)).then((result) => {
    return result.changes ? getItem({ key: input.key }, ctx) : new Error('Unable to rename item')
  })
}

export const createSetTypeOfItemQuery = (input: { key: string; type: string }) => {
  return `
UPDATE item SET type = ${input.type}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const setTypeOfItem = (input: { key: string; type: string }, ctx) => {
  return ctx.db.run(createSetTypeOfItemQuery(input)).then((result) => {
    return result.changes
      ? getItem({ key: input.key }, ctx)
      : new Error('Unable to set type of item')
  })
}

export const createCompleteItemQuery = (input: { key: string }) => {
  return `
UPDATE item SET completed = true, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), completedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const completeItem = (input: { key: string }, ctx) => {
  return ctx.db.run(createCompleteItemQuery(input)).then((result) => {
    return result.changes ? getItem({ key: input.key }, ctx) : new Error('Unable to complete item')
  })
}

export const createUnCompleteItemQuery = (input: { key: string }) => {
  return `
UPDATE item SET completed = false, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), completedAt = null WHERE key = '${input.key}'
`
}

export const unCompleteItem = (input: { key: string }, ctx) => {
  return ctx.db.run(createUnCompleteItemQuery(input)).then((result) => {
    return result.changes
      ? getItem({ key: input.key }, ctx)
      : new Error('Unable to uncomplete item')
  })
}

export const createSetRepeatOfItemQuery = (input: { key: string; repeat: string }) => {
  return `
UPDATE item SET repeat = ${input.repeat}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const setRepeatOfItem = (input: { key: string; repeat: string }, ctx) => {
  return ctx.db.run(createSetRepeatOfItemQuery(input)).then((result) => {
    return result.changes
      ? getItem({ key: input.key }, ctx)
      : new Error('Unable to set repeat of item')
  })
}

export const createCloneItemQuery = (input: { key: string }) => {
  return `
INSERT INTO item (SELECT ${uuidv4()}, type, text, deleted, completed, parentKey, projectKey, dueAt, scheduledAt, lastUpdatedAt, completedAt, createdAt, deletedAt, repeat, labelKey, areaKey FROM item WHERE key = '${
    input.key
  }'
`
}

export const cloneItem = (input: { key: string }, ctx) => {
  return ctx.db.run(createCloneItemQuery(input)).then((result) => {
    return result.changes ? getItem({ key: input.key }, ctx) : new Error('Unable to clone item')
  })
}

export const createSetProjectOfItemQuery = (input: { key: string; projectKey: string }) => {
  return `
UPDATE item SET projectKey = ${input.projectKey}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const setProjectOfItem = (input: { key: string; projectKey: string }, ctx) => {
  return ctx.db.run(createSetProjectOfItemQuery(input)).then((result) => {
    return result.changes
      ? getItem({ key: input.key }, ctx)
      : new Error('Unable to set project to item')
  })
}

export const createSetScheduledDateOfItem = (input: { key: string; scheduledAt: string }) => {
  return `
UPDATE item SET scheduledAt = ${input.scheduledAt}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const setScheduledDateOfItem = (input: { key: string; scheduledAt: string }, ctx) => {
  return ctx.db.run(createSetScheduledDateOfItem(input)).then((result) => {
    return result.changes
      ? getItem({ key: input.key }, ctx)
      : new Error('Unable to set scheduled date of item')
  })
}

export const createSetDueDateOfItem = (input: { key: string; dueAt: string }) => {
  return `
UPDATE item SET dueAt = ${input.dueAt}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const setDueDateOfItem = (input: { key: string; dueAt: string }, ctx) => {
  return ctx.db.run(createSetDueDateOfItem(input)).then((result) => {
    return result.changes
      ? getItem({ key: input.key }, ctx)
      : new Error('Unable to set due date of item')
  })
}

export const createSetParentOfItemQuery = (input: { key: string; parentKey: string }) => {
  return `
      UPDATE item SET parentKey = ${input.parentKey}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const setParentOfItem = (input: { key: string; parentKey: string }, ctx) => {
  return ctx.db.run(createSetParentOfItemQuery(input)).then((result) => {
    return result.changes
      ? getItem({ key: input.key }, ctx)
      : new Error('Unable to set parent of item')
  })
}

export const createPermanentDeleteQuery = (input: { key: string }) => {
  return `
DELETE FROM item WHERE key = '${input.key}'
`
}

export const permanentDeleteItem = (input: { key: string }, ctx) => {
  return ctx.db.run(createPermanentDeleteQuery(input)).then((result) => {
    return result.changes ? input.key : new Error(`Unable to delete item with key ${input.key}`)
  })
}

export const createSetLabelOfItemQuery = (input: { key: string; labelKey: string }) => {
  return `
UPDATE item SET labelKey = ${input.labelKey}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}
export const setLabelOfItem = (input: { key: string; labelKey: string }, ctx) => {
  return ctx.db.run(createSetLabelOfItemQuery(input)).then((result) => {
    return result.canges
      ? getItem({ key: input.key }, ctx)
      : new Error('Unable to set label of item')
  })
}

/*   Root Values     */
export const itemRootValues = {
  items: (obj, ctx) => {
    return getItems(obj, ctx)
  },
  item: (key, ctx) => {
    return getItem(key, ctx)
  },
  createItem: ({ input }, ctx) => {
    return createItem(input, ctx)
  },
  deleteItem: ({ input }, ctx) => {
    return deleteItem(input, ctx)
  },
  renameItem: ({ input }, ctx) => {
    return renameItem(input, ctx)
  },
  setTypeOfItem: ({ input }, ctx) => {
    return setTypeOfItem(input, ctx)
  },
  completeItem: ({ input }, ctx) => {
    return completeItem(input, ctx)
  },
  uncompleteItem: ({ input }, ctx) => {
    return unCompleteItem(input, ctx)
  },
  setRepeatOfItem: ({ input }, ctx) => {
    return setRepeatOfItem(input, ctx)
  },
  cloneItem: ({ input }, ctx) => {
    return cloneItem(input, ctx)
  },
  setProjectOfItem: ({ input }, ctx) => {
    return setProjectOfItem(input, ctx)
  },
  setScheduledDateOfItem: ({ input }, ctx) => {
    return setScheduledDateOfItem(input, ctx)
  },
  setDueDateOfItem: ({ input }, ctx) => {
    return setDueDateOfItem(input, ctx)
  },
  setParentOfItem: ({ input }, ctx) => {
    return setParentOfItem(input, ctx)
  },
  permanentDeleteItem: ({ input }, ctx) => {
    return permanentDeleteItem(input, ctx)
  },
  setLabelOfItem: ({ input }, ctx) => {
    return setLabelOfItem(input, ctx)
  },
  migrateItem: ({ input }, ctx) => {
    return migrateItem(input, ctx)
  },
}
