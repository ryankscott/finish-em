import { Uuid } from '@typed/uuid'

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
