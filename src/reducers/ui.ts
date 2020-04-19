import * as ui from '../actions/ui'
import { UIType } from '../interfaces'

const initialState: UIType = {
    sidebarVisible: true,
    shortcutDialogVisible: false,
    createProjectDialogVisible: false,
    deleteProjectDialogVisible: false,
}
export const uiReducer = (
    state = initialState,
    action: ui.UIActions,
): UIType => {
    switch (action.type) {
        case ui.SHOW_SHORTCUT_DIALOG:
            return {
                ...state,
                shortcutDialogVisible: true,
            }
        case ui.HIDE_SHORTCUT_DIALOG:
            return {
                ...state,
                shortcutDialogVisible: false,
            }

        case ui.TOGGLE_SHORTCUT_DIALOG:
            return {
                ...state,
                shortcutDialogVisible: !state.shortcutDialogVisible,
            }

        case ui.TOGGLE_CREATE_PROJECT_DIALOG:
            return {
                ...state,
                createProjectDialogVisible: !state.createProjectDialogVisible,
            }
        case ui.SHOW_CREATE_PROJECT_DIALOG:
            return {
                ...state,
                createProjectDialogVisible: true,
            }
        case ui.HIDE_CREATE_PROJECT_DIALOG:
            return {
                ...state,
                createProjectDialogVisible: false,
            }
        case ui.TOGGLE_DELETE_PROJECT_DIALOG:
            return {
                ...state,
                deleteProjectDialogVisible: !state.deleteProjectDialogVisible,
            }
        case ui.SHOW_DELETE_PROJECT_DIALOG:
            return {
                ...state,
                deleteProjectDialogVisible: true,
            }
        case ui.HIDE_DELETE_PROJECT_DIALOG:
            return {
                ...state,
                deleteProjectDialogVisible: false,
            }
        case ui.SHOW_SIDEBAR:
            return {
                ...state,
                sidebarVisible: true,
            }
        case ui.HIDE_SIDEBAR:
            return {
                ...state,
                sidebarVisible: false,
            }
        case ui.TOGGLE_SIDEBAR:
            return {
                ...state,
                sidebarVisible: !state.sidebarVisible,
            }

        default:
            return state
    }
}
