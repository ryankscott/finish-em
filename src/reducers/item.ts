import * as item from '../actions/item'
import { DELETE_PROJECT, DeleteProjectAction } from '../actions/project'
import { getItemById } from '../utils'
import { ItemType } from '../interfaces'
import { startOfDay } from 'date-fns'
import { rrulestr } from 'rrule'
import uuidv4 from 'uuid/v4'
import { ItemActions } from '../actions'

export const initialState: ItemType[] = [
    {
        id: uuidv4(),
        type: 'TODO',
        text: 'TODO Learn org-mode',
        projectId: null,
        scheduledDate: null,
        dueDate: null,
        completed: false,
        deleted: false,
        deletedAt: null,
        createdAt: new Date(2020, 1, 1).toISOString(),
        completedAt: null,
        lastUpdatedAt: new Date(2020, 1, 1).toISOString(),
        repeat: null,
        parentId: null,
        children: [],
    },
    {
        id: uuidv4(),
        type: 'TODO',
        text: 'TODO Write better code',
        projectId: null,
        scheduledDate: new Date(2020, 3, 2).toISOString(),
        dueDate: null,
        completed: false,
        deleted: false,
        deletedAt: null,
        createdAt: new Date(2020, 1, 1).toISOString(),
        completedAt: null,
        lastUpdatedAt: new Date(2020, 1, 1).toISOString(),
        repeat: null,
        parentId: null,
        children: [],
    },
    {
        id: uuidv4(),
        type: 'NOTE',
        text: 'NOTE Carrot in German is mohren',
        projectId: null,
        scheduledDate: null,
        dueDate: null,
        completed: false,
        deleted: false,
        deletedAt: null,
        createdAt: new Date(2020, 1, 1).toISOString(),
        completedAt: null,
        lastUpdatedAt: new Date(2020, 1, 1).toISOString(),
        repeat: null,
        parentId: null,
        children: [],
    },
]

export const itemReducer = (
    state: ItemType[] = initialState,
    action: ItemActions | DeleteProjectAction,
): ItemType[] => {
    switch (action.type) {
        case item.CREATE_ITEM:
            return [
                ...state,
                {
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
                },
            ]

        case DELETE_PROJECT:
            return state.map((i) => {
                if (i.projectId == action.id) {
                    i.deleted = true
                    i.projectId == null
                    i.lastUpdatedAt = new Date().toISOString()
                }
                return i
            })

        case item.DELETE_ITEM:
            return state.map((i) => {
                if (i.id == action.id) {
                    i.deleted = true
                    i.deletedAt = new Date().toISOString()
                    i.lastUpdatedAt = new Date().toISOString()
                    // if we're removing a child, remove the reference to it on the parent
                    if (i.parentId != null) {
                        const parent = getItemById(i.parentId, state)
                        parent.children = parent.children.filter(
                            (c) => c != action.id,
                        )
                        parent.lastUpdatedAt = new Date().toISOString()
                        i.parentId = null
                    }
                    // If there's children, update them all to get rid of the parent ID
                    if (i.children != []) {
                        i.children.map((c) => {
                            const child = getItemById(c, state)
                            child.parentId = null
                            child.lastUpdatedAt = new Date().toISOString()
                        })
                        i.children = []
                    }
                }
                return i
            })

        case item.UNDELETE_ITEM:
            return state.map((i) => {
                if (i.id == action.id) {
                    i.deleted = false
                    i.deletedAt = null
                    i.lastUpdatedAt = new Date().toISOString()
                }
                return i
            })

        case item.COMPLETE_ITEM:
            return state.map((i) => {
                if (i.id == action.id) {
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
                }
                return i
            })

        // TODO: This is incorrectly named it should be ADD_PARENT
        case item.ADD_CHILD_ITEM:
            const parent = getItemById(action.parentId, state)
            return state.map((i) => {
                if (i.id == action.parentId) {
                    i.children =
                        i.children == undefined
                            ? [action.id]
                            : [...i.children, action.id]
                    i.lastUpdatedAt = new Date().toISOString()
                } else if (i.id == action.id) {
                    i.projectId = parent.projectId
                    i.lastUpdatedAt = new Date().toISOString()
                    i.parentId = action.parentId
                }
                return i
            })

        // TODO: Uncompleting recurring items
        case item.UNCOMPLETE_ITEM:
            return state.map((i) => {
                if (i.id == action.id) {
                    i.completed = false
                    i.completedAt = null
                    i.lastUpdatedAt = new Date().toISOString()
                    // If there's a repeating due date, set it to the next occurence (including today)
                }
                return i
            })

        case item.MOVE_ITEM:
            return state.map((i) => {
                if (i.id == action.id) {
                    i.projectId = action.projectId
                    i.lastUpdatedAt = new Date().toISOString()
                    i.children &&
                        i.children.map((c) => {
                            const child = getItemById(c, state)
                            return (child.projectId = action.projectId)
                        })
                }
                return i
            })

        case item.SET_SCHEDULED_DATE:
            return state.map((i) => {
                if (i.id == action.id) {
                    i.scheduledDate = action.date
                    i.lastUpdatedAt = new Date().toISOString()
                }
                return i
            })

        case item.SET_DUE_DATE:
            return state.map((i) => {
                if (i.id == action.id) {
                    i.dueDate = action.date
                    i.lastUpdatedAt = new Date().toISOString()
                }
                return i
            })

        case item.SET_REPEAT_RULE:
            return state.map((i) => {
                if (i.id == action.id) {
                    i.repeat = action.rule?.toString()
                    i.lastUpdatedAt = new Date().toISOString()
                    // If we don't have the due date we should set this to the next instance of the repeat after today
                    if (i.dueDate == null) {
                        i.dueDate = action.rule
                            .after(startOfDay(new Date()), true)
                            .toISOString()
                    }
                }
                return i
            })

        case item.UPDATE_ITEM_DESCRIPTION:
            return state.map((i) => {
                if (i.id == action.id) {
                    i.text = action.text
                    i.lastUpdatedAt = new Date().toISOString()
                }
                return i
            })

        default:
            return state
    }
}
