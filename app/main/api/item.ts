import Item from '../classes/item'
import { v4 as uuidv4 } from 'uuid'
import SqlString from 'sqlstring-sqlite'
import Expression from '../../renderer/components/filter-box/Expression'
import { createItemOrder, deleteItemOrder, getItemOrdersByComponent } from './itemOrder'
import { Item as ItemType } from '../generated/typescript-helpers'
import { rrulestr } from 'rrule'
import { startOfDay } from 'date-fns'
import { filter, without } from 'lodash'
const log = require('electron-log')
export const getItems = (obj, ctx) => {
  log.info(`Getting all items `)
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
export const getFilteredItems = async (input: { filter: string; componentKey: string }, ctx) => {
  log.info(`Executing with filter: ${input.filter}`)
  // Parse string into object
  const parseFilters = (filter: string): { text: string; value: Expression[] } => {
    // Return an empty object
    if (!filter) return { text: '', value: [] }
    try {
      return JSON.parse(filter)
    } catch (e) {
      log.error(`Failed to parse filters - ${e}`)
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
      const conditionText = conditionType ? conditionType : ''
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
      const isDateCategory = [
        'dueAt',
        'scheduledAt',
        'completedAt',
        'lastUpdatedAt',
        'deletedAt',
        'createdAt',
      ].includes(categoryText)

      switch (operator) {
        case '=':
          if (isDateCategory) {
            return `${conditionText} DATE(${categoryText}, 'localtime') = DATE(${valueText}, 'localtime')`
          }
          return `${conditionText} ${categoryText} ${operator} ${valueText}`

        case '!=':
          if (isDateCategory) {
            return `${conditionText} DATE(${categoryText}, 'localtime') != DATE(${valueText}, 'localtime')`
          }
          return `${conditionText} ${categoryText} ${operator} ${valueText}`

        case '<':
          if (isDateCategory) {
            return `${conditionText} DATE(${categoryText}, 'localtime') < DATE('now', ${valueText}, 'localtime')`
          }
          return `${conditionText} ${categoryText} ${operator} ${valueText}`
        case '>':
          if (isDateCategory) {
            return `${conditionText} DATE(${categoryText}, 'localtime') > DATE('now', ${valueText}, 'localtime')`
          }
          return `${conditionText} ${categoryText} ${operator} ${valueText}`

        case '!is':
          if (value == 'null') return `${conditionText} ${categoryText} IS NOT null`
          if (value == 'this week')
            return `${conditionText} strftime('%W', ${categoryText}) != strftime('%W',date());`
          if (value == 'this month')
            return `${conditionText} strftime('%m', ${categoryText}) != strftime('%m',date());`
          if (value == 'today') return `${conditionText} DATE(${categoryText}) != DATE(date())`
          if (value == 'past') return `${conditionText} DATE(${categoryText}) >= DATE(date())`
          break

        case 'is':
          if (value == 'null') return `${conditionText} ${categoryText} IS null`
          if (value == 'this week')
            return `${conditionText} strftime('%W', ${categoryText}) = strftime('%W',date());`
          if (value == 'this month')
            return `${conditionText} strftime('%m', ${categoryText}) = strftime('%m',date());`
          if (value == 'today') return `${conditionText} DATE(${categoryText}) = DATE(date())`
          if (value == 'past') return `${conditionText} DATE(${categoryText}) < DATE(date())`
          break

        default:
          return `${conditionText} ${categoryText} ${operator} ${valueText}`
      }
    }

    const filterTextArray = exps.map((f: Expression, idx: number) => {
      if (f.expressions) {
        return `${f.conditionType} ( ${f.expressions
          .map((fs, idx) => {
            const filterString = transformExpressionToString(
              fs.conditionType,
              fs.category,
              fs.operator,
              fs.value,
            )
            return filterString
          })
          .join(' ')})`
      } else {
        return f
          ? transformExpressionToString(f.conditionType, f.category, f.operator, f.value)
          : ''
      }
    })
    return filterTextArray.flat().join(' ')
  }
  const filters = parseFilters(input.filter)
  const filterString = generateQueryString(filters.value)
  log.debug(filterString)
  const results = await ctx.db.all(
    `SELECT key, type, text, deleted, completed, parentKey, projectKey, dueAt, scheduledAt, lastUpdatedAt, completedAt, createdAt, deletedAt, repeat, labelKey, areaKey FROM item WHERE ${filterString}`,
  )

  if ((await results.length) >= 0) {
    // Get all itemOrders for that component
    const orders = await getItemOrdersByComponent({ componentKey: input.componentKey }, ctx)

    // Remove all ones that aren't in the filtered list
    const orderKeys = orders.map((o) => o.itemKey)
    const resultKeys = results.map((r) => r.key)

    const inOrderButNotResult = without(orderKeys, ...resultKeys)
    inOrderButNotResult.forEach(
      async (i) => await deleteItemOrder({ itemKey: i, componentKey: input.componentKey }, ctx),
    )

    // Add new ones
    const inResultButNotOrder = without(resultKeys, ...orderKeys)
    inResultButNotOrder.forEach(
      async (i) => await createItemOrder({ itemKey: i, componentKey: input.componentKey }, ctx),
    )

    return results.map(
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
  } else return null
}

export const getItem = (input: { key: string }, ctx) => {
  return ctx.db
    .get(
      `SELECT key, type, text, deleted, completed, parentKey, projectKey, dueAt, scheduledAt, lastUpdatedAt, completedAt, createdAt, deletedAt, repeat, labelKey, areaKey FROM item WHERE key = '${input.key}'`,
    )
    .then((result) => {
      if (result) {
        return new Item(
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
      }
      if (input.key != null) {
        log.error(`Failed to get item with key - ${input.key}`)
      }
      return null
    })
}

export const getItemsByProject = (input: { projectKey: string }, ctx) => {
  log.info(`Getting items for project - ${input.projectKey}`)
  return ctx.db
    .all(
      'SELECT key, type, text, deleted, completed, parentKey, projectKey, dueAt, scheduledAt, lastUpdatedAt, completedAt, createdAt, deletedAt, repeat, labelKey, areaKey FROM item WHERE projectKey = ?',
      input.projectKey,
    )
    .then((result) => {
      if (result) {
        return result.map(
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
      }
      log.error(`Failed to get items for project - ${input.projectKey} `)
      return null
    })
}

export const getItemsByParent = (input: { parentKey: string }, ctx) => {
  return ctx.db
    .all(
      'SELECT key, type, text, deleted, completed, parentKey, projectKey, dueAt, scheduledAt, lastUpdatedAt, completedAt, createdAt, deletedAt, repeat, labelKey, areaKey FROM item WHERE parentKey = ?',
      input.parentKey,
    )
    .then((result) => {
      if (result) {
        return result.map(
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
      }
      log.error(`Failed to get by parent - ${input.parentKey}`)
      return null
    })
}

export const getItemsByArea = (input: { areaKey: string }, ctx) => {
  log.info(`Getting items by area - ${input.areaKey} `)
  return ctx.db
    .all(
      'SELECT key, type, text, deleted, completed, parentKey, projectKey, dueAt, scheduledAt, lastUpdatedAt, completedAt, createdAt, deletedAt, repeat, labelKey, areaKey FROM item WHERE areaKey = ? and deleted = false',
      input.areaKey,
    )
    .then((result) => {
      if (result) {
        return result.map(
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
      }
      log.info(`Failed to get items by area - ${input.areaKey}`)
      return null
    })
}

export const createItem = async (
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
    repeat: string
    labelKey: string
    areaKey: string
  },
  ctx,
) => {
  log.info(`Creating item by key - ${input.key} `)
  const scheduledText = input.scheduledAt ? input.scheduledAt.toISOString() : null
  const dueText = input.dueAt ? input.dueAt.toISOString() : null
  const repeatText = input.repeat ? input.repeat : null
  const labelText = input.labelKey ? input.labelKey : null
  const areaText = input.areaKey ? input.areaKey : null
  const parentText = input.parentKey ? input.parentKey : null
  const projectText = input.projectKey ? input.projectKey : '0'

  // TODO refactor me
  const hasParent = input.parentKey != null
  let parent
  if (hasParent) {
    parent = await getItem({ key: input.parentKey }, ctx)
    log.info('Inheiriting properties from parent')
  }
  const result = await ctx.db.run(
    'INSERT INTO item (key, type, text, deleted, completed, parentKey, projectKey, dueAt, scheduledAt, lastUpdatedAt, completedAt, createdAt, deletedAt, repeat, labelKey, areaKey) VALUES (?,?,?,?,?,?,?,?,?,strftime("%Y-%m-%dT%H:%M:%fZ", "now"), ?, strftime("%Y-%m-%dT%H:%M:%fZ", "now"),?,?,?,?)',
    input.key,
    input.type,
    input.text,
    false,
    false,
    parentText,
    hasParent ? parent.projectKey : projectText,
    dueText,
    scheduledText,
    '',
    '',
    repeatText,
    labelText,
    hasParent ? parent.areaKey : areaText,
  )
  if (await result.changes) {
    return getItem({ key: input.key }, ctx)
  }
  return new Error('Unable to create item')
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

export const deleteItem = async (input: { key: string }, ctx) => {
  log.info(`Deleting item by key - ${input.key} `)
  const children = await getItemsByParent({ parentKey: input.key }, ctx)
  if (children.length) {
    children.map((c) => {
      return deleteItem({ key: c.key }, ctx)
    })
  }

  return ctx.db.run(createDeleteItemQuery(input)).then((result) => {
    if (result.changes) {
      return getItem({ key: input.key }, ctx)
    }
    log.error(`Failed to delete item, key - ${input.key}`)
    return new Error('Unable to delete item')
  })
}

export const createRestoreItemQuery = (input: { key: string }) => {
  return `
UPDATE item SET deleted = false, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), deletedAt = null WHERE key = '${input.key}'
`
}

export const restoreItem = async (input: { key: string }, ctx) => {
  const children = await getItemsByParent({ parentKey: input.key }, ctx)
  if (children.length) {
    children.map((c) => {
      return restoreItem({ key: c.key }, ctx)
    })
  }
  return ctx.db.run(createRestoreItemQuery(input)).then((result) => {
    if (result.changes) {
      return getItem({ key: input.key }, ctx)
    }
    log.error(`Unable to restore item, key - ${input.key}`)
    return new Error('Unable to restore item')
  })
}

export const createRenameItemQuery = (input: { key: string; text: string }) => {
  return `
UPDATE item SET text = ${SqlString.escape(
    input.text,
  )}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const renameItem = (input: { key: string; text: string }, ctx) => {
  log.info(`Renaming item with key - ${input.key} to ${input.text} `)
  return ctx.db.run(createRenameItemQuery(input)).then((result) => {
    if (result.changes) {
      return getItem({ key: input.key }, ctx)
    }
    log.error(`Failed to rename item, key - ${input.key}`)
    return new Error('Unable to rename item')
  })
}

export const createSetTypeOfItemQuery = (input: { key: string; type: string }) => {
  return `
UPDATE item SET type = '${input.type}', lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const setTypeOfItem = (input: { key: string; type: string }, ctx) => {
  log.info(`Setting type of item with key - ${input.key} to ${input.type} `)
  return ctx.db.run(createSetTypeOfItemQuery(input)).then((result) => {
    if (result.changes) {
      return getItem({ key: input.key }, ctx)
    }
    log.error(`Unable to set type of item, key - ${input.key}`)
    return new Error('Unable to set type of item')
  })
}

export const createCompleteItemQuery = (input: { key: string }) => {
  return `
UPDATE item SET completed = true, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), completedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const completeItem = async (input: { key: string }, ctx) => {
  log.info(`Completing item with key - ${input.key}`)
  const item: ItemType = await getItem({ key: input.key }, ctx)
  // If we've got a repeat
  let query = ''
  if (item.repeat) {
    // Check if there's another repeat
    const nextDate = rrulestr(item.repeat).after(new Date())
    if (!nextDate) {
      query = `UPDATE item SET dueAt = null, scheduledAt = null, completed = true, completedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')  WHERE key = '${input.key}'`
    } else {
      query = `UPDATE item SET dueAt = '${nextDate.toISOString()}', scheduledAt = null,  lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')  WHERE key = '${
        input.key
      }'`
    }
  } else {
    query = createCompleteItemQuery(input)
  }
  console.log(query)
  const result = await ctx.db.run(query)
  console.log(await result)
  if (result.changes) {
    return getItem({ key: input.key }, ctx)
  }
  log.error('Failed to complete item')
  return new Error('Unable to complete item')
}

export const createUnCompleteItemQuery = (input: { key: string }) => {
  return `
UPDATE item SET completed = false, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), completedAt = null WHERE key = '${input.key}'
`
}

export const unCompleteItem = (input: { key: string }, ctx) => {
  log.info(`Uncompleting item with key - ${input.key}`)
  return ctx.db.run(createUnCompleteItemQuery(input)).then((result) => {
    if (result.changes) {
      return getItem({ key: input.key }, ctx)
    }
    log.error(`Unable to uncomplete item, key = ${input.key}`)
    return new Error('Unable to uncomplete item')
  })
}

export const createSetRepeatOfItemQuery = (input: { key: string; repeat: string }) => {
  const repeatText = input.repeat ? `'${input.repeat}'` : null
  return `
UPDATE item SET repeat = ${repeatText}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const setRepeatOfItem = (input: { key: string; repeat: string }, ctx) => {
  return ctx.db.run(createSetRepeatOfItemQuery(input)).then((result) => {
    if (result.changes) {
      if (input.repeat) {
        const repeatRule = rrulestr(input.repeat)
        const nextRepeat = repeatRule.after(startOfDay(new Date()), true)
        setDueAtOfItem({ key: input.key, dueAt: nextRepeat }, ctx)
      }
      return getItem({ key: input.key }, ctx)
    }
    log.error(`Unable to set repeat, key - ${input.key}`)
    return new Error('Unable to set repeat of item')
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
    return getItem({ key: newKey }, ctx)
  }
  log.error(`Unable to clone item, key - ${input.key}`)
  return new Error('Unable to clone item')
}

export const createSetProjectOfItemQuery = (input: { key: string; projectKey: string }) => {
  const inputText = input.projectKey ? `'${input.projectKey}'` : null
  return `
UPDATE item SET projectKey = ${inputText}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const setProjectOfItem = async (input: { key: string; projectKey: string }, ctx) => {
  return ctx.db.run(createSetProjectOfItemQuery(input)).then(async (result) => {
    if (result.changes) {
      //  Update children
      const children = await getItemsByParent({ parentKey: input.key }, ctx)
      if (children.length > 0) {
        children.map(async (i) => {
          const childrenResult = await ctx.db.run(
            createSetProjectOfItemQuery({ key: i.key, projectKey: input.projectKey }),
          )
          if (!childrenResult) {
            return new Error("Unable to set project of item's children")
          }
        })
      }

      return getItem({ key: input.key }, ctx)
    }
    log.error(`Unable to set project of item, key - ${input.key}`)
    return new Error('Unable to set project of item')
  })
}

export const createSetAreaOfItemQuery = (input: { key: string; areaKey: string }) => {
  const inputText = input.areaKey ? `'${input.areaKey}'` : null
  return `
UPDATE item SET areaKey = ${inputText}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const setAreaOfItem = (input: { key: string; areaKey: string }, ctx) => {
  return ctx.db.run(createSetAreaOfItemQuery(input)).then(async (result) => {
    if (result.changes) {
      //  Update children
      const children = await getItemsByParent({ parentKey: input.key }, ctx)
      if (children.length > 0) {
        children.map(async (i) => {
          const childrenResult = await ctx.db.run(
            createSetAreaOfItemQuery({ key: i.key, areaKey: input.areaKey }),
          )
          if (!childrenResult) {
            return new Error("Unable to set area of item's children")
          }
        })
      }

      return getItem({ key: input.key }, ctx)
    }
    log.error(`Unable to set area of item, key - ${input.key}`)
    return new Error('Unable to set area of item')
  })
}

export const createSetScheduledAtOfItem = (input: { key: string; scheduledAt: Date }) => {
  const scheduledText = input.scheduledAt ? `'${input.scheduledAt.toISOString()}'` : null
  return `
UPDATE item SET scheduledAt = ${scheduledText}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const setScheduledAtOfItem = (input: { key: string; scheduledAt: Date }, ctx) => {
  return ctx.db.run(createSetScheduledAtOfItem(input)).then((result) => {
    if (result.changes) {
      return getItem({ key: input.key }, ctx)
    }
    log.error(`Unable to set scheduled date of item, key - ${input.key}`)
    return new Error('Unable to set scheduled date of item')
  })
}

export const createSetDueAtOfItem = (input: { key: string; dueAt: Date }) => {
  const dueText = input.dueAt ? `'${input.dueAt.toISOString()}'` : null
  return `
UPDATE item SET dueAt = ${dueText}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const setDueAtOfItem = (input: { key: string; dueAt: Date }, ctx) => {
  return ctx.db.run(createSetDueAtOfItem(input)).then((result) => {
    if (result.changes) {
      return getItem({ key: input.key }, ctx)
    }
    log.error(`Unable to set due date of item, key - ${input.key}`)
    return new Error('Unable to set due date of item')
  })
}

export const createSetParentOfItemQuery = (input: { key: string; parentKey: string }) => {
  const inputText = input.parentKey ? `'${input.parentKey}'` : null
  return `
      UPDATE item SET parentKey = ${inputText}, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
`
}

export const setParentOfItem = async (input: { key: string; parentKey: string }, ctx) => {
  // Check if this is already a parent
  const children = await getItemsByParent({ parentKey: input.key }, ctx)
  if (children.length > 0) {
    log.error(`Unable to set parent of item as it's already a parent, key - ${input.key}`)
    return new Error("Unable to set parent of item as it's already a parent")
  }

  return ctx.db.run(createSetParentOfItemQuery(input)).then((result) => {
    if (result.changes) {
      return getItem({ key: input.key }, ctx)
    }
    log.error(`Unable to set parent of item, key - ${input.key}`)
    return new Error('Unable to set parent of item')
  })
}

export const permanentDeleteItem = (input: { key: string }, ctx) => {
  return ctx.db.run('DELETE from item WHERE key = ?', input.key).then((result) => {
    if (result.changes) {
      return input.key
    }
    log.error(`Unable to set delete item, key - ${input.key}`)
    return new Error(`Unable to delete item with key ${input.key}`)
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
    if (result.changes) {
      return getItem({ key: input.key }, ctx)
    }
    log.error(`Unable to set label of item, key - ${input.key}`)
    return new Error('Unable to set label of item')
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
