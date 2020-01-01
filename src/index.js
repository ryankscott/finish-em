import React from "react";
import ReactDOM from "react-dom";
import ViewManager from "./components/ViewManager";
import { Provider } from "react-redux";
import store from "./store/";

const mainRoot = document.getElementById("mainRoot");
ReactDOM.render(
  <Provider store={store}>
    <ViewManager />
  </Provider>,
  mainRoot
);
