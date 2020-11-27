import { Item, ItemType, Labels, Projects, Areas } from '../interfaces'
import { filterItems } from '../utils'
import { compileExpression } from 'filtrex'
import {
  parseISO,
  isToday,
  isThisWeek,
  isThisMonth,
  isPast,
  endOfDay,
  differenceInDays,
  isSameDay,
} from 'date-fns'

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

// Filtrex options
export interface FiltrexOptions {
  labels: Labels
  projects: Projects
  areas: Areas
}

export type FilterFunctions = {
  extraFunctions: {
    getLabelId: (labelName: string) => string
    getProjectId: (projectName: string) => string
    getAreaId: (areaName: string) => string
    overdue: (date: string) => boolean
    today: (date: string) => boolean
    sameDay: (date1: string, date2: string) => boolean
    thisWeek: (date: string) => boolean
    thisMonth: (date: string) => boolean
    daysFromToday: (date: string) => number
  }
}
export const getFilterFunctions = (options: FiltrexOptions): FilterFunctions => {
  return {
    extraFunctions: {
      getLabelId: (labelName: string) => {
        const labels = options.labels.labels
        const label = Object.values(labels).find((l) => l.name == labelName)
        return `${label.id}`
      },
      getProjectId: (projectName: string) => {
        const projects = options.projects.projects
        const project = Object.values(projects).find((l) => l.name == projectName)
        return `${project.id}`
      },
      getAreaId: (areaName: string) => {
        const areas = options.areas.areas
        const area = Object.values(areas).find((l) => l.name == areaName)
        return `${area.id}`
      },
      overdue: (dueDate: string): boolean => {
        return isPast(endOfDay(parseISO(dueDate)))
      },
      today: (d: string): boolean => {
        return isToday(parseISO(d))
      },
      sameDay: (d: string, d1: string): boolean => {
        return isSameDay(parseISO(d), parseISO(d1))
      },
      thisWeek: (d: string): boolean => {
        return isThisWeek(parseISO(d))
      },
      thisMonth: (d: string): boolean => {
        return isThisMonth(parseISO(d))
      },
      daysFromToday: (a: string): number => {
        return differenceInDays(new Date(), parseISO(a))
      },
    },
  }
}

export const getFilteredItems = (state, props): Item => {
  const items = state.items.items
  const ff = compileExpression(
    props.filter,
    getFilterFunctions({
      labels: state.ui.labels,
      projects: state.projects,
      areas: state.areas,
    }),
  )
  return filterItems(items, ff, props.renderingStrategy)
}

export const getItemParentId = (state, props): ItemType => state.items.items[props.parentId]
