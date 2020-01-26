import { createStore, compose } from "redux";
import rootReducer from "../reducers";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Redux-persist stores dates as JSON, these functions will restore them as dates
const replacer = (key, value) =>
  value instanceof Date ? value.toISOString() : value;

const reviver = (key, value) =>
  typeof value === "string" &&
  value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    ? new Date(value)
    : value;

export const encode = toDeshydrate => JSON.stringify(toDeshydrate, replacer);

export const decode = toRehydrate => JSON.parse(toRehydrate, reviver);

const persistConfig = {
  key: "root",
  storage,
  transforms: [createTransform(encode, decode)]
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

// TODO: Only turn on devtools when in dev mode

export const store = createStore(
  persistedReducer,
  compose(
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);
export const persistor = persistStore(store);
