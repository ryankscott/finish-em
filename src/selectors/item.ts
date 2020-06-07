import { endOfDay, isSameDay, isPast, parseISO } from 'date-fns'
import { createSelector } from 'reselect'
import { Item } from '../interfaces'
import { filterItems } from '../utils'

export const getRenderingStrategy = (state, props) => {
    return props.renderingStrategy
}

export const getFilteredItems = (state, props): Item => {
    const items = state.items.items
    if (props.filter.type == 'default') {
        switch (props.filter.filter) {
            case 'SHOW_ALL':
                return items
            case 'SHOW_DELETED':
                return filterItems(
                    items,
                    (i) => i.deleted == true,
                    props.renderingStrategy,
                )
            case 'SHOW_INBOX':
                return filterItems(
                    items,
                    (i) => i.projectId == '0' && i.deleted == false,
                    props.renderingStrategy,
                )
            case 'SHOW_COMPLETED':
                return filterItems(
                    items,
                    (i) => i.completed == true && i.deleted == false,

                    props.renderingStrategy,
                )
            case 'SHOW_SCHEDULED':
                return filterItems(
                    items,
                    (i) => i.scheduledDate != null && i.deleted == false,

                    props.renderingStrategy,
                )
            case 'SHOW_DUE_ON_DAY':
                return filterItems(
                    items,
                    (i) =>
                        isSameDay(
                            parseISO(i.dueDate),
                            props.filter.params.dueDate,
                        ) && i.deleted == false,
                    props.renderingStrategy,
                )
            case 'SHOW_SCHEDULED_ON_DAY':
                return filterItems(
                    items,
                    (i) =>
                        isSameDay(
                            parseISO(i.scheduledDate),
                            props.filter.params.scheduledDate,
                        ) && i.deleted == false,
                    props.renderingStrategy,
                )
            case 'SHOW_NOT_SCHEDULED':
                return filterItems(
                    items,
                    (i) =>
                        i.type == 'TODO' &&
                        i.scheduledDate == null &&
                        i.deleted == false &&
                        i.completed == false,
                    props.renderingStrategy,
                )
            case 'SHOW_FROM_PROJECT_BY_TYPE':
                return filterItems(
                    items,
                    (i) =>
                        i.projectId == props.filter.params.projectId &&
                        i.type == props.filter.params.type &&
                        !i.deleted &&
                        !i.completed &&
                        i.parentId == null,
                    props.renderingStrategy,
                )
            case 'SHOW_OVERDUE':
                return filterItems(
                    items,
                    (i) => {
                        return (
                            (isPast(endOfDay(parseISO(i.scheduledDate))) ||
                                isPast(endOfDay(parseISO(i.dueDate)))) &&
                            i.deleted == false &&
                            i.completed == false
                        )
                    },
                    props.renderingStrategy,
                )
            case 'SHOW_BY_LABEL':
                return filterItems(
                    items,
                    (i) => {
                        return (
                            i.deleted == false &&
                            i.type == 'TODO' &&
                            i.labelId == props.filter.params.labelId
                        )
                    },
                    props.renderingStrategy,
                )
            case 'SHOW_BY_LABEL_ON_DAY':
                return filterItems(
                    items,
                    (i) => {
                        return (
                            i.deleted == false &&
                            i.type == 'TODO' &&
                            i.labelId == props.filter.params.labelId &&
                            (isSameDay(
                                parseISO(i.scheduledDate),
                                parseISO(props.filter.params.scheduledDate),
                            ) ||
                                isSameDay(
                                    parseISO(i.dueDate),
                                    parseISO(props.filter.params.dueDate),
                                ))
                        )
                    },
                    props.renderingStrategy,
                )
            default:
                throw new Error('Unknown filter: ' + props.filter)
        }
    } else {
        return filterItems(items, props.filter.filter, props.renderingStrategy)
    }
}

export const getCompletedItems = createSelector(
    [getFilteredItems, getRenderingStrategy],
    (items, renderingStrategy) => {
        return filterItems(
            items,
            (i) => i.completed === true,
            renderingStrategy,
        )
    },
)

export const getAllItems = (state): Item => state.items.items

export const getUncompletedItems = createSelector(
    [getFilteredItems, getAllItems, getRenderingStrategy],
    (items, allItems, renderingStrategy) => {
        return filterItems(
            items,
            (i) => {
                return (
                    (i.completed == false && i.parentId == null) ||
                    (i.completed == false &&
                        i.parentId != null &&
                        allItems[i.parentId].completed == false)
                )
            },
            renderingStrategy,
        )
    },
)
