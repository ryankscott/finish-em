import { Uuid } from '@typed/uuid'
import { Component, IconType } from '../interfaces'

export const SHOW_SIDEBAR = 'SHOW_SIDEBAR'
export const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR'
export const HIDE_SIDEBAR = 'HIDE_SIDEBAR'
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

interface ShowDeleteProjectDialogAction {
    type: typeof SHOW_DELETE_PROJECT_DIALOG
}

export function showDeleteProjectDialog(): ShowDeleteProjectDialogAction {
    return {
        type: SHOW_DELETE_PROJECT_DIALOG,
    }
}
interface ToggleDeleteProjectDialogAction {
    type: typeof TOGGLE_DELETE_PROJECT_DIALOG
}

export function toggleDeleteProjectDialog(): ToggleDeleteProjectDialogAction {
    return {
        type: TOGGLE_DELETE_PROJECT_DIALOG,
    }
}
interface HideDeleteProjectDialogAction {
    type: typeof HIDE_DELETE_PROJECT_DIALOG
}

export function hideDeleteProjectDialog(): HideDeleteProjectDialogAction {
    return {
        type: HIDE_DELETE_PROJECT_DIALOG,
    }
}
interface ShowSidebarAction {
    type: typeof SHOW_SIDEBAR
}

export function showSidebar(): ShowSidebarAction {
    return {
        type: SHOW_SIDEBAR,
    }
}
interface HideSidebarAction {
    type: typeof HIDE_SIDEBAR
}

export function hideSidebar(): HideSidebarAction {
    return {
        type: HIDE_SIDEBAR,
    }
}
interface ToggleSidebarAction {
    type: typeof TOGGLE_SIDEBAR
}
export function toggleSidebar(): ToggleSidebarAction {
    return {
        type: TOGGLE_SIDEBAR,
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
    id: Uuid
}
export function setActiveItem(id: Uuid): SetActiveItemAction {
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
    id: Uuid
    text: string
}

export function renameLabel(id: Uuid, text: string): RenameLabelAction {
    return {
        type: RENAME_LABEL,
        id: id,
        text: text,
    }
}
export interface SetLabelColourAction {
    type: typeof SET_LABEL_COLOUR
    id: Uuid
    colour: string
}

export function setLabelColour(id: Uuid, colour: string): SetLabelColourAction {
    return {
        type: SET_LABEL_COLOUR,
        id: id,
        colour: colour,
    }
}

export interface ShowSubtasksAction {
    type: typeof SHOW_SUBTASKS
    id: Uuid
    componentId: Uuid
}

export function showSubtasks(id: Uuid, componentId: Uuid): ShowSubtasksAction {
    return {
        type: SHOW_SUBTASKS,
        id: id,
        componentId: componentId,
    }
}
export interface HideSubtasksAction {
    type: typeof HIDE_SUBTASKS
    id: Uuid
    componentId: Uuid
}

export function hideSubtasks(id: Uuid, componentId: Uuid): HideSubtasksAction {
    return {
        type: HIDE_SUBTASKS,
        id: id,
        componentId: componentId,
    }
}

export interface ToggleSubtasksAction {
    type: typeof TOGGLE_SUBTASKS
    id: Uuid
    componentId: Uuid
}

export function toggleSubtasks(id: Uuid, componentId: Uuid): ToggleSubtasksAction {
    return {
        type: TOGGLE_SUBTASKS,
        id: id,
        componentId: componentId,
    }
}

export interface SetFilteredItemListNameAction {
    type: typeof SET_FILTEREDITEMLIST_NAME
    componentId: Uuid
    name: string
}

export function setFilteredItemListName(
    componentId: Uuid,
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
    componentId: Uuid
    filter: string
}

export function setFilteredItemListFilter(
    componentId: Uuid,
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
    componentId: Uuid
    filterable: boolean
}

export function setFilteredItemListFilterable(
    componentId: Uuid,
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
    componentId: Uuid
    hiddenIcons: IconType[]
}

export function setFilteredItemListHiddenIcons(
    componentId: Uuid,
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
    componentId: Uuid
    showAllTasks: boolean
}

export function setFilteredItemListShowAllTasks(
    componentId: Uuid,
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
    viewId: Uuid
    location: 'main' | 'sideBar' | 'focusBar'
    component: Component
}

export function addComponent(
    id: string,
    viewId: Uuid,
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
    id: Uuid
    destinationId: Uuid
}
export function reorderComponent(id: Uuid, destinationId: Uuid): ReorderComponentAction {
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
    id: Uuid
    destinationId: Uuid
}
export function reorderView(id: Uuid, destinationId: Uuid): ReorderViewAction {
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
    | ShowDeleteProjectDialogAction
    | HideDeleteProjectDialogAction
    | ToggleDeleteProjectDialogAction
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
