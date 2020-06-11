import * as ui from '../actions/ui'
import { UIType } from '../interfaces'
import produce from 'immer'

const initialState: UIType = {
    activeItem: {
        past: [],
        present: null,
        future: [],
    },
    theme: 'light',
    sidebarVisible: true,
    focusbarVisible: true,
    shortcutDialogVisible: false,
    createProjectDialogVisible: false,
    deleteProjectDialogVisible: false,
    labels: {
        '4702c2d3-bcda-40a2-bd34-e0db07578076': {
            id: '4702c2d3-bcda-40a2-bd34-e0db07578076',
            name: 'Blocked',
            colour: '#fe5e41',
        },
        '5bd4d5ce-447f-45d5-a557-c8942bbfbae4': {
            id: '5bd4d5ce-447f-45d5-a557-c8942bbfbae4',
            name: 'High Priority',
            colour: '#f9df77',
        },
        'a342c159-9691-4684-a109-156ba46c1ea4': {
            id: 'a342c159-9691-4684-a109-156ba46c1ea4',
            name: 'Pending',
            colour: '#59cd90',
        },
    },
    subtasksVisible: {},
}
export const uiReducer = produce(
    (state = initialState, action: ui.UIActions): UIType => {
        switch (action.type) {
            case ui.SHOW_SHORTCUT_DIALOG:
                state.shortcutDialogVisible = true
                break

            case ui.HIDE_SHORTCUT_DIALOG:
                state.shortcutDialogVisible = false
                break

            case ui.TOGGLE_SHORTCUT_DIALOG:
                state.shortcutDialogVisible = !state.shortcutDialogVisible
                break

            case ui.TOGGLE_CREATE_PROJECT_DIALOG:
                state.createProjectDialogVisible = !state.createProjectDialogVisible
                break

            case ui.SHOW_CREATE_PROJECT_DIALOG:
                state.createProjectDialogVisible = true
                break

            case ui.HIDE_CREATE_PROJECT_DIALOG:
                state.createProjectDialogVisible = false
                break

            case ui.TOGGLE_DELETE_PROJECT_DIALOG:
                state.deleteProjectDialogVisible = !state.deleteProjectDialogVisible
                break

            case ui.SHOW_DELETE_PROJECT_DIALOG:
                state.deleteProjectDialogVisible = true
                break

            case ui.HIDE_DELETE_PROJECT_DIALOG:
                state.deleteProjectDialogVisible = false
                break

            case ui.SHOW_SIDEBAR:
                state.sidebarVisible = true
                break

            case ui.HIDE_SIDEBAR:
                state.sidebarVisible = false
                break

            case ui.TOGGLE_SIDEBAR:
                state.sidebarVisible = !state.sidebarVisible
                break

            case ui.SHOW_FOCUSBAR:
                state.focusbarVisible = true
                break

            case ui.HIDE_FOCUSBAR:
                state.focusbarVisible = false
                break

            case ui.TOGGLE_FOCUSBAR:
                state.focusbarVisible = !state.focusbarVisible
                break

            case ui.SET_ACTIVE_ITEM:
                state.activeItem = {
                    past: state.activeItem.present
                        ? [...state.activeItem.past, state.activeItem.present]
                        : state.activeItem.past,
                    present: action.id,
                    future: [],
                }
                break

            case ui.UNDO_SET_ACTIVE_ITEM:
                const previous =
                    state.activeItem.past[state.activeItem.past.length - 1]
                const newPast = state.activeItem.past.slice(
                    0,
                    state.activeItem.past.length - 1,
                )

                state.activeItem = {
                    past: newPast ? newPast : [],
                    present: previous,
                    future: [
                        state.activeItem.present,
                        ...state.activeItem.future,
                    ],
                }
                break

            case ui.REDO_SET_ACTIVE_ITEM:
                const next = state.activeItem.future[0]
                const newFuture = state.activeItem.future.slice(1)

                state.activeItem = {
                    past: [...state.activeItem.past, state.activeItem.present],
                    present: next,
                    future: newFuture,
                }
                break

            case ui.TOGGLE_DARK_MODE:
                state.theme = state.theme == 'light' ? 'dark' : 'light'
                break

            case ui.RENAME_LABEL:
                state.labels[action.id].name = action.text
                break

            case ui.SET_LABEL_COLOUR:
                state.labels[action.id].colour = action.colour
                break

            case ui.SHOW_SUBTASKS:
                state.subtasksVisible[action.id] = true
                break

            case ui.HIDE_SUBTASKS:
                state.subtasksVisible[action.id] = false
                break

            case ui.TOGGLE_SUBTASKS:
                state.subtasksVisible[action.id] = !state.subtasksVisible[
                    action.id
                ]
                break

            default:
                return state
        }
    },
)
