import { endOfDay, isSameDay, isPast, parseISO } from 'date-fns'
import { createSelector } from 'reselect'
import { getItemById } from '../utils'
import { ItemType } from '../interfaces'

export const getFilteredItems = (state, props): ItemType[] => {
    switch (props.filter) {
        case 'SHOW_ALL':
            return state.items
        case 'SHOW_DELETED':
            return state.items.filter((i) => i.deleted == true)
        case 'SHOW_INBOX':
            return state.items.filter(
                (i) => i.projectId == null && i.deleted == false,
            )
        case 'SHOW_COMPLETED':
            return state.items.filter(
                (i) => i.completed == true && i.deleted == false,
            )
        case 'SHOW_SCHEDULED':
            return state.items.filter(
                (i) => i.scheduledDate != null && i.deleted == false,
            )
        case 'SHOW_DUE_ON_DAY':
            return state.items.filter(
                (i) =>
                    isSameDay(
                        parseISO(i.dueDate),
                        props.filterParams.dueDate,
                    ) && i.deleted == false,
            )
        case 'SHOW_SCHEDULED_ON_DAY':
            return state.items.filter(
                (i) =>
                    isSameDay(
                        parseISO(i.scheduledDate),
                        props.filterParams.scheduledDate,
                    ) && i.deleted == false,
            )
        case 'SHOW_NOT_SCHEDULED':
            return state.items.filter(
                (i) =>
                    i.type == 'TODO' &&
                    i.scheduledDate == null &&
                    i.deleted == false &&
                    i.completed == false,
            )
        case 'SHOW_FROM_PROJECT_BY_TYPE':
            return state.items.filter(
                (i) =>
                    i.projectId == props.filterParams.projectId &&
                    i.type == props.filterParams.type &&
                    i.deleted == false,
            )
        case 'SHOW_OVERDUE':
            return state.items.filter((i) => {
                return (
                    (isPast(endOfDay(parseISO(i.scheduledDate))) ||
                        isPast(endOfDay(parseISO(i.dueDate)))) &&
                    i.deleted == false &&
                    i.completed == false
                )
            })
        default:
            throw new Error('Unknown filter: ' + props.filter)
            return state.items
    }
}

export const getCompletedItems = createSelector(getFilteredItems, (items) => {
    return items.filter((i) => i.completed === true)
})

export const getAllItems = (state) => state.items

export const getUncompletedItems = createSelector(
    getFilteredItems,
    getAllItems,
    (items, allItems) => {
        return items.filter((i) => {
            return (
                (i.completed == false && i.parentId == null) ||
                (i.completed == false &&
                    i.parentId != null &&
                    getItemById(i.parentId, allItems).completed == false)
            )
        })
    },
)
