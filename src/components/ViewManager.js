import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import App from "./App";
import QuickAdd from "./QuickAdd";

class ViewManager extends Component {
  static Views() {
    return {
      main: <App />,
      quickAdd: <QuickAdd />
    };
  }

  static View(props) {
    let name = props.location.search.substr(1);
    if (name == "") {
      return ViewManager.Views()["main"];
    }
    let view = ViewManager.Views()[name];
    if (view == null) throw new Error("View '" + name + "' is undefined");
    return view;
  }

  render() {
    return (
      <Router>
        <Route path="/" component={ViewManager.View} />
      </Router>
    );
  }
}

export default ViewManager;
