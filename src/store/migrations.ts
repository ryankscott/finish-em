import {
    Items,
    ItemType,
    ProjectType,
    Projects,
    Label,
    Labels,
    RenderingStrategy,
    Views,
    Project,
    MainComponents,
} from '../interfaces'
import uuidv4 from 'uuid'
import { ItemIcons } from '../components/Item'
// Remove flagged item and introduces label
export const migratev7tov8Items = (its: Items): Items => {
    const iTemp = Object.entries(its.items).map(([id, value]) => {
        value.labelId = value.flagged ? '4702c2d3-bcda-40a2-bd34-e0db07578076' : null
        delete value.flagged
        return [id, value]
    })
    const items = Object.fromEntries(iTemp)
    return {
        items: items,
        order: its.order,
    }
}

// Changes references to projects
export const migratev5tov6Items = (its: Items): Items => {
    const iTemp = Object.entries(its.items).map(([id, value]) => {
        if (value.projectId == null || value.projectId == undefined) {
            value.projectId = '0'
        }
        return [id, value]
    })
    const items = Object.fromEntries(iTemp)
    return {
        items: items,
        order: its.order,
    }
}
// Changes projects from an array to an object
export const migratev5tov6Projects = (pts: ProjectType[]): Projects => {
    const order = []
    const projects = {}
    pts.forEach((p: ProjectType) => {
        if (p.id == null || p.id == undefined) {
            projects['0'] = p
            projects['0'].id = '0'
            order.push('0')
        } else if (p.deleted == true) {
            projects[p.id] = p
        } else {
            projects[p.id] = p
            order.push(p.id)
        }
    })
    return { projects: projects, order: order }
}

export const migratev2tov3Items = (its: ItemType[]): Items => {
    const o = []
    const is = {}
    its.forEach((i: ItemType) => {
        is[i.id] = i
        o.push(i.id)
    })
    return { items: is, order: o }
}

export const migratev11tov12Labels = (ls: Label): Labels => {
    return { labels: ls, order: Object.keys(ls) }
}

export const migratev36tov37Views = (vs: Views, ps: Project): Views => {
    const newViews = vs.views
    const newOrder = vs.order
    const viewEntries = Object.entries(newViews).map(([id, value]) => {
        if (
            id == 'ccf4ccf9-28ff-46cb-9f75-bd3f8cd26134' ||
            id == 'ab4b890e-9b90-45b1-8404-df70711a68dd'
        ) {
            return [id, { ...value, type: 'default' }]
        }
        return [id, { ...value, type: 'custom' }]
    })
    let viewValues = Object.fromEntries(viewEntries)
    const projectViews = Object.values(ps).map((p) => {
        {
            newOrder.push(p.id)
            if (p.id == 0) {
                viewValues = {
                    ...viewValues,
                    'ab4b890e-9b90-45b1-8404-df70711a68dd': {
                        id: 'ab4b890e-9b90-45b1-8404-df70711a68dd',
                        name: p.name,
                        type: 'project',
                    },
                }
            }
            viewValues = {
                ...viewValues,
                [p.id]: {
                    id: p.id,
                    name: p.name,
                    type: 'project',
                },
            }
        }
    })

    return {
        views: {
            ...viewValues,
            'a6770550-ecc5-48a3-89eb-6b6a6aaea05d': {
                id: 'a6770550-ecc5-48a3-89eb-6b6a6aaea05d',
                name: 'Labels',
                icon: 'label',
                type: 'custom',
            },
        },
        order: [...newOrder, 'a6770550-ecc5-48a3-89eb-6b6a6aaea05d'],
    }
}

export const migratev36tov37Components = (cs: MainComponents, ps: Project): MainComponents => {
    let newComponents = cs.components
    const newOrder = cs.order
    const projectViews = Object.values(ps).map((p) => {
        {
            const comp1Id = uuidv4()
            const comp2Id = uuidv4()
            newOrder.push(comp1Id)
            newOrder.push(comp2Id)
            newComponents = {
                ...newComponents,
                [comp1Id]: {
                    id: comp1Id,
                    viewId: p.id,
                    location: 'main',
                    component: {
                        name: 'FilteredItemList',
                        props: {
                            id: comp1Id,
                            filter: `projectId == "${p.id}" and not (deleted or completed) and type == "TODO"`,
                            hideIcons: [],
                            listName: 'Items',
                            isFilterable: true,
                        },
                    },
                },
                [comp2Id]: {
                    id: comp2Id,
                    viewId: p.id,
                    location: 'main',
                    component: {
                        name: 'FilteredItemList',
                        props: {
                            id: comp2Id,
                            filter: `projectId == "${p.id}" and not (deleted or completed) and type == "NOTE"`,
                            hideIcons: [ItemIcons.Project],
                            listName: 'Notes',
                            isFilterable: true,
                        },
                    },
                },
            }
        }
    })

    return {
        components: {
            ...newComponents,
            'e62c66d4-0933-4198-bce6-47d6093259d6': {
                id: 'e62c66d4-0933-4198-bce6-47d6093259d6',
                viewId: 'ab4b890e-9b90-45b1-8404-df70711a68dd',
                location: 'main',
                component: {
                    name: 'FilteredItemList',
                    props: {
                        id: 'e62c66d4-0933-4198-bce6-47d6093259d6',
                        filter: 'projectId == "0" and not (deleted or completed)',
                        hideIcons: [ItemIcons.Project],
                        listName: 'Items',
                        isFilterable: true,
                    },
                },
            },
            '6d6d2ff6-61ad-4d47-aee3-3a9ca909f4da': {
                id: '6d6d2ff6-61ad-4d47-aee3-3a9ca909f4da',
                viewId: 'a6770550-ecc5-48a3-89eb-6b6a6aaea05d',
                location: 'main',
                component: {
                    name: 'ViewHeader',
                    props: { name: 'Labels', icon: 'label' },
                },
            },
        },
        order: [
            ...newOrder,
            'e62c66d4-0933-4198-bce6-47d6093259d6',
            '6d6d2ff6-61ad-4d47-aee3-3a9ca909f4da',
        ],
    }
}

// Note: The number here denotes the version you want to migrate to
export const migrations = {
    3: (state) => {
        return {
            ...state,
            items: migratev2tov3Items(state.items),
            ui: {
                ...state.ui,
                activeItem: null,
                focusbarVisible: false,
            },
        }
    },
    4: (state) => {
        return {
            ...state,
            ui: {
                ...state.ui,
                activeItem: {
                    past: [],
                    present: state.ui.activeItem ? state.ui.activeItem : null,
                    future: [],
                },
            },
        }
    },
    5: (state) => {
        return {
            ...state,
            features: {
                dragAndDrop: true,
            },
        }
    },
    6: (state) => {
        return {
            ...state,
            projects: migratev5tov6Projects(state.projects),
            items: migratev5tov6Items(state.items),
        }
    },
    7: (state) => {
        return {
            ...state,
            ui: { ...state.ui, theme: 'light' },
        }
    },
    8: (state) => {
        return {
            ...state,
            items: migratev7tov8Items(state.items),
            ui: {
                ...state.ui,
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
            },
        }
    },
    9: (state) => {
        return {
            ...state,
            extensions: {
                '0dd1d2ee-2a95-47e4-9c27-6d429d284c18': {
                    id: '0dd1d2ee-2a95-47e4-9c27-6d429d284c18',
                    path: '/dailyAgenda',
                    location: 'main',
                    component: {
                        name: 'FilteredItemList',
                        props: {
                            hideIcons: [],
                            isFilterable: true,
                            listName: 'Pending Items',
                            filter: {
                                type: 'default',
                                filter: 'SHOW_BY_LABEL_ON_DAY',
                                params: {
                                    labelId: 'a342c159-9691-4684-a109-156ba46c1ea4',
                                    scheduledDate: new Date(),
                                    dueDate: new Date(),
                                },
                            },
                        },
                    },
                },
            },
        }
    },
    10: (state) => {
        return {
            ...state,
            ui: {
                ...state.ui,
                subtasksVisible: {},
            },
        }
    },
    11: (state) => {
        return {
            ...state,
            extensions: {
                '0dd1d2ee-2a95-47e4-9c27-6d429d284c18': {
                    id: '0dd1d2ee-2a95-47e4-9c27-6d429d284c18',
                    path: '/dailyAgenda',
                    location: 'main',
                    component: {
                        name: 'FilteredItemList',
                        props: {
                            hideIcons: [],
                            isFilterable: true,
                            listName: 'Pending Items',
                            filter: {
                                type: 'default',
                                filter: 'SHOW_BY_LABEL',
                                params: {
                                    labelId: 'a342c159-9691-4684-a109-156ba46c1ea4',
                                },
                            },
                        },
                    },
                },
            },
        }
    },
    12: (state) => {
        // Remove Extensions
        const s = state
        delete s.extensions

        // Refactor UI
        return {
            ...s,
            ui: {
                ...s.ui,
                // Refactor labels
                labels: migratev11tov12Labels(s.ui.labels),
                // Reset subtasksVisible
                subtasksVisible: {},
                // Add views
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
                // Add components
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
                                        'scheduledDate == null and not (deleted or completed) and type == "TODO" and overdue(dueDate)',
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
                                        'not (deleted or completed) and scheduledDate == null and type == "TODO" and today(createdAt)',
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
                                        'not (deleted or completed) and scheduledDate == null and type == "TODO" and not today(createdAt) and thisWeek(createdAt) and not thisMonth(createdAt)',
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
                                        'not (deleted or completed) and scheduledDate == null and type == "TODO" and not today(createdAt) and not thisWeek(createdAt) and thisMonth(createdAt)',
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
                                        'not (deleted or completed) and daysFromToday(lastUpdatedAt) > 7 and daysFromToday(lastUpdatedAt) < 31',
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
                                    id: '2e30abeb-5df5-49f0-90ad-5dad9a18afaa',
                                    filter:
                                        'not (deleted or completed) and daysFromToday(lastUpdatedAt) > 31',
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
            },
        }
    },
    13: (state) => {
        return {
            ...state,
            ui: {
                ...state.ui,
                components: {
                    ...state.ui.components,
                    components: {
                        ...state.ui.components.components,
                        'cd464833-1b54-4a52-8474-9632be6e3d4f': {
                            id: 'cd464833-1b54-4a52-8474-9632be6e3d4f',
                            viewId: '0524ccae-1005-4b75-80ca-f04691ad6431',
                            location: 'main',
                            component: {
                                name: 'FilteredItemList',
                                props: {
                                    id: 'cd464833-1b54-4a52-8474-9632be6e3d4f',
                                    filter:
                                        'not (deleted or completed) and daysFromToday(lastUpdatedAt) > 31',
                                    hideIcons: [],
                                    listName: 'Last update more than a month ago',
                                    renderingStrategy: RenderingStrategy.All,
                                    isFilterable: true,
                                },
                            },
                        },
                    },
                },
            },
        }
    },
    // Bump to align to version numbers
    36: (state) => {
        return {
            ...state,
            features: {
                projectDates: true,
            },
        }
    },
    37: (state) => {
        return {
            ...state,
            ui: {
                ...state.ui,
                components: {
                    ...migratev36tov37Components(state.ui.components, state.projects.projects),
                },
                views: {
                    ...migratev36tov37Views(state.ui.views, state.projects.projects),
                },
            },
        }
    },
}
