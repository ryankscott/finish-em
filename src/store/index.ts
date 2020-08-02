import { createStore, compose } from 'redux'
import rootReducer from '../reducers'
import { createMigrate, persistStore, persistReducer } from 'redux-persist'
import isElectron from 'is-electron'
import storage from 'redux-persist/lib/storage'
import { migrations } from './migrations'

/*import * as itemActions from '../actions/item'

const logger = (store) => (next) => (action) => {
    // Get the action names for items
    const actions = Object.values(itemActions).filter((x) => typeof x == 'string')
    if (actions.includes(action.action.type)) {
        console.group(action.action.type)
        console.info(action.action)
        console.log(action.action.type)
        console.groupEnd()
    }
    const result = next(action)
    return result
}*/

let createElectronStorage
if (isElectron()) {
    createElectronStorage = window.require('redux-persist-electron-storage')
}

let persistConfig
if (isElectron()) {
    persistConfig = {
        version: 47,
        key: 'root',
        debug: true,
        storage: createElectronStorage(),
        migrate: createMigrate(migrations, { debug: true }),
    }
} else {
    persistConfig = {
        version: 47,
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
    compose(window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()),
)
export const persistor = persistStore(store)
