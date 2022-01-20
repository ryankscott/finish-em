import { startOfDay } from 'date-fns'
import log from 'electron-log'
import { without } from 'lodash'
import { rrulestr } from 'rrule'
import { SQL } from 'sql-template-strings'
import SqlString from 'sqlstring-sqlite'
import { v4 as uuidv4 } from 'uuid'
import Expression from '../../renderer/components/filter-box/Expression'
import Item from '../classes/item'
import { Item as ItemType } from '../generated/typescript-helpers'
import { bulkCreateItemOrders, deleteItemOrders, getItemOrdersByComponent } from './itemOrder'

export const getItems = (obj, ctx) => {
  log.info(`Getting all items from database`)
  return ctx.db
    .all(
      `SELECT 
        key, 
        type,  
        text, 
        deleted, 
        completed, 
        parentKey, 
        projectKey, 
        dueAt, 
        scheduledAt, 
        lastUpdatedAt, 
        completedAt, 
        createdAt, 
        deletedAt, 
        repeat, 
        labelKey, 
        areaKey 
      FROM item`,
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
          return `${conditionText} (${categoryText} ${operator} ${valueText} OR ${categoryText} IS NULL)`

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
            return `${conditionText} strftime('%W', ${categoryText}) != strftime('%W',date())`
          if (value == 'this month')
            return `${conditionText} strftime('%m', ${categoryText}) != strftime('%m',date())`
          if (value == 'today') return `${conditionText} DATE(${categoryText}) != DATE(date())`
          if (value == 'past') return `${conditionText} DATE(${categoryText}) >= DATE(date())`
          break

        case 'is':
          if (value == 'null') return `${conditionText} ${categoryText} IS null`
          if (value == 'this week')
            return `${conditionText} strftime('%W', ${categoryText}) = strftime('%W',date())`
          if (value == 'this month')
            return `${conditionText} strftime('%m', ${categoryText}) = strftime('%m',date())`
          if (value == 'today') return `${conditionText} DATE(${categoryText}) = DATE(date())`
          if (value == 'past') return `${conditionText} DATE(${categoryText}) < DATE(date())`
          break

        default:
          return `${conditionText} ${categoryText} ${operator} ${valueText}`
      }
    }

    const filterTextArray = exps.map((f: Expression, idx: number) => {
      if (f.expressions) {
        return `${f.conditionType ? f.conditionType : ''} ( ${f.expressions
          .map((fs, idx) => {
            const filterString = transformExpressionToString(
              fs?.conditionType,
              fs.category,
              fs.operator,
              fs.value,
            )
            return filterString
          })
          .join(' ')})`
      } else {
        return f
          ? transformExpressionToString(f?.conditionType, f.category, f.operator, f.value)
          : ''
      }
    })
    return filterTextArray.flat().join(' ')
  }
  const filters = parseFilters(input.filter)
  const filterString = generateQueryString(filters.value)
  const results = await ctx.db.all(
    `SELECT 
        key, 
        type, 
        text, 
        deleted, 
        completed, 
        parentKey, 
        projectKey, 
        dueAt, 
        scheduledAt, 
        lastUpdatedAt, 
        completedAt, 
        createdAt, 
        deletedAt, 
        repeat, 
        labelKey, 
        areaKey 
    FROM item 
    WHERE ${filterString};`,
  )
  if ((await results.length) >= 0) {
    // Get all itemOrders for that component
    const orders = await getItemOrdersByComponent({ componentKey: input.componentKey }, ctx)
    // Remove all ones that aren't in the filtered list
    const orderKeys = orders.map((o) => o.itemKey)
    const resultKeys = results.map((r) => r.key)

    const inOrderButNotResult = without(orderKeys, ...resultKeys)
    await deleteItemOrders({ itemKeys: inOrderButNotResult, componentKey: input.componentKey }, ctx)

    // Add new ones
    const inResultButNotOrder = without(resultKeys, ...orderKeys)
    await bulkCreateItemOrders(
      { itemKeys: inResultButNotOrder, componentKey: input.componentKey },
      ctx,
    )

    return results.map((r) => {
      return new Item(
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
      )
    })
  } else return null
}

export const getItem = (input: { key: string }, ctx) => {
  return ctx.db
    .get(
      SQL`SELECT 
            key, 
            type, 
            text, deleted, 
            completed, 
            parentKey, 
            projectKey, 
            dueAt, 
            scheduledAt, 
            lastUpdatedAt, 
            completedAt, 
            createdAt, 
            deletedAt, 
            repeat, 
            labelKey, 
            areaKey 
      FROM item 
      WHERE key = ${input.key}`,
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
      SQL`SELECT 
            key, 
            type, 
            text, deleted, 
            completed, 
            parentKey, 
            projectKey, 
            dueAt, 
            scheduledAt, 
            lastUpdatedAt, 
            completedAt, 
            createdAt, 
            deletedAt, 
            repeat, 
            labelKey, 
            areaKey 
            FROM item WHERE projectKey = ${input.projectKey}`,
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
      SQL`SELECT 
          key, 
          type, 
          text, deleted, 
          completed, 
          parentKey, 
          projectKey, 
          dueAt, 
          scheduledAt, 
          lastUpdatedAt, 
          completedAt, 
          createdAt, 
          deletedAt, 
          repeat, 
          labelKey, 
          areaKey 
          FROM item WHERE parentKey = ${input.parentKey}`,
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
      SQL`SELECT 
        key, 
        type, 
        text, deleted, 
        completed, 
        parentKey, 
        projectKey, 
        dueAt, 
        scheduledAt, 
        lastUpdatedAt, 
        completedAt, 
        createdAt, 
        deletedAt, 
        repeat, 
        labelKey, 
        areaKey 
        FROM item WHERE areaKey = ${input.areaKey}`,
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
    SQL`
INSERT INTO item 
  (
    key, 
    type, 
    text, 
    deleted, 
    completed, 
    parentKey, 
    projectKey, 
    dueAt, 
    scheduledAt, 
    lastUpdatedAt, 
    completedAt, 
    createdAt, 
    deletedAt, 
    repeat,
    labelKey, 
    areaKey
    ) 
VALUES (
  ${input.key},
  ${input.type}, 
  ${input.text},
  false, 
  false,
  ${input.parentKey},
  ${hasParent ? parent.projectKey : projectText},
  ${dueText},
  ${scheduledText},
  strftime("%Y-%m-%dT%H:%M:%fZ", "now"),
  '', 
  strftime("%Y-%m-%dT%H:%M:%fZ", "now"),
  '',
  ${repeatText},
  ${labelText},
  ${hasParent ? parent.areaKey : areaText})`,
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
  return `
  REPLACE INTO item 
  (
    key, 
    type, 
    text, 
    deleted, 
    completed, 
    parentKey, 
    projectKey, 
    dueAt, 
    scheduledAt, 
    lastUpdatedAt, 
    completedAt, 
    createdAt, 
    deletedAt, 
    repeat, 
    labelKey, 
    areaKey)
  VALUES 
  ( 
    '${input.key}', 
    '${input.type}', 
    ${SqlString.escape(input.text)}, 
    ${input.deleted}, 
    ${input.completed}, 
    ${parentText}, 
    ${projectText}, 
    ${dueText}, 
    ${scheduledText}, 
    ${lastUpdatedText}, 
    ${completedText}, 
    ${createdText}, 
    ${deletedText}, 
    ${repeatText}, 
    ${labelText}, 
    ${areaText})`
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

export const deleteItem = async (input: { key: string }, ctx) => {
  log.info(`Deleting item by key - ${input.key} `)
  const children = await getItemsByParent({ parentKey: input.key }, ctx)
  if (children.length) {
    children.map((c) => {
      return deleteItem({ key: c.key }, ctx)
    })
  }

  return ctx.db
    .run(
      SQL`
UPDATE item 
SET 
  deleted = true, 
  lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 
  deletedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
WHERE key = ${input.key};`,
    )
    .then((result) => {
      if (result.changes) {
        return getItem({ key: input.key }, ctx)
      }
      log.error(`Failed to delete item, key - ${input.key}`)
      return new Error('Unable to delete item')
    })
}

export const restoreItem = async (input: { key: string }, ctx) => {
  const children = await getItemsByParent({ parentKey: input.key }, ctx)
  if (children.length) {
    children.map((c) => {
      return restoreItem({ key: c.key }, ctx)
    })
  }
  return ctx.db
    .run(
      SQL`
UPDATE item 
SET 
  deleted = false, 
  lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 
  deletedAt = null 
WHERE key = ${input.key}`,
    )
    .then((result) => {
      if (result.changes) {
        return getItem({ key: input.key }, ctx)
      }
      log.error(`Unable to restore item, key - ${input.key}`)
      return new Error('Unable to restore item')
    })
}

export const renameItem = (input: { key: string; text: string }, ctx) => {
  log.info(`Renaming item with key - ${input.key} to ${input.text} `)
  return ctx.db
    .run(
      SQL`
  UPDATE item 
  SET 
    text = ${input.text}, 
    lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
  WHERE key = ${input.key}`,
    )
    .then((result) => {
      if (result.changes) {
        return getItem({ key: input.key }, ctx)
      }
      log.error(`Failed to rename item, key - ${input.key}`)
      return new Error('Unable to rename item')
    })
}

export const setTypeOfItem = (input: { key: string; type: string }, ctx) => {
  log.info(`Setting type of item with key - ${input.key} to ${input.type} `)
  return ctx.db
    .run(
      SQL`
UPDATE item 
SET 
  type = ${input.type}, 
  lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
WHERE key = ${input.key}
 `,
    )
    .then((result) => {
      if (result.changes) {
        return getItem({ key: input.key }, ctx)
      }
      log.error(`Unable to set type of item, key - ${input.key}`)
      return new Error('Unable to set type of item')
    })
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
    query = `
    UPDATE item SET completed = true, lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), completedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = '${input.key}'
    `
  }
  const result = await ctx.db.run(query)
  if (result.changes) {
    return getItem({ key: input.key }, ctx)
  }
  log.error('Failed to complete item')
  return new Error('Unable to complete item')
}

export const createUnCompleteItemQuery = (input: { key: string }) => {
  return
}

export const unCompleteItem = (input: { key: string }, ctx) => {
  log.info(`Uncompleting item with key - ${input.key}`)
  return ctx.db
    .run(
      SQL`
  UPDATE item 
  SET 
    completed = false, 
    lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 
    completedAt = null 
  WHERE key = ${input.key}`,
    )
    .then((result) => {
      if (result.changes) {
        return getItem({ key: input.key }, ctx)
      }
      log.error(`Unable to uncomplete item, key = ${input.key}`)
      return new Error('Unable to uncomplete item')
    })
}

export const setRepeatOfItem = (input: { key: string; repeat: string }, ctx) => {
  return ctx.db
    .run(
      SQL`
  UPDATE item 
  SET 
    repeat = ${input.repeat ? input.repeat : null}, 
    lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
  WHERE key = ${input.key}`,
    )
    .then((result) => {
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

export const cloneItem = async (input: { key: string }, ctx) => {
  const newKey = uuidv4()
  const result = await ctx.db.run(SQL`
INSERT INTO item 
(
  type, 
  text, 
  deleted, 
  completed, 
  parentKey, 
  projectKey, 
  dueAt, 
  scheduledAt, 
  lastUpdatedAt, 
  completedAt, 
  createdAt, 
  deletedAt, 
  repeat, 
  labelKey, 
  areaKey, 
  key) 
SELECT 
  type, 
  text, 
  deleted, 
  completed, 
  parentKey, 
  projectKey, 
  dueAt, 
  scheduledAt, 
  lastUpdatedAt, 
  completedAt, 
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 
  deletedAt, 
  repeat, 
  labelKey, 
  areaKey, 
  ${newKey} 
FROM item 
WHERE key = ${input.key}`)
  if (result.changes) {
    return getItem({ key: newKey }, ctx)
  }
  log.error(`Unable to clone item, key - ${input.key}`)
  return new Error('Unable to clone item')
}

export const setProjectOfItem = async (input: { key: string; projectKey: string }, ctx) => {
  return ctx.db
    .run(
      SQL`
  UPDATE item 
  SET 
    projectKey = ${input.projectKey ? input.projectKey : null}, 
    lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
  WHERE key = ${input.key}
  `,
    )
    .then(async (result) => {
      if (result.changes) {
        //  Update children
        const children = await getItemsByParent({ parentKey: input.key }, ctx)
        if (children.length > 0) {
          children.map(async (i) => {
            const childrenResult = await ctx.db.run(
              SQL`
              UPDATE item 
              SET 
                projectKey = ${input.projectKey ? input.projectKey : null}, 
                lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
              WHERE key = ${i.key}
              `,
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

export const setAreaOfItem = (input: { key: string; areaKey: string }, ctx) => {
  return ctx.db
    .run(
      SQL`
  UPDATE item 
  SET 
    areaKey = ${input.areaKey ? input.areaKey : null}, 
    lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
  WHERE key = ${input.key}
  `,
    )
    .then(async (result) => {
      if (result.changes) {
        //  Update children
        const children = await getItemsByParent({ parentKey: input.key }, ctx)
        if (children.length > 0) {
          children.map(async (i) => {
            const childrenResult = await ctx.db.run(
              SQL`
              UPDATE item 
              SET 
                areaKey = ${input.areaKey ? input.areaKey : null}, 
                lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
              WHERE key = ${i.key}
              `,
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

export const setScheduledAtOfItem = (input: { key: string; scheduledAt: Date }, ctx) => {
  return ctx.db
    .run(
      SQL`
  UPDATE item 
    SET scheduledAt = ${input.scheduledAt ? input.scheduledAt.toISOString() : null}, 
    lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
  WHERE key = ${input.key}
  `,
    )
    .then((result) => {
      if (result.changes) {
        return getItem({ key: input.key }, ctx)
      }
      log.error(`Unable to set scheduled date of item, key - ${input.key}`)
      return new Error('Unable to set scheduled date of item')
    })
}

export const setDueAtOfItem = (input: { key: string; dueAt: Date }, ctx) => {
  return ctx.db
    .run(
      SQL`
  UPDATE item 
  SET 
    dueAt = ${input.dueAt ? input.dueAt.toISOString() : null}, 
    lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
  WHERE key = ${input.key}
  `,
    )
    .then((result) => {
      if (result.changes) {
        return getItem({ key: input.key }, ctx)
      }
      log.error(`Unable to set due date of item, key - ${input.key}`)
      return new Error('Unable to set due date of item')
    })
}

export const setParentOfItem = async (input: { key: string; parentKey: string }, ctx) => {
  // Check if this is already a parent
  const children = await getItemsByParent({ parentKey: input.key }, ctx)
  if (children.length > 0) {
    log.error(`Unable to set parent of item as it's already a parent, key - ${input.key}`)
    return new Error("Unable to set parent of item as it's already a parent")
  }

  return ctx.db
    .run(
      SQL`
  UPDATE item 
  SET 
    parentKey = ${input.parentKey ? input.parentKey : null}, 
    lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
  WHERE key = ${input.key}
`,
    )
    .then((result) => {
      if (result.changes) {
        return getItem({ key: input.key }, ctx)
      }
      log.error(`Unable to set parent of item, key - ${input.key}`)
      return new Error('Unable to set parent of item')
    })
}

export const permanentDeleteItem = (input: { key: string }, ctx) => {
  return ctx.db.run(SQL`DELETE from item WHERE key = ${input.key}`).then((result) => {
    if (result.changes) {
      return input.key
    }
    log.error(`Unable to set delete item, key - ${input.key}`)
    return new Error(`Unable to delete item with key ${input.key}`)
  })
}

export const setLabelOfItem = (input: { key: string; labelKey: string }, ctx) => {
  return ctx.db
    .run(
      SQL`
  UPDATE item 
  SET 
    labelKey = ${input.labelKey ? input.labelKey : null}, 
    lastUpdatedAt = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') 
  WHERE key = ${input.key}
  `,
    )
    .then((result) => {
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
