import * as ui from '../actions/ui'
import { UIType, RenderingStrategy } from '../interfaces'
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
        order: [
            '4702c2d3-bcda-40a2-bd34-e0db07578076',
            '5bd4d5ce-447f-45d5-a557-c8942bbfbae4',
            'a342c159-9691-4684-a109-156ba46c1ea4',
        ],
    },
    subtasksVisible: {},
    views: {
        views: {
            '186943b1-b15e-4a24-93d0-2e37eb9af103': {
                id: '186943b1-b15e-4a24-93d0-2e37eb9af103',
                name: 'Unscheduled',
                icon: 'due',
            },
            '4514f106-896f-4f39-9227-ad9c99ebd468': {
                id: '4514f106-896f-4f39-9227-ad9c99ebd468',
                name: 'Trash',
                icon: 'trash',
            },
            'ec9600f5-462b-4d9b-a1ca-db3a88473400': {
                id: 'ec9600f5-462b-4d9b-a1ca-db3a88473400',
                name: 'Completed',
                icon: 'todoChecked',
            },
            '0524ccae-1005-4b75-80ca-f04691ad6431': {
                id: '0524ccae-1005-4b75-80ca-f04691ad6431',
                name: 'Stale',
                icon: 'stale',
            },
        },
        order: [
            '186943b1-b15e-4a24-93d0-2e37eb9af103',
            '4514f106-896f-4f39-9227-ad9c99ebd468',
            'ec9600f5-462b-4d9b-a1ca-db3a88473400',
            '0524ccae-1005-4b75-80ca-f04691ad6431',
        ],
    },
    components: {
        components: {
            // Unscheduled
            '1168fa83-c1de-4ba7-8de6-40fb11f1bcbc': {
                id: '1168fa83-c1de-4ba7-8de6-40fb11f1bcbc',
                viewId: '186943b1-b15e-4a24-93d0-2e37eb9af103',
                location: 'main',
                component: {
                    name: 'ViewHeader',
                    props: { name: 'Unscheduled', icon: 'due' },
                },
            },
            'bb1d3c3d-4d44-49c7-9350-a0ab49c1ec7a': {
                id: 'bb1d3c3d-4d44-49c7-9350-a0ab49c1ec7a',
                viewId: '186943b1-b15e-4a24-93d0-2e37eb9af103',
                location: 'main',
                component: {
                    name: 'FilteredItemList',
                    props: {
                        id: 'bb1d3c3d-4d44-49c7-9350-a0ab49c1ec7a',
                        filter:
                            'scheduledDate == null and not deleted and not completed and type == "TODO" and overdue(dueDate)',
                        hideIcons: [],
                        listName: 'Overdue',
                        isFilterable: true,
                    },
                },
            },
            '5356660e-a3e1-4307-a29f-f7a052d83cae': {
                id: '5356660e-a3e1-4307-a29f-f7a052d83cae',
                viewId: '186943b1-b15e-4a24-93d0-2e37eb9af103',
                location: 'main',
                component: {
                    name: 'FilteredItemList',
                    props: {
                        id: '5356660e-a3e1-4307-a29f-f7a052d83cae',
                        filter:
                            'not deleted and not completed and scheduledDate == null and type == "TODO" and today(createdAt)',
                        hideIcons: [],
                        listName: 'Created today',
                        isFilterable: true,
                    },
                },
            },
            'cce51919-f98f-4fd2-be2d-2c21ccee4049': {
                id: 'cce51919-f98f-4fd2-be2d-2c21ccee4049',
                viewId: '186943b1-b15e-4a24-93d0-2e37eb9af103',
                location: 'main',
                component: {
                    name: 'FilteredItemList',
                    props: {
                        id: 'cce51919-f98f-4fd2-be2d-2c21ccee4049',
                        filter:
                            'not deleted and not completed and scheduledDate == null and type == "TODO" and not today(createdAt) and thisWeek(createdAt) and not thisMonth(createdAt)',
                        hideIcons: [],
                        listName: 'Created this week',
                        isFilterable: true,
                    },
                },
            },
            '4e50ccc3-f70c-4df9-a808-a3c2cdb7e8b1': {
                id: '4e50ccc3-f70c-4df9-a808-a3c2cdb7e8b1',
                viewId: '186943b1-b15e-4a24-93d0-2e37eb9af103',
                location: 'main',
                component: {
                    name: 'FilteredItemList',
                    props: {
                        id: '4e50ccc3-f70c-4df9-a808-a3c2cdb7e8b1',
                        filter:
                            'not deleted and not completed and scheduledDate == null and type == "TODO" and not today(createdAt) and not thisWeek(createdAt) and thisMonth(createdAt)',
                        hideIcons: [],
                        listName: 'Created this month',
                        isFilterable: true,
                    },
                },
            },
            // Trash
            '16709927-2f88-4eda-9af2-ae31a4602894': {
                id: '16709927-2f88-4eda-9af2-ae31a4602894',
                viewId: '4514f106-896f-4f39-9227-ad9c99ebd468',
                location: 'main',
                component: {
                    name: 'ViewHeader',
                    props: { name: 'Trash', icon: 'trash' },
                },
            },
            '65c526ba-c833-408f-b1cb-51cd91570219': {
                id: '65c526ba-c833-408f-b1cb-51cd91570219',
                viewId: '4514f106-896f-4f39-9227-ad9c99ebd468',
                location: 'main',
                component: {
                    name: 'FilteredItemList',
                    props: {
                        id: '65c526ba-c833-408f-b1cb-51cd91570219',
                        filter: 'deleted and today(deletedAt)',
                        hideIcons: [],
                        listName: 'Deleted today',
                        renderingStrategy: RenderingStrategy.All,
                        isFilterable: true,
                    },
                },
            },
            '581eda6d-3d07-473f-b913-accfe53f49ed': {
                id: '581eda6d-3d07-473f-b913-accfe53f49ed',
                viewId: '4514f106-896f-4f39-9227-ad9c99ebd468',
                location: 'main',
                component: {
                    name: 'FilteredItemList',
                    props: {
                        id: '581eda6d-3d07-473f-b913-accfe53f49ed',
                        filter:
                            'deleted and not thisMonth(deletedAt) and thisWeek(deletedAt) and not today(deletedAt)',
                        hideIcons: [],
                        listName: 'Deleted this week',
                        renderingStrategy: RenderingStrategy.All,
                        isFilterable: true,
                    },
                },
            },
            '467594ff-53e8-4bd5-b4f4-28cafdb1b738': {
                id: '467594ff-53e8-4bd5-b4f4-28cafdb1b738',
                viewId: '4514f106-896f-4f39-9227-ad9c99ebd468',
                location: 'main',
                component: {
                    name: 'FilteredItemList',
                    props: {
                        id: '467594ff-53e8-4bd5-b4f4-28cafdb1b738',
                        filter:
                            'deleted and thisMonth(deletedAt) and not thisWeek(deletedAt) and not today(deletedAt)',
                        hideIcons: [],
                        listName: 'Deleted this month',
                        renderingStrategy: RenderingStrategy.All,
                        isFilterable: true,
                    },
                },
            },
            'b7d96ae7-35ca-4dd0-9618-71ac2cd03349': {
                id: 'b7d96ae7-35ca-4dd0-9618-71ac2cd03349',
                viewId: '4514f106-896f-4f39-9227-ad9c99ebd468',
                location: 'main',
                component: {
                    name: 'FilteredItemList',
                    props: {
                        id: 'b7d96ae7-35ca-4dd0-9618-71ac2cd03349',
                        filter:
                            'deleted and not thisMonth(deletedAt) and not thisWeek(deletedAt) and not today(deletedAt)',
                        hideIcons: [],
                        listName: 'Older',
                        renderingStrategy: RenderingStrategy.All,
                        isFilterable: true,
                    },
                },
            },
            // Completed
            'ac603711-dfbd-4a00-999d-eb3e35e1b412': {
                id: 'ac603711-dfbd-4a00-999d-eb3e35e1b412',
                viewId: 'ec9600f5-462b-4d9b-a1ca-db3a88473400',
                location: 'main',
                component: {
                    name: 'ViewHeader',
                    props: { name: 'Completed', icon: 'todoChecked' },
                },
            },
            '4f8cd0a6-99e1-40ed-a6ca-ddb50509448c': {
                id: '4f8cd0a6-99e1-40ed-a6ca-ddb50509448c',
                viewId: 'ec9600f5-462b-4d9b-a1ca-db3a88473400',
                location: 'main',
                component: {
                    name: 'FilteredItemList',
                    props: {
                        id: '4f8cd0a6-99e1-40ed-a6ca-ddb50509448c',
                        filter: 'completed and today(completedAt)',
                        hideIcons: [],
                        listName: 'Completed today',
                        renderingStrategy: RenderingStrategy.All,
                        isFilterable: true,
                    },
                },
            },
            'e899a4cf-bc9e-4bf9-b244-7b8de8d45398': {
                id: 'e899a4cf-bc9e-4bf9-b244-7b8de8d45398',
                viewId: 'ec9600f5-462b-4d9b-a1ca-db3a88473400',
                location: 'main',
                component: {
                    name: 'FilteredItemList',
                    props: {
                        id: 'e899a4cf-bc9e-4bf9-b244-7b8de8d45398',
                        filter:
                            'completed and not thisMonth(completedAt) and thisWeek(completedAt) and not today(completedAt)',
                        hideIcons: [],
                        listName: 'Completed this week',
                        renderingStrategy: RenderingStrategy.All,
                        isFilterable: true,
                    },
                },
            },
            'de005cf2-c876-4547-9a2b-7a7ebf99690d': {
                id: 'de005cf2-c876-4547-9a2b-7a7ebf99690d',
                viewId: 'ec9600f5-462b-4d9b-a1ca-db3a88473400',
                location: 'main',
                component: {
                    name: 'FilteredItemList',
                    props: {
                        id: 'de005cf2-c876-4547-9a2b-7a7ebf99690d',
                        filter:
                            'completed and thisMonth(completedAt) and not thisWeek(completedAt) and not today(completedAt)',
                        hideIcons: [],
                        listName: 'Completed this month',
                        renderingStrategy: RenderingStrategy.All,
                        isFilterable: true,
                    },
                },
            },
            'b67545df-15f3-42ba-ac92-9b6e56bcd8da': {
                id: 'b67545df-15f3-42ba-ac92-9b6e56bcd8da',
                viewId: 'ec9600f5-462b-4d9b-a1ca-db3a88473400',
                location: 'main',
                component: {
                    name: 'FilteredItemList',
                    props: {
                        id: 'b67545df-15f3-42ba-ac92-9b6e56bcd8da',
                        filter:
                            'completed and not thisMonth(completedAt) and not thisWeek(completedAt) and not today(completedAt)',
                        hideIcons: [],
                        listName: 'Older',
                        renderingStrategy: RenderingStrategy.All,
                        isFilterable: true,
                    },
                },
            },
            // Stale
            'e82c588c-f9b4-4429-8f88-d9372ceab190': {
                id: 'e82c588c-f9b4-4429-8f88-d9372ceab190',
                viewId: '0524ccae-1005-4b75-80ca-f04691ad6431',
                location: 'main',
                component: {
                    name: 'ViewHeader',
                    props: { name: 'Stale', icon: 'stale' },
                },
            },
            '2e30abeb-5df5-49f0-90ad-5dad9a18afaa': {
                id: '2e30abeb-5df5-49f0-90ad-5dad9a18afaa',
                viewId: '0524ccae-1005-4b75-80ca-f04691ad6431',
                location: 'main',
                component: {
                    name: 'FilteredItemList',
                    props: {
                        id: '2e30abeb-5df5-49f0-90ad-5dad9a18afaa',
                        filter:
                            'not deleted and not completed and daysFromToday(lastUpdatedAt) > 7 and daysFromToday(lastUpdatedAt) < 31',
                        hideIcons: [],
                        listName: 'Last update more than a week ago',
                        renderingStrategy: RenderingStrategy.All,
                        isFilterable: true,
                    },
                },
            },
            'cd464833-1b54-4a52-8474-9632be6e3d4f': {
                id: 'cd464833-1b54-4a52-8474-9632be6e3d4f',
                viewId: '0524ccae-1005-4b75-80ca-f04691ad6431',
                location: 'main',
                component: {
                    name: 'FilteredItemList',
                    props: {
                        id: 'cd464833-1b54-4a52-8474-9632be6e3d4f',
                        filter:
                            'not deleted and not completed and daysFromToday(i.lastUpdatedAt) > 31',
                        hideIcons: [],
                        listName: 'Last update more than a month ago',
                        renderingStrategy: RenderingStrategy.All,
                        isFilterable: true,
                    },
                },
            },
        },
        order: [
            '1168fa83-c1de-4ba7-8de6-40fb11f1bcbc',
            'bb1d3c3d-4d44-49c7-9350-a0ab49c1ec7a',
            '5356660e-a3e1-4307-a29f-f7a052d83cae',
            'cce51919-f98f-4fd2-be2d-2c21ccee4049',
            '4e50ccc3-f70c-4df9-a808-a3c2cdb7e8b1',
            '16709927-2f88-4eda-9af2-ae31a4602894',
            '65c526ba-c833-408f-b1cb-51cd91570219',
            '581eda6d-3d07-473f-b913-accfe53f49ed',
            '467594ff-53e8-4bd5-b4f4-28cafdb1b738',
            'b7d96ae7-35ca-4dd0-9618-71ac2cd03349',
            'ac603711-dfbd-4a00-999d-eb3e35e1b412',
            '4f8cd0a6-99e1-40ed-a6ca-ddb50509448c',
            'e899a4cf-bc9e-4bf9-b244-7b8de8d45398',
            'de005cf2-c876-4547-9a2b-7a7ebf99690d',
            'b67545df-15f3-42ba-ac92-9b6e56bcd8da',
            'e82c588c-f9b4-4429-8f88-d9372ceab190',
            '2e30abeb-5df5-49f0-90ad-5dad9a18afaa',
            'cd464833-1b54-4a52-8474-9632be6e3d4f',
        ],
    },
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
                const previous = state.activeItem.past[state.activeItem.past.length - 1]
                const newPast = state.activeItem.past.slice(0, state.activeItem.past.length - 1)

                state.activeItem = {
                    past: newPast ? newPast : [],
                    present: previous,
                    future: [state.activeItem.present, ...state.activeItem.future],
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
                const itemV = state.subtasksVisible[action.id]
                if (itemV != undefined) {
                    state.subtasksVisible[action.id][action.componentId] = true
                } else {
                    state.subtasksVisible[action.id] = {
                        [action.componentId]: true,
                    }
                }
                break

            case ui.HIDE_SUBTASKS:
                const iv = state.subtasksVisible[action.id]
                if (iv != undefined) {
                    state.subtasksVisible[action.id][action.componentId] = false
                } else {
                    state.subtasksVisible[action.id] = {
                        [action.componentId]: false,
                    }
                }
                break

            case ui.TOGGLE_SUBTASKS:
                const itemVisiblity = state.subtasksVisible[action.id]
                if (itemVisiblity != undefined) {
                    const componentVisibility = itemVisiblity[action.componentId]
                    if (componentVisibility != undefined) {
                        state.subtasksVisible[action.id][action.componentId] = !state
                            .subtasksVisible[action.id][action.componentId]
                    } else {
                        state.subtasksVisible[action.id][action.componentId] = false
                    }
                } else {
                    state.subtasksVisible[action.id] = {
                        [action.componentId]: false,
                    }
                }
                break

            case ui.SET_FILTEREDITEMLIST_NAME:
                if (
                    (state.components.components[action.componentId].component.name =
                        'FilteredItemList')
                ) {
                    state.components.components[action.componentId].component.props.listName =
                        action.name
                }
                break

            case ui.SET_FILTEREDITEMLIST_FILTER:
                if (
                    (state.components.components[action.componentId].component.name =
                        'FilteredItemList')
                ) {
                    state.components.components[action.componentId].component.props.filter =
                        action.filter
                }
                break

            case ui.SET_FILTEREDITEMLIST_FILTERABLE:
                if (
                    (state.components.components[action.componentId].component.name =
                        'FilteredItemList')
                ) {
                    state.components.components[action.componentId].component.props.isFilterable =
                        action.filterable
                }
                break

            default:
                return state
        }
    },
)
