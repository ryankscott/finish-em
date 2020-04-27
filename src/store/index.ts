import { createStore, compose } from 'redux'
import rootReducer from '../reducers'
import { createMigrate, persistStore, persistReducer } from 'redux-persist'
import isElectron from 'is-electron'
import storage from 'redux-persist/lib/storage'
import { Items, ItemType } from '../interfaces'
let createElectronStorage
if (isElectron()) {
    createElectronStorage = window.require('redux-persist-electron-storage')
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
}

let persistConfig
if (isElectron()) {
    persistConfig = {
        version: 3,
        key: 'root',
        debug: true,
        storage: createElectronStorage(),
        migrate: createMigrate(migrations, { debug: true }),
    }
} else {
    persistConfig = {
        version: 3,
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
