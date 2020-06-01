import * as ui from '../actions/ui'
import { UIType } from '../interfaces'

const initialState: UIType = {
    activeItem: {
        past: [],
        present: null,
        future: [],
    },
    theme: 'Light',
    sidebarVisible: true,
    focusbarVisible: true,
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
        case ui.SHOW_FOCUSBAR:
            return {
                ...state,
                focusbarVisible: true,
            }
        case ui.HIDE_FOCUSBAR:
            return {
                ...state,
                focusbarVisible: false,
            }
        case ui.TOGGLE_FOCUSBAR:
            return {
                ...state,
                focusbarVisible: !state.focusbarVisible,
            }
        case ui.SET_ACTIVE_ITEM:
            return {
                ...state,
                activeItem: {
                    past: state.activeItem.present
                        ? [...state.activeItem.past, state.activeItem.present]
                        : state.activeItem.past,
                    present: action.id,
                    future: [],
                },
            }
        case ui.UNDO_SET_ACTIVE_ITEM:
            const previous =
                state.activeItem.past[state.activeItem.past.length - 1]
            const newPast = state.activeItem.past.slice(
                0,
                state.activeItem.past.length - 1,
            )
            return {
                ...state,
                activeItem: {
                    past: newPast ? newPast : [],
                    present: previous,
                    future: [
                        state.activeItem.present,
                        ...state.activeItem.future,
                    ],
                },
            }
        case ui.REDO_SET_ACTIVE_ITEM:
            const next = state.activeItem.future[0]
            const newFuture = state.activeItem.future.slice(1)
            return {
                ...state,
                activeItem: {
                    past: [...state.activeItem.past, state.activeItem.present],
                    present: next,
                    future: newFuture,
                },
            }
        case ui.TOGGLE_DARK_MODE:
            return {
                ...state,
                theme: state.theme == 'light' ? 'dark' : 'light',
            }

        default:
            return state
    }
}
