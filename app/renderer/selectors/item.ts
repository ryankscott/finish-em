import { Item, ItemType, Labels, Projects, Areas } from '../interfaces'

export const getAllItems = (state): Item => state.items.items

export const getRenderingStrategy = (state, props): string => {
  return props.renderingStrategy
}

export const getItemsFromProject = (state, projectId: string): Item => {
  return Object.keys(state.items.items)
    .filter((key) => state.items.items[key].projectId == projectId)
    .reduce((res, key) => ((res[key] = state.items.items[key]), res), {})
}

export const getCompletedItemsFromProject = (state, projectId: string): Item => {
  return Object.keys(state.items.items)
    .filter((key) => state.items.items[key].projectId == projectId)
    .filter((key) => state.items.items[key].completed == true)
    .reduce((res, key) => ((res[key] = state.items.items[key]), res), {})
}

export const getItemParentId = (state, props): ItemType => state.items.items[props.parentId]
