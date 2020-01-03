import React, { Component } from "react";
import PropTypes from "prop-types";
import Item from "../components/Item";
import { configure, HotKeys } from "react-hotkeys";

import { deleteItem, setVisibilityFilter } from "../actions";
import { connect } from "react-redux";

// React-hotkeys configuration
configure({
  logLevel: "warn",
  ignoreRepeatedEventsWhenKeyHeldDown: false
});

// TODO: Find a better way of handling the keymap and handlers (redux state?)
const keyMap = {
  SCHEDULE: "s",
  MOVE_UP: ["k", "ArrowUp"],
  MOVE_DOWN: ["j", "ArrowDown"],
  DELETE: "x"
};

class ItemList extends Component {
  constructor(props) {
    super(props);
    this.hotkeyHandler = this.hotkeyHandler.bind(this);
  }

  hotkeyHandler() {
    return {
      SCHEDULE: event => console.log("scheduling!"),
      MOVE_UP: event =>
        event.target.previousSibling && event.target.previousSibling.focus(),
      MOVE_DOWN: event =>
        event.target.nextSibling && event.target.nextSibling.focus(),
      DELETE: event => {
        // TODO: This is probably wrong
        this.props.deleteItem(event.target.id);
      }
    };
  }

  render() {
    return (
      <HotKeys keyMap={keyMap} handlers={this.hotkeyHandler()}>
        <button onClick={this.props.allTodos}> All todos </button>
        <button onClick={this.props.scheduledTodos}> Scheduled todos </button>
        <button onClick={this.props.unscheduledTodos}>
          {" "}
          Unscheduled todos{" "}
        </button>
        <button onClick={this.props.inboxTodos}> Inbox todos </button>
        <div>
          {this.props.items.map(i => {
            return (
              <Item
                id={i.id}
                key={i.id}
                type={i.type}
                text={i.text}
                scheduledDate={i.scheduledDate}
                dueDate={i.dueDate}
              />
            );
          })}
        </div>
      </HotKeys>
    );
  }
}

// TODO: Add PropTypes
const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
  deleteItem: id => {
    dispatch(deleteItem(id));
  },
  allTodos: () => {
    dispatch(setVisibilityFilter("SHOW_ALL"));
  },
  inboxTodos: () => {
    dispatch(setVisibilityFilter("SHOW_INBOX"));
  },
  scheduledTodos: () => {
    dispatch(setVisibilityFilter("SHOW_SCHEDULED"));
  },
  unscheduledTodos: () => {
    dispatch(setVisibilityFilter("SHOW_UNSCHEDULED"));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemList);
