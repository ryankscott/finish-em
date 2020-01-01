import React, { Component } from "react";
import QuickAdd from "./QuickAdd";
import ItemList from "../containers/ItemList";

class App extends Component {
  render() {
    return (
      <div>
        <header className="header">
          <h1 className="title">Finish 'Em</h1>
          <p> Press Control+Shift+N to add something</p>
        </header>
        <QuickAdd />
        <ItemList />
      </div>
    );
  }
}

export default App;
