import { Component, IconType } from '../interfaces'

export const SHOW_FOCUSBAR = 'SHOW_FOCUSBAR'
export const TOGGLE_FOCUSBAR = 'TOGGLE_FOCUSBAR'
export const HIDE_FOCUSBAR = 'HIDE_FOCUSBAR'
export const SHOW_SHORTCUT_DIALOG = 'SHOW_SHORTCUT_DIALOG'
export const HIDE_SHORTCUT_DIALOG = 'HIDE_SHORTCUT_DIALOG'
export const TOGGLE_SHORTCUT_DIALOG = 'TOGGLE_SHORTCUT_DIALOG'
export const SHOW_CREATE_PROJECT_DIALOG = 'SHOW_CREATE_PROJECT_DIALOG'
export const HIDE_CREATE_PROJECT_DIALOG = 'HIDE_CREATE_PROJECT_DIALOG'
export const TOGGLE_CREATE_PROJECT_DIALOG = 'TOGGLE_CREATE_PROJECT_DIALOG'
export const SHOW_DELETE_PROJECT_DIALOG = 'SHOW_DELETE_PROJECT_DIALOG'
export const HIDE_DELETE_PROJECT_DIALOG = 'HIDE_DELETE_PROJECT_DIALOG'
export const TOGGLE_DELETE_PROJECT_DIALOG = 'TOGGLE_DELETE_PROJECT_DIALOG'
export const SET_ACTIVE_ITEM = 'SET_ACTIVE_ITEM'
export const UNDO_SET_ACTIVE_ITEM = 'UNDO_SET_ACTIVE_ITEM'
export const REDO_SET_ACTIVE_ITEM = 'REDO_SET_ACTIVE_ITEM'
export const TOGGLE_DARK_MODE = 'TOGGLE_DARK_MODE'
export const DELETE_LABEL = 'DELETE_LABEL'
export const CREATE_LABEL = 'CREATE_LABEL'
export const RENAME_LABEL = 'RENAME_LABEL'
export const SET_LABEL_COLOUR = 'SET_LABEL_COLOUR'
export const SHOW_SUBTASKS = 'SHOW_SUBTASKS'
export const HIDE_SUBTASKS = 'HIDE_SUBTASKS'
export const TOGGLE_SUBTASKS = 'TOGGLE_SUBTASKS'
export const SET_FILTEREDITEMLIST_NAME = 'SET_FILTEREDITEMLIST_NAME'
export const SET_FILTEREDITEMLIST_FILTER = 'SET_FILTEREDITEMLIST_FILTER'
export const SET_FILTEREDITEMLIST_FILTERABLE = 'SET_FILTEREDITEMLIST_FILTERABLE'
export const SET_FILTEREDITEMLIST_HIDDEN_ICONS = 'SET_FILTEREDITEMLIST_HIDDEN_ICONS'
export const SET_FILTEREDITEMLIST_SHOW_ALL_TASKS = 'SET_FILTEREDITEMLIST_SHOW_ALL_TASKS'
export const ADD_COMPONENT = 'ADD_COMPONENT'
export const DELETE_COMPONENT = 'DELETE_COMPONENT'
export const REORDER_COMPONENT = 'REORDER_COMPONENT'
export const ADD_VIEW = 'ADD_VIEW'
export const DELETE_VIEW = 'DELETE_VIEW'
export const REORDER_VIEW = 'REORDER_VIEW'

interface ShowShortcutDialogAction {
  type: typeof SHOW_SHORTCUT_DIALOG
}

export function ShowShortcutDialog(): ShowShortcutDialogAction {
  return {
    type: SHOW_SHORTCUT_DIALOG,
  }
}
interface HideShortcutDialogAction {
  type: typeof HIDE_SHORTCUT_DIALOG
}

export function hideShortcutDialog(): HideShortcutDialogAction {
  return {
    type: HIDE_SHORTCUT_DIALOG,
  }
}
interface ToggleShortcutDialogAction {
  type: typeof TOGGLE_SHORTCUT_DIALOG
}
export function toggleShortcutDialog(): ToggleShortcutDialogAction {
  return {
    type: TOGGLE_SHORTCUT_DIALOG,
  }
}

interface ShowCreateProjectDialogAction {
  type: typeof SHOW_CREATE_PROJECT_DIALOG
}
export function showCreateProjectDialog(): ShowCreateProjectDialogAction {
  return {
    type: SHOW_CREATE_PROJECT_DIALOG,
  }
}
interface ToggleCreateProjectDialogAction {
  type: typeof TOGGLE_CREATE_PROJECT_DIALOG
}

export function toggleCreateProjectDialog(): ToggleCreateProjectDialogAction {
  return {
    type: TOGGLE_CREATE_PROJECT_DIALOG,
  }
}
interface HideCreateProjectDialogAction {
  type: typeof HIDE_CREATE_PROJECT_DIALOG
}

export function hideCreateProjectDialog(): HideCreateProjectDialogAction {
  return {
    type: HIDE_CREATE_PROJECT_DIALOG,
  }
}

interface ShowFocusbarAction {
  type: typeof SHOW_FOCUSBAR
}

export function showFocusbar(): ShowFocusbarAction {
  return {
    type: SHOW_FOCUSBAR,
  }
}
interface HideFocusbarAction {
  type: typeof HIDE_FOCUSBAR
}

export function hideFocusbar(): HideFocusbarAction {
  return {
    type: HIDE_FOCUSBAR,
  }
}
interface ToggleFocusbarAction {
  type: typeof TOGGLE_FOCUSBAR
}
export function toggleFocusbar(): ToggleFocusbarAction {
  return {
    type: TOGGLE_FOCUSBAR,
  }
}
interface SetActiveItemAction {
  type: typeof SET_ACTIVE_ITEM
  id: string
}
export function setActiveItem(id: string): SetActiveItemAction {
  return {
    type: SET_ACTIVE_ITEM,
    id: id,
  }
}
interface UndoSetActiveItemAction {
  type: typeof UNDO_SET_ACTIVE_ITEM
}
export function undoSetActiveItem(): UndoSetActiveItemAction {
  return {
    type: UNDO_SET_ACTIVE_ITEM,
  }
}
interface RedoSetActiveItemAction {
  type: typeof REDO_SET_ACTIVE_ITEM
}
export function redoSetActiveItem(): RedoSetActiveItemAction {
  return {
    type: REDO_SET_ACTIVE_ITEM,
  }
}
interface ToggleDarkModeAction {
  type: typeof TOGGLE_DARK_MODE
}
export function toggleDarkMode(): ToggleDarkModeAction {
  return {
    type: TOGGLE_DARK_MODE,
  }
}
export interface RenameLabelAction {
  type: typeof RENAME_LABEL
  id: string
  text: string
}

export function renameLabel(id: string, text: string): RenameLabelAction {
  return {
    type: RENAME_LABEL,
    id: id,
    text: text,
  }
}
export interface CreateLabelAction {
  type: typeof CREATE_LABEL
  name: string
  colour: string
}

export function createLabel(name: string, colour: string): CreateLabelAction {
  return {
    type: CREATE_LABEL,
    name: name,
    colour: colour,
  }
}

export interface DeleteLabelAction {
  type: typeof DELETE_LABEL
  id: string
}

export function deleteLabel(id: string): DeleteLabelAction {
  return {
    type: DELETE_LABEL,
    id: id,
  }
}

export interface SetLabelColourAction {
  type: typeof SET_LABEL_COLOUR
  id: string
  colour: string
}

export function setLabelColour(id: string, colour: string): SetLabelColourAction {
  return {
    type: SET_LABEL_COLOUR,
    id: id,
    colour: colour,
  }
}

export interface ShowSubtasksAction {
  type: typeof SHOW_SUBTASKS
  id: string
  componentId: string
}

export function showSubtasks(id: string, componentId: string): ShowSubtasksAction {
  return {
    type: SHOW_SUBTASKS,
    id: id,
    componentId: componentId,
  }
}
export interface HideSubtasksAction {
  type: typeof HIDE_SUBTASKS
  id: string
  componentId: string
}

export function hideSubtasks(id: string, componentId: string): HideSubtasksAction {
  return {
    type: HIDE_SUBTASKS,
    id: id,
    componentId: componentId,
  }
}

export interface ToggleSubtasksAction {
  type: typeof TOGGLE_SUBTASKS
  id: string
  componentId: string
}

export function toggleSubtasks(id: string, componentId: string): ToggleSubtasksAction {
  return {
    type: TOGGLE_SUBTASKS,
    id: id,
    componentId: componentId,
  }
}

export interface SetFilteredItemListNameAction {
  type: typeof SET_FILTEREDITEMLIST_NAME
  componentId: string
  name: string
}

export function setFilteredItemListName(
  componentId: string,
  name: string,
): SetFilteredItemListNameAction {
  return {
    type: SET_FILTEREDITEMLIST_NAME,
    componentId: componentId,
    name: name,
  }
}
export interface SetFilteredItemListFilterAction {
  type: typeof SET_FILTEREDITEMLIST_FILTER
  componentId: string
  filter: string
}

export function setFilteredItemListFilter(
  componentId: string,
  filter: string,
): SetFilteredItemListFilterAction {
  return {
    type: SET_FILTEREDITEMLIST_FILTER,
    componentId: componentId,
    filter: filter,
  }
}
export interface SetFilteredItemListFilterableAction {
  type: typeof SET_FILTEREDITEMLIST_FILTERABLE
  componentId: string
  filterable: boolean
}

export function setFilteredItemListFilterable(
  componentId: string,
  filterable: boolean,
): SetFilteredItemListFilterableAction {
  return {
    type: SET_FILTEREDITEMLIST_FILTERABLE,
    componentId: componentId,
    filterable: filterable,
  }
}

export interface SetFilteredItemListHiddenIconsAction {
  type: typeof SET_FILTEREDITEMLIST_HIDDEN_ICONS
  componentId: string
  hiddenIcons: IconType[]
}

export function setFilteredItemListHiddenIcons(
  componentId: string,
  hiddenIcons: IconType[],
): SetFilteredItemListHiddenIconsAction {
  return {
    type: SET_FILTEREDITEMLIST_HIDDEN_ICONS,
    componentId: componentId,
    hiddenIcons: hiddenIcons,
  }
}

export interface SetFilteredItemListShowAllTasksAction {
  type: typeof SET_FILTEREDITEMLIST_SHOW_ALL_TASKS
  componentId: string
  showAllTasks: boolean
}

export function setFilteredItemListShowAllTasks(
  componentId: string,
  showAllTasks: boolean,
): SetFilteredItemListShowAllTasksAction {
  return {
    type: SET_FILTEREDITEMLIST_SHOW_ALL_TASKS,
    componentId: componentId,
    showAllTasks: showAllTasks,
  }
}

export interface AddComponentAction {
  type: typeof ADD_COMPONENT
  id: string
  viewId: string
  location: 'main' | 'sideBar' | 'focusBar'
  component: Component
}

export function addComponent(
  id: string,
  viewId: string,
  location: 'main' | 'sideBar' | 'focusBar',
  component: Component,
): AddComponentAction {
  return {
    type: ADD_COMPONENT,
    id: id,
    viewId: viewId,
    location: location,
    component: component,
  }
}
export interface DeleteComponentAction {
  type: typeof DELETE_COMPONENT
  id: string
}

export function deleteComponent(id: string): DeleteComponentAction {
  return {
    type: DELETE_COMPONENT,
    id: id,
  }
}
export interface ReorderComponentAction {
  type: typeof REORDER_COMPONENT
  id: string
  destinationId: string
}
export function reorderComponent(id: string, destinationId: string): ReorderComponentAction {
  return {
    type: REORDER_COMPONENT,
    id: id,
    destinationId: destinationId,
  }
}

export interface AddViewAction {
  type: typeof ADD_VIEW
  id: string
  name: string
  icon: IconType
  viewType: 'default' | 'custom' | 'project' | 'area'
}

export function addView(
  id: string,
  name: string,
  viewType: 'default' | 'custom' | 'project' | 'area',
  icon?: IconType,
): AddViewAction {
  return {
    type: ADD_VIEW,
    id: id,
    name: name,
    icon: icon,
    viewType: viewType,
  }
}
export interface DeleteViewAction {
  type: typeof DELETE_VIEW
  id: string
}

export function deleteView(id: string): DeleteViewAction {
  return {
    type: DELETE_VIEW,
    id: id,
  }
}
export interface ReorderViewAction {
  type: typeof REORDER_VIEW
  id: string
  destinationId: string
}
export function reorderView(id: string, destinationId: string): ReorderViewAction {
  return {
    type: REORDER_VIEW,
    id: id,
    destinationId: destinationId,
  }
}

export type UIActions =
  | ShowShortcutDialogAction
  | HideShortcutDialogAction
  | ToggleShortcutDialogAction
  | ShowCreateProjectDialogAction
  | HideCreateProjectDialogAction
  | ToggleCreateProjectDialogAction
  | ShowSidebarAction
  | HideSidebarAction
  | ToggleSidebarAction
  | ShowFocusbarAction
  | HideFocusbarAction
  | ToggleFocusbarAction
  | SetActiveItemAction
  | UndoSetActiveItemAction
  | RedoSetActiveItemAction
  | ToggleDarkModeAction
  | RenameLabelAction
  | SetLabelColourAction
  | ShowSubtasksAction
  | HideSubtasksAction
  | ToggleSubtasksAction
  | SetFilteredItemListNameAction
  | SetFilteredItemListFilterAction
  | SetFilteredItemListFilterableAction
  | SetFilteredItemListHiddenIconsAction
  | SetFilteredItemListShowAllTasksAction
  | AddComponentAction
  | DeleteComponentAction
  | ReorderComponentAction
  | AddViewAction
  | DeleteViewAction
  | ReorderViewAction
  | CreateLabelAction
  | DeleteLabelAction
