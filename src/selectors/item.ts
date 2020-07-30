import { createSelector } from 'reselect'
import { Item, ItemType } from '../interfaces'
import { filterItems, generateFiltrexOptions } from '../utils'
import { compileExpression } from 'filtrex'

export const getRenderingStrategy = (state, props) => {
    return props.renderingStrategy
}

export const getItemsFromProject = (state, props): Item => {
    const items = state.items.items
    const filter = `projectId == "${props.project.id}"`
    const ff = compileExpression(filter, generateFiltrexOptions({ labels: state.ui.labels }))
    return filterItems(items, ff, props.renderingStrategy)
}

export const getFilteredItems = (state, props): Item => {
    const items = state.items.items
    const ff = compileExpression(props.filter, generateFiltrexOptions({ labels: state.ui.labels }))
    return filterItems(items, ff, props.renderingStrategy)
}

export const getCompletedItems = createSelector(
    [getFilteredItems, getRenderingStrategy],
    (items, renderingStrategy) => {
        const ff = compileExpression('completed')
        return filterItems(items, ff, renderingStrategy)
    },
)

export const getAllItems = (state): Item => state.items.items

export const getItemParentId = (state, props): ItemType => state.items.items[props.parentId]

export const getUncompletedItems = createSelector(
    [getFilteredItems, getAllItems, getRenderingStrategy],
    (items, allItems, renderingStrategy) => {
        const ff = compileExpression(`not completed`)
        return filterItems(items, ff, renderingStrategy)
    },
)
