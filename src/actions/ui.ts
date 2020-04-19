export const SHOW_SIDEBAR = 'SHOW_SIDEBAR'
export const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR'
export const HIDE_SIDEBAR = 'HIDE_SIDEBAR'
export const SHOW_SHORTCUT_DIALOG = 'SHOW_SHORTCUT_DIALOG'
export const HIDE_SHORTCUT_DIALOG = 'HIDE_SHORTCUT_DIALOG'
export const TOGGLE_SHORTCUT_DIALOG = 'TOGGLE_SHORTCUT_DIALOG'
export const SHOW_CREATE_PROJECT_DIALOG = 'SHOW_CREATE_PROJECT_DIALOG'
export const HIDE_CREATE_PROJECT_DIALOG = 'HIDE_CREATE_PROJECT_DIALOG'
export const TOGGLE_CREATE_PROJECT_DIALOG = 'TOGGLE_CREATE_PROJECT_DIALOG'
export const SHOW_DELETE_PROJECT_DIALOG = 'SHOW_DELETE_PROJECT_DIALOG'
export const HIDE_DELETE_PROJECT_DIALOG = 'HIDE_DELETE_PROJECT_DIALOG'
export const TOGGLE_DELETE_PROJECT_DIALOG = 'TOGGLE_DELETE_PROJECT_DIALOG'

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
