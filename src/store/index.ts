import { createStore, compose } from 'redux'
import rootReducer from '../reducers'
import { createMigrate, persistStore, persistReducer } from 'redux-persist'
import isElectron from 'is-electron'
import storage from 'redux-persist/lib/storage'
import { Items, ItemType, ProjectType, Projects } from '../interfaces'

let createElectronStorage
if (isElectron()) {
    createElectronStorage = window.require('redux-persist-electron-storage')
}

// Remove flagged item and introduces label
export const migratev7tov8Items = (its: Items): Items => {
    const iTemp = Object.entries(its.items).map(([id, value]) => {
        value.labelId = value.flagged
            ? '4702c2d3-bcda-40a2-bd34-e0db07578076'
            : null
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
// Note: The number here denotes the version you want to migrate to
const migrations = {
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
}

let persistConfig
if (isElectron()) {
    persistConfig = {
        version: 8,
        key: 'root',
        debug: true,
        storage: createElectronStorage(),
        migrate: createMigrate(migrations, { debug: true }),
    }
} else {
    persistConfig = {
        version: 8,
        key: 'root',
        debug: true,
        storage,
        migrate: createMigrate(migrations, { debug: true }),
    }
}
const persistedReducer = persistReducer(persistConfig, rootReducer)

// TODO: Only turn on devtools when in dev mode

export const store = createStore(
    persistedReducer,
    compose(
        window.__REDUX_DEVTOOLS_EXTENSION__ &&
            window.__REDUX_DEVTOOLS_EXTENSION__(),
    ),
)
export const persistor = persistStore(store)
