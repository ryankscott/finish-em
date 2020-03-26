import { createStore, compose } from "redux";
import rootReducer from "../reducers";
import {
  createMigrate,
  persistStore,
  persistReducer,
  createTransform
} from "redux-persist";
import isElectron from "is-electron";
import storage from "redux-persist/lib/storage";
let createElectronStorage;
if (isElectron()) {
  createElectronStorage = window.require("redux-persist-electron-storage");
}

const migrations = {
  1: state => {
    return {
      ...state,
      items: state.items.map(i => {
        if (i.children == undefined) {
          i.children = [];
        }
        if (i.childrenHidden == undefined) {
          i.childrenHidden = false;
        }
        if (i.hidden == undefined) {
          i.hidden = false;
        }
        if (i.repeat == undefined) {
          i.repeat = null;
        }
        if (i.deletedAt == undefined) {
          i.deletedAt = null;
        }
        return i;
      })
    };
  }
};

let persistConfig;
if (isElectron()) {
  persistConfig = {
    version: 1,
    key: "root",
    storage: createElectronStorage(),
    migrate: createMigrate(migrations, { debug: true })
  };
} else {
  persistConfig = {
    version: 1,
    key: "root",
    storage,
    migrate: createMigrate(migrations, { debug: true })
  };
}
const persistedReducer = persistReducer(persistConfig, rootReducer);

// TODO: Only turn on devtools when in dev mode

export const store = createStore(
  persistedReducer,
  compose(
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);
export const persistor = persistStore(store);
