import React, { Component } from "react";
import QuickAdd from "./QuickAdd";
import FilteredItemList from "../containers/FilteredItemList";
import ProjectList from "../containers/ProjectList";
import { connect } from "react-redux";

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className="div">
          <h1 className="title">Finish 'Em</h1>
          <p>Enter a todo or note below </p>
          <p> Hotkeys:</p>
          <ul>
            <li>r to refile </li>
            <li>j and k (or up and down) for down and up</li>
          </ul>
        </div>
        <QuickAdd />
        <ProjectList items={this.props.items} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  items: state.items
});

const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
