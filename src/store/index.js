import { createStore, compose } from "redux";
import rootReducer from "../reducers";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import isElectron from "is-electron";
import storage from "redux-persist/lib/storage";
let createElectronStorage;
if (isElectron()) {
  createElectronStorage = window.require("redux-persist-electron-storage");
}

// Redux-persist stores dates as JSON, these functions will restore them as dates
const replacer = (key, value) => {
  if (value instanceof Date) return value.toISOString();
  else return value;
};

const reviver = (key, value) => {
  if (
    typeof value === "string" &&
    value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
  )
    return new Date(value);
  else return value;
};

export const encode = toDehydrate => JSON.stringify(toDehydrate, replacer);

export const decode = toRehydrate => JSON.parse(toRehydrate, reviver);

let persistConfig;
if (isElectron()) {
  persistConfig = {
    version: 0,
    key: "root",
    storage: createElectronStorage(),
    transforms: [createTransform(encode, decode)]
  };
} else {
  persistConfig = {
    version: 0,
    key: "root",
    storage,
    transforms: [createTransform(encode, decode)]
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
