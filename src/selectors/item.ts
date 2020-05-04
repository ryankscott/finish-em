import { endOfDay, isSameDay, isPast, parseISO } from 'date-fns'
import { createSelector } from 'reselect'
import { Item } from '../interfaces'
import { filterItems } from '../utils'

export const getFilteredItems = (state, props): Item => {
    const items = state.items.items
    switch (props.filter) {
        case 'SHOW_ALL':
            return items
        case 'SHOW_DELETED':
            return filterItems(items, (i) => i.deleted == true)
        case 'SHOW_INBOX':
            return filterItems(
                items,
                (i) => i.projectId == null && i.deleted == false,
            )
        case 'SHOW_COMPLETED':
            return filterItems(
                items,
                (i) => i.completed == true && i.deleted == false,
            )
        case 'SHOW_SCHEDULED':
            return filterItems(
                items,
                (i) => i.scheduledDate != null && i.deleted == false,
            )
        case 'SHOW_DUE_ON_DAY':
            return filterItems(
                items,
                (i) =>
                    isSameDay(
                        parseISO(i.dueDate),
                        props.filterParams.dueDate,
                    ) && i.deleted == false,
            )
        case 'SHOW_SCHEDULED_ON_DAY':
            return filterItems(
                items,
                (i) =>
                    isSameDay(
                        parseISO(i.scheduledDate),
                        props.filterParams.scheduledDate,
                    ) && i.deleted == false,
            )
        case 'SHOW_NOT_SCHEDULED':
            return filterItems(
                items,
                (i) =>
                    i.type == 'TODO' &&
                    i.scheduledDate == null &&
                    i.deleted == false &&
                    i.completed == false,
            )
        case 'SHOW_FROM_PROJECT_BY_TYPE':
            return filterItems(
                items,
                (i) =>
                    i.projectId == props.filterParams.projectId &&
                    i.type == props.filterParams.type &&
                    i.deleted == false,
            )
        case 'SHOW_OVERDUE':
            return filterItems(items, (i) => {
                return (
                    (isPast(endOfDay(parseISO(i.scheduledDate))) ||
                        isPast(endOfDay(parseISO(i.dueDate)))) &&
                    i.deleted == false &&
                    i.completed == false
                )
            })
        default:
            throw new Error('Unknown filter: ' + props.filter)
            return items
    }
}

export const getCompletedItems = createSelector(getFilteredItems, (items) => {
    return filterItems(items, (i) => i.completed === true)
})

export const getAllItems = (state): Item => state.items.items

export const getUncompletedItems = createSelector(
    getFilteredItems,
    getAllItems,
    (items, allItems) => {
        return filterItems(items, (i) => {
            return (
                (i.completed == false && i.parentId == null) ||
                (i.completed == false &&
                    i.parentId != null &&
                    allItems[i.parentId].completed == false)
            )
        })
    },
)
