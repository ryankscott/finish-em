import { createStore, compose } from "redux";
import itemApp from "../reducers";
import { loadState, saveState } from "./localstorage";

const persistedState = loadState();

// TODO: Only turn on devtools when in dev mode
const store = createStore(
  itemApp,
  persistedState,
  compose(
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  )
);

// State persistence
// TODO: Persist this to file in electron
store.subscribe(() => {
  saveState(store.getState());
});

export default store;
