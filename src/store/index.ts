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

export const migratev5tov6Projects = (pts: ProjectType[]): Projects => {
    const order = []
    const projects = {}
    pts.forEach((p: ProjectType) => {
        projects[p.id] = p
        order.push(p.id)
    })
    return { projects: projects, order: order }
}

export const migratev2tov3Items = (its: ItemType[]): Items => {
    const o = []
    const is = {}
    its.forEach((i: ItemType) => {
        if (i.id == null) {
            is[0] = i
            o.push(0)
        } else {
            is[i.id] = i
            o.push(i.id)
        }
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
        }
    },
}

let persistConfig
if (isElectron()) {
    persistConfig = {
        version: 6,
        key: 'root',
        debug: true,
        storage: createElectronStorage(),
        migrate: createMigrate(migrations, { debug: true }),
    }
} else {
    persistConfig = {
        version: 6,
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
