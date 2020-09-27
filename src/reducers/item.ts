import * as item from '../actions/item'
import { DELETE_PROJECT, DeleteProjectAction } from '../actions/project'
import { DELETE_AREA, DeleteAreaAction } from '../actions/area'
import { DELETE_LABEL, DeleteLabelAction } from '../actions/ui'
import { Items } from '../interfaces'
import { startOfDay } from 'date-fns'
import { rrulestr } from 'rrule'
import { v4 as uuidv4 } from 'uuid'
import { ItemActions } from '../actions'
import produce from 'immer'
import { getItemTypeFromString, dueTextRegex, scheduledTextRegex } from '../utils'
import { Date as sugarDate } from 'sugar-date'

const uuid = uuidv4()
export const initialState: Items = {
  items: {},
  order: [uuid],
}

export const itemReducer = produce(
  (
    draftState: Items = initialState,
    action: ItemActions | DeleteProjectAction | DeleteLabelAction | DeleteAreaAction,
  ): Items => {
    const i = draftState?.items[action.id]
    switch (action.type) {
      case item.CREATE_ITEM:
        const itemType = getItemTypeFromString(action.text)

        // Due date parsing
        const dueDateText = action.text.match(dueTextRegex)
        let dd = dueDateText ? dueDateText[0].split(':')[1] : ''

        // Removing surrounding "" marks
        dd = dd.replace(/^"(.+(?="$))"$/, '$1')
        const dueDate = dd ? sugarDate.create(dd) : ''

        let itemText = action.text.replace(dueTextRegex, '')

        // Scheduled parsing
        const scheduledDateText = action.text.match(scheduledTextRegex)
        let sd = scheduledDateText ? scheduledDateText[0].split(':')[1] : ''
        sd = sd.replace(/^"(.+(?="$))"$/, '$1')
        const scheduledDate = sd ? sugarDate.create(sd) : ''
        itemText = itemText.replace(scheduledTextRegex, '')

        draftState.items[action.id.toString()] = {
          id: action.id,
          type: itemType,
          text: itemText,
          scheduledDate: scheduledDate ? scheduledDate.toISOString() : null,
          dueDate: dueDate ? dueDate.toISOString() : null,
          projectId: action.projectId ? action.projectId : '0',
          completed: false,
          deleted: false,
          deletedAt: null,
          completedAt: null,
          createdAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          repeat: null,
          parentId: null,
          children: [],
          labelId: null,
          areaId: null,
        }
        if (draftState.order) {
          draftState.order = [...draftState.order, action.id]
        } else {
          draftState.order = [action.id]
        }
        break

      case item.CLONE_ITEM:
        const newId = uuidv4()
        draftState.items[newId.toString()] = {
          ...i,
          id: newId,
          createdAt: new Date().toISOString(),
          lastUpdatedAt: null,
        }
        draftState.order = [...draftState.order, newId]

        break

      case item.DELETE_ITEM:
        i.deleted = true
        i.deletedAt = new Date().toISOString()
        i.lastUpdatedAt = new Date().toISOString()

        // if we're deleting a child, remove the reference to it on the parent
        if (i.parentId != null) {
          const parent = draftState.items[i.parentId]
          parent.children = parent.children.filter((c) => c != action.id)
          parent.lastUpdatedAt = new Date().toISOString()
          i.parentId = null
        }
        // If there's children, update them all as deleted
        if (i.children != []) {
          i.children.map((c) => {
            const child = draftState.items[c]
            child.deleted = true
            child.deletedAt = new Date().toISOString()
            child.lastUpdatedAt = new Date().toISOString()
          })
        }
        // NOTE: We don't remove from order due to things like the trash view
        break

      case item.UNDELETE_ITEM:
        i.deleted = false
        i.deletedAt = null
        i.lastUpdatedAt = new Date().toISOString()
        break

      case item.COMPLETE_ITEM:
        if (i.repeat == null) {
          i.completed = true
          i.completedAt = new Date().toISOString()
          // We should set the due date if there's a repeat to the next occurrence
        } else {
          // Check if there's another repeat
          const nextDate = rrulestr(i.repeat).after(new Date())
          if (!nextDate) {
            i.dueDate == null
            i.completed = true
            i.completedAt = new Date().toISOString()
          } else {
            i.dueDate = nextDate.toISOString()
          }
          i.scheduledDate = null
        }
        i.lastUpdatedAt = new Date().toISOString()
        break

      // TODO: This is incorrectly named it should be ADD_PARENT
      // TODO: Make sure you can't add a child to a parent that's a subtask
      case item.ADD_CHILD_ITEM:
        const parent = draftState.items[action.parentId.toString()]
        const child = draftState.items[action.id.toString()]

        // TODO: This breaks immer?
        // If the child has children already then return
        //if (child.children != []) {
        //    break
        // }

        // if the parent has a parent then return
        if (parent.parentId != null) {
          break
        }

        // Update parent item
        parent.children =
          parent.children == undefined ? [action.id] : [...parent.children, action.id]
        parent.lastUpdatedAt = new Date().toISOString()
        // Update child
        child.projectId = parent.projectId
        child.parentId = parent.id
        child.lastUpdatedAt = new Date().toISOString()
        break

      case item.UNCOMPLETE_ITEM:
        i.completed = false
        i.completedAt = null
        i.lastUpdatedAt = new Date().toISOString()
        break

      case item.ADD_PROJECT:
        i.projectId = action.projectId
        i.lastUpdatedAt = new Date().toISOString()
        // Remove an areaID if it exists
        i.areaId = null

        // Update childrens project also
        i.children &&
          i.children.map((c) => {
            const child = draftState.items[c]
            return (child.projectId = action.projectId)
          })
        break

      case item.ADD_AREA:
        // You can't add an area to an item if it has a project
        if (!(i.projectId == '0' || i.projectId == null)) return
        i.areaId = action.areaId
        // Remove the project
        i.projectId = null
        i.lastUpdatedAt = new Date().toISOString()
        // Update childrens area also
        i.children &&
          i.children.map((c) => {
            const child = draftState.items[c]
            return (child.areaId = action.areaId)
          })
        break

      case item.SET_SCHEDULED_DATE:
        i.scheduledDate = action.date
        i.lastUpdatedAt = new Date().toISOString()
        break

      case item.SET_DUE_DATE:
        i.dueDate = action.date
        i.lastUpdatedAt = new Date().toISOString()
        break

      case item.SET_REPEAT_RULE:
        i.repeat = action.rule?.toString()
        i.lastUpdatedAt = new Date().toISOString()
        // If we don't have the due date we should set this to the next instance of the repeat after today
        if (i.dueDate == null) {
          const nextDueDate = action.rule.after(startOfDay(new Date()), true)
          i.dueDate = nextDueDate == null ? null : nextDueDate.toISOString()
        }
        break

      case item.UPDATE_ITEM_DESCRIPTION:
        i.text = action.text
        i.lastUpdatedAt = new Date().toISOString()
        break

      case item.REORDER_ITEM:
        // Initialise where everything is
        const sourceIndex = draftState.order.indexOf(action.id)
        const destinationIndex = draftState.order.indexOf(action.destinationId)
        const newOrder = draftState.order
        newOrder.splice(sourceIndex, 1)
        const startOfArray = newOrder.slice(0, destinationIndex)
        const endOfArray = newOrder.slice(destinationIndex, newOrder.length)
        draftState.order = [...startOfArray, action.id, ...endOfArray]
        break

      case item.CONVERT_SUBTASK:
        // Need to remove the reference from the parent
        const p = draftState.items[i.parentId]
        p.children = p.children.filter((c) => c != action.id)
        i.parentId = null
        i.lastUpdatedAt = new Date().toISOString()
        break

      // TODO: Make sure you can't add a child to a parent that's a subtask
      case item.CHANGE_PARENT_ITEM:
        // Also need to remove the reference from the old parent
        if (i.parentId) {
          const oldParent = draftState.items[i.parentId]
          oldParent.children = oldParent.children.filter((c) => c != action.id)
          i.parentId = null
          i.lastUpdatedAt = new Date().toISOString()
        }
        // Need to add it to the new parent
        i.parentId = action.parentId
        i.lastUpdatedAt = new Date().toISOString()
        const newParent = draftState.items[action.parentId]
        newParent.children =
          newParent.children.length > 0 ? [...newParent.children, action.id] : [action.id]
        newParent.lastUpdatedAt = new Date().toISOString()
        break

      case DELETE_PROJECT:
        const dp_items = Object.entries(draftState.items).map(([k, v]) => {
          if (v.projectId == action.id) {
            v.deleted = true
            v.projectId = '0'
            v.lastUpdatedAt = new Date().toISOString()
          }
          return [k, v]
        })
        draftState.items = Object.fromEntries(dp_items)
        break

      case DELETE_AREA:
        const da_areas = Object.entries(draftState.items).map(([k, v]) => {
          if (v.areaId == action.id) {
            v.deleted = true
            v.areaId = '0'
            v.lastUpdatedAt = new Date().toISOString()
          }
          return [k, v]
        })
        draftState.items = Object.fromEntries(da_areas)
        break

      case item.DELETE_PERMANENT_ITEM:
        // Don't allow permanent delete if it's not already deleted
        if (i.deleted == false) {
          return
        }
        // Don't allow deleting if all the children are deleted
        if (i.children != []) {
          const allChildrenDeleted = i.children.every((c) => {
            const child = draftState.items[c]
            return child.deleted
          })
          if (!allChildrenDeleted) return
        }
        // Delete all children
        if (i.children != []) {
          i.children.map((c) => {
            draftState.order = draftState.order.filter((o) => o != c)
            delete draftState.items[c]
          })
        }

        // Delete parent / item
        delete draftState.items[action.id]
        draftState.order = draftState.order.filter((o) => o != action.id)
        break

      case item.ADD_LABEL:
        if (i.deleted == true) {
          return
        }
        if (i.completed == true) {
          return
        }
        i.labelId = action.labelId
        i.lastUpdatedAt = new Date().toISOString()
        break

      case item.REMOVE_LABEL:
        if (i.deleted == true) {
          return
        }
        if (i.completed == true) {
          return
        }
        i.labelId = null
        i.lastUpdatedAt = new Date().toISOString()
        break

      // When a label is deleted completly
      case DELETE_LABEL: {
        const x = Object.entries(draftState.items).map(([k, v]) => {
          if (v.labelId == action.id) {
            v.labelId = null
            v.lastUpdatedAt = new Date().toISOString()
          }
          return [k, v]
        })
        draftState.items = Object.fromEntries(x)
        break
      }

      default:
        return draftState
    }
  },
)
