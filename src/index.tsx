import React from "react";
import ReactDOM from "react-dom";
import ViewManager from "./components/ViewManager";
import { Provider } from "react-redux";
import { store, persistor } from "./store/";
import { PersistGate } from "redux-persist/integration/react";

const mainRoot = document.getElementById("mainRoot");

ReactDOM.render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <ViewManager />
        </PersistGate>
    </Provider>,
    mainRoot
);
