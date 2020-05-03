import * as item from '../actions/item'
import { DELETE_PROJECT, DeleteProjectAction } from '../actions/project'
import { Items } from '../interfaces'
import { startOfDay } from 'date-fns'
import { rrulestr } from 'rrule'
import uuidv4 from 'uuid/v4'
import { ItemActions } from '../actions'
import produce from 'immer'

const uuid = uuidv4()
export const initialState: Items = {
    items: {},
    order: [uuid],
}

export const itemReducer = produce(
    (
        draftState: Items = initialState,
        action: ItemActions | DeleteProjectAction,
    ): Items => {
        const i = draftState?.items[action.id]
        switch (action.type) {
            case item.CREATE_ITEM:
                draftState.items[action.id.toString()] = {
                    id: action.id,
                    type: action.itemType,
                    text: action.text,
                    scheduledDate: null,
                    dueDate: null,
                    projectId: action.projectId,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: new Date().toISOString(),
                    lastUpdatedAt: new Date().toISOString(),
                    repeat: null,
                    parentId: null,
                    children: [],
                }
                if (draftState.order) {
                    draftState.order = [...draftState.order, action.id]
                } else {
                    draftState.order = [action.id]
                }
                break

            case item.DELETE_ITEM:
                i.deleted = true
                i.deletedAt = new Date().toISOString()
                i.lastUpdatedAt = new Date().toISOString()
                // if we're removing a child, remove the reference to it on the parent
                if (i.parentId != null) {
                    const parent = draftState.items[i.parentId]
                    parent.children = parent.children.filter(
                        (c) => c != action.id,
                    )
                    parent.lastUpdatedAt = new Date().toISOString()
                    i.parentId = null
                }
                // If there's children, update them all to get rid of the parent ID
                if (i.children != []) {
                    i.children.map((c) => {
                        const child = draftState.items[c]
                        child.parentId = null
                        child.lastUpdatedAt = new Date().toISOString()
                    })
                    i.children = []
                }
                // Remove from order
                draftState.order.filter((o) => o != action.id)
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
                    i.dueDate = rrulestr(i.repeat)
                        .after(new Date())
                        .toISOString()
                }
                i.lastUpdatedAt = new Date().toISOString()
                i.scheduledDate = null
                break

            // TODO: This is incorrectly named it should be ADD_PARENT
            case item.ADD_CHILD_ITEM:
                const parent = draftState.items[action.parentId]
                const child = draftState.items[action.id]
                // Update parent item
                parent.children =
                    parent.children == undefined
                        ? [action.id]
                        : [...parent.children, action.id]
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

            case item.MOVE_ITEM:
                i.projectId = action.projectId
                i.lastUpdatedAt = new Date().toISOString()
                // Update childrens project also
                i.children &&
                    i.children.map((c) => {
                        const child = draftState.items[c]
                        return (child.projectId = action.projectId)
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
                    i.dueDate = action.rule
                        .after(startOfDay(new Date()), true)
                        .toISOString()
                }
                break

            case item.UPDATE_ITEM_DESCRIPTION:
                i.text = action.text
                i.lastUpdatedAt = new Date().toISOString()
                break

            case item.REORDER_ITEM:
                // Initialise where everything is
                const sourceIndex = draftState.order.indexOf(action.id)
                const destinationIndex = draftState.order.indexOf(
                    action.destinationId,
                )
                const newOrder = draftState.order
                newOrder.splice(sourceIndex, 1)
                const startOfArray = newOrder.slice(0, destinationIndex)
                const endOfArray = newOrder.slice(
                    destinationIndex,
                    newOrder.length,
                )
                draftState.order = [...startOfArray, action.id, ...endOfArray]
                break

            // TODO: Implement the deleting of project action
            /*case DELETE_PROJECT:
            return state.map((i) => {
                if (i.projectId == action.id) {
                    i.deleted = true
                    i.projectId == null
                    i.lastUpdatedAt = new Date().toISOString()
                }
                return i
            })
*/

            default:
                return draftState
        }
    },
)
