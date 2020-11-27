import Item from '../classes/item'
import { v4 as uuidv4 } from 'uuid'
import SqlString from 'sqlstring-sqlite'
import Expression from '../../renderer/components/filter-box/Expression'
import { createItemOrder } from './itemOrder'

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
export const getFilteredItems = async (input: { filter: string }, ctx) => {
  // Parse string into object
  const parseFilters = (filter: string): { text: string; value: Expression[] } => {
    // Return an empty object
    if (!filter) return { text: '', value: [] }
    try {
      return JSON.parse(filter)
    } catch (e) {
      console.log(e)
      return { text: '', value: [] }
    }
  }

  const generateQueryString = (exps: Expression[]): string => {
    const transformExpressionToString = (
      conditionType: string,
      category: string,
      operator: string,
      value: string,
    ) => {
      // TODO handle brackets

      const conditionText = conditionType ? conditionType : 'WHERE'
      const valueResolver = (value: string) => {
        switch (value) {
          case 'true':
            return 'true'

          case 'false':
            return 'false'

          default:
            return `'${value}'`
        }
      }
      const valueText = valueResolver(value)
      const categoryText = category

      switch (operator) {
        case '!is':
          if (value == 'null') return `${conditionText} ${categoryText} IS NOT null`
          if (value == 'this week')
            return `${conditionText} strftime('%W', ${categoryText}) != strftime('%W',date());`
          if (value == 'this month')
            return `${conditionText} strftime('%m', ${categoryText}) != strftime('%m',date());`
          if (value == 'today') return `${conditionText} DATE(${categoryText}) != DATE(date())`
          if (value == 'past') return `${conditionText} ${categoryText} >= date()`
          break

        case 'is':
          if (value == 'null') return `${conditionText} ${categoryText} IS  null`
          if (value == 'this week')
            return `${conditionText} strftime('%W', ${categoryText}) = strftime('%W',date());`
          if (value == 'this month')
            return `${conditionText} strftime('%m', ${categoryText}) = strftime('%m',date());`
          if (value == 'today') return `${conditionText} DATE(${categoryText}) = DATE(date())`
          if (value == 'past') return `${conditionText} ${categoryText} < date()`
          break

        default:
          return `${conditionText} ${categoryText} ${operator} ${valueText}`
      }
    }

    const filterTextArray = exps.map((f: Expression) => {
      if (f.expressions) {
        return f.expressions.map(async (fs, idx) => {
          const prefix = idx == 0 ? '' : fs.conditionType
          const filterString = transformExpressionToString(
            f.conditionType,
            fs.category,
            fs.operator,
            fs.value,
          )
          return prefix + filterString
        })
      } else {
        return f
          ? transformExpressionToString(f.conditionType, f.category, f.operator, f.value)
          : ''
      }
    })
    return filterTextArray.flat().join('\n')
  }

  const filters = parseFilters(input.filter)
  const filterString = generateQueryString(filters.value)

  const queryString = `SELECT key, type, text, deleted, completed, parentKey, projectKey, dueAt, scheduledAt, lastUpdatedAt, completedAt, createdAt, deletedAt, repeat, labelKey, areaKey FROM item
  ${filterString}`

  return ctx.db
    .all(queryString)
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
    .then((result) => {
      return result
        ? new Item(
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
          )
        : null
    })
}

export const getItemsByProject = (input: { projectKey: string }, ctx) => {
  return ctx.db
    .all(
      `SELECT key, type, text, deleted, completed, parentKey, projectKey, dueAt, scheduledAt, lastUpdatedAt, completedAt, createdAt, deletedAt, repeat, labelKey, areaKey FROM item WHERE projectKey = '${input.projectKey}'`,
    )
    .then((result) => {
      return result
        ? result.map(
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
          )
        : null
    })
}

export const getItemsByParent = (input: { parentKey: string }, ctx) => {
  return ctx.db
    .all(
      `SELECT key, type, text, deleted, completed, parentKey, projectKey, dueAt, scheduledAt, lastUpdatedAt, completedAt, createdAt, deletedAt, repeat, labelKey, areaKey FROM item WHERE parentKey = '${input.parentKey}'`,
    )
    .then((result) => {
      return result
        ? result.map(
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
          )
        : null
    })
}

export const getItemsByArea = (input: { areaKey: string }, ctx) => {
  return ctx.db
    .all(
      `SELECT key, type, text, deleted, completed, parentKey, projectKey, dueAt, scheduledAt, lastUpdatedAt, completedAt, createdAt, deletedAt, repeat, labelKey, areaKey FROM item WHERE areaKey = '${input.areaKey}' and deleted = false`,
    )
    .then((result) => {
      return result
        ? result.map(
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
          )
        : null
    })
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
  const scheduledText = input.scheduledAt ? `'${input.scheduledAt}'` : null
  const dueText = input.dueAt ? `'${input.dueAt}'` : null
  const repeatText = input.repeat ? `'${input.repeat}'` : null
  const labelText = input.labelKey ? `'${input.labelKey}'` : null
  const areaText = input.areaKey ? `'${input.areaKey}'` : null
  const parentText = input.parentKey ? `'${input.parentKey}'` : null
  const projectText = input.projectKey ? `'${input.projectKey}'` : '0'
  return `
INSERT INTO item (key, type, text, deleted, completed, parentKey, projectKey, dueAt, scheduledAt, lastUpdatedAt, completedAt, createdAt, deletedAt, repeat, labelKey, areaKey)
VALUES ('${input.key}', '${input.type}', ${SqlString.escape(
    input.text,
  )}, false, false, ${parentText}, ${projectText} , ${dueText}, ${scheduledText}, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), '', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), '', ${repeatText}, ${labelText}, ${areaText})`
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
    if (result.changes) {
      createItemOrder({ itemKey: input.key }, ctx)
      return getItem({ key: input.key }, ctx)
    }
    return new Error('Unable to create item')
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
  const completedText = input.completedAt ? `'${input.completedAt.toISOString()}'` : null
  const deletedText = input.deletedAt ? `'${input.deletedAt.toISOString()}'` : null
  const createdText = input.createdAt ? `'${input.createdAt.toISOString()}'` : null
  const scheduledText = input.scheduledAt ? `'${input.scheduledAt.toISOString()}'` : null
  const dueText = input.dueAt ? `'${input.dueAt.toISOString()}'` : null
  const repeatText = input.repeat ? `'${input.repeat}'` : null
  const labelText = input.labelKey ? `'${input.labelKey}'` : null
  const areaText = input.areaKey ? `'${input.areaKey}'` : null
  const parentText = input.parentKey ? `'${input.parentKey}'` : null
  const projectText = input.projectKey ? `'${input.projectKey}'` : null
  return `REPLACE INTO item (key, type, text, deleted, completed, parentKey, projectKey, dueAt, scheduledAt, lastUpdatedAt, completedAt, createdAt, deletedAt, repeat, labelKey, areaKey)
        VALUES ('${input.key}', '${input.type}', ${SqlString.escape(input.text)}, ${
    input.deleted
  }, ${
    input.completed
  }, ${parentText}, ${projectText}, ${dueText}, ${scheduledText}, ${lastUpdatedText}, ${completedText}, ${createdText}, ${deletedText}, ${repeatText}, ${labelText}, ${areaText})`
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
    if (result.changes) return getItem({ key: input.key }, ctx)
    return new Error('Unable to migrate item')
  })
}

export const createDeleteItemQuery = (input: { key: string }) => {
  return `
UPDATE item SET deleted = true, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), deletedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const deleteItem = (input: { key: string }, ctx) => {
  return ctx.db.run(createDeleteItemQuery(input)).then((result) => {
    return result.changes ? getItem({ key: input.key }, ctx) : new Error('Unable to delete item')
  })
}
export const createRestoreItemQuery = (input: { key: string }) => {
  return `
UPDATE item SET deleted = false, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), deletedAt = null WHERE key = '${input.key}'
`
}

export const restoreItem = (input: { key: string }, ctx) => {
  return ctx.db.run(createRestoreItemQuery(input)).then((result) => {
    return result.changes ? getItem({ key: input.key }, ctx) : new Error('Unable to restore item')
  })
}

export const createRenameItemQuery = (input: { key: string; text: string }) => {
  return `
UPDATE item SET text = '${input.text}', lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const renameItem = (input: { key: string; text: string }, ctx) => {
  return ctx.db.run(createRenameItemQuery(input)).then((result) => {
    return result.changes ? getItem({ key: input.key }, ctx) : new Error('Unable to rename item')
  })
}

export const createSetTypeOfItemQuery = (input: { key: string; type: string }) => {
  return `
UPDATE item SET type = '${input.type}', lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
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

export const completeItem = async (input: { key: string }, ctx) => {
  const result = await ctx.db.run(createCompleteItemQuery(input))
  if (result.changes) {
    return getItem({ key: input.key }, ctx)
  }
  return new Error('Unable to complete item')
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
UPDATE item SET repeat = '${input.repeat}', lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const setRepeatOfItem = (input: { key: string; repeat: string }, ctx) => {
  return ctx.db.run(createSetRepeatOfItemQuery(input)).then((result) => {
    return result.changes
      ? getItem({ key: input.key }, ctx)
      : new Error('Unable to set repeat of item')
  })
}

export const createCloneItemQuery = (input: { key: string; newKey: string }) => {
  return `
INSERT INTO item (type, text, deleted, completed, parentKey, projectKey, dueAt, scheduledAt, lastUpdatedAt, completedAt, createdAt, deletedAt, repeat, labelKey, areaKey, key) 
SELECT type, text, deleted, completed, parentKey, projectKey, dueAt, scheduledAt, lastUpdatedAt, completedAt, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), deletedAt, repeat, labelKey, areaKey, '${input.newKey}' FROM item WHERE key = '${input.key}'
`
}

export const cloneItem = async (input: { key: string }, ctx) => {
  const newKey = uuidv4()
  const result = await ctx.db.run(createCloneItemQuery({ key: input.key, newKey: newKey }))
  if (result.changes) {
    const itemOrder = await createItemOrder({ itemKey: newKey }, ctx)
    if (itemOrder) {
      return getItem({ key: newKey }, ctx)
    }
  }
  return new Error('Unable to clone item')
}

export const createSetProjectOfItemQuery = (input: { key: string; projectKey: string }) => {
  const inputText = input.projectKey ? `'${input.projectKey}'` : null
  return `
UPDATE item SET projectKey = ${inputText}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const setProjectOfItem = (input: { key: string; projectKey: string }, ctx) => {
  return ctx.db.run(createSetProjectOfItemQuery(input)).then((result) => {
    return result.changes
      ? getItem({ key: input.key }, ctx)
      : new Error('Unable to set project of item')
  })
}

export const createSetScheduledAtOfItem = (input: { key: string; scheduledAt: Date }) => {
  return `
UPDATE item SET scheduledAt = '${input.scheduledAt.toISOString()}', lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${
    input.key
  }'
`
}

export const createSetAreaOfItemQuery = (input: { key: string; areaKey: string }) => {
  const inputText = input.areaKey ? `'${input.areaKey}'` : null
  return `
UPDATE item SET areaKey = ${inputText}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const setAreaOfItem = (input: { key: string; areaKey: string }, ctx) => {
  return ctx.db.run(createSetAreaOfItemQuery(input)).then((result) => {
    return result.changes
      ? getItem({ key: input.key }, ctx)
      : new Error('Unable to set area of item')
  })
}

export const setScheduledAtOfItem = (input: { key: string; scheduledAt: Date }, ctx) => {
  return ctx.db.run(createSetScheduledAtOfItem(input)).then((result) => {
    return result.changes
      ? getItem({ key: input.key }, ctx)
      : new Error('Unable to set scheduled date of item')
  })
}

export const createSetDueAtOfItem = (input: { key: string; dueAt: Date }) => {
  return `
UPDATE item SET dueAt = '${input.dueAt.toISOString()}', lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${
    input.key
  }'
`
}

export const setDueAtOfItem = (input: { key: string; dueAt: Date }, ctx) => {
  return ctx.db.run(createSetDueAtOfItem(input)).then((result) => {
    return result.changes
      ? getItem({ key: input.key }, ctx)
      : new Error('Unable to set due date of item')
  })
}

export const createSetParentOfItemQuery = (input: { key: string; parentKey: string }) => {
  const inputText = input.parentKey ? `'${input.parentKey}'` : null
  return `
      UPDATE item SET parentKey = ${inputText}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
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
  const inputText = input.labelKey ? `'${input.labelKey}'` : null
  return `
UPDATE item SET labelKey = ${inputText}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}
export const setLabelOfItem = (input: { key: string; labelKey: string }, ctx) => {
  return ctx.db.run(createSetLabelOfItemQuery(input)).then((result) => {
    return result.changes
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
  itemsByProject: (projectKey, ctx) => {
    return getItemsByProject(projectKey, ctx)
  },
  itemsByParent: (parentKey, ctx) => {
    return getItemsByParent(parentKey, ctx)
  },
  itemsByArea: (areaKey, ctx) => {
    return getItemsByArea(areaKey, ctx)
  },
  itemsByFilter: (filter, ctx) => {
    return getFilteredItems(filter, ctx)
  },
  createItem: ({ input }, ctx) => {
    return createItem(input, ctx)
  },
  deleteItem: ({ input }, ctx) => {
    return deleteItem(input, ctx)
  },
  restoreItem: ({ input }, ctx) => {
    return restoreItem(input, ctx)
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
  unCompleteItem: ({ input }, ctx) => {
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
  setAreaOfItem: ({ input }, ctx) => {
    return setAreaOfItem(input, ctx)
  },
  setScheduledAtOfItem: ({ input }, ctx) => {
    return setScheduledAtOfItem(input, ctx)
  },
  setDueAtOfItem: ({ input }, ctx) => {
    return setDueAtOfItem(input, ctx)
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
