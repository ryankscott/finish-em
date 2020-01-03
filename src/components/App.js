import React, { Component } from "react";
import QuickAdd from "./QuickAdd";
import FilteredItemList from "../containers/FilteredItemList";

class App extends Component {
  render() {
    return (
      <div>
        <header className="header">
          <h1 className="title">Finish 'Em</h1>
          <p> Press Control+Shift+N to add something</p>
        </header>
        <QuickAdd />
        <FilteredItemList />
      </div>
    );
  }
}

export default App;
