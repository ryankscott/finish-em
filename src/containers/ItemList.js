import React, { Component } from "react";
import PropTypes from "prop-types";
import Item from "../components/Item";
import { HotKeys } from "react-hotkeys";

import { deleteItem } from "../actions";
import { connect } from "react-redux";

class ItemList extends Component {
  constructor(props) {
    super(props);
  }

  keyMap() {
    return {
      SCHEDULE: "s",
      MOVE_UP: "k",
      MOVE_DOWN: "j",
      DELETE: "x"
    };
  }
  handlers() {
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
    console.log("Re rendering list");
    const items = this.props.items;
    return (
      <ul>
        <HotKeys keyMap={this.keyMap()} handlers={this.handlers()}>
          {Object.values(items).map(i => {
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
        </HotKeys>
      </ul>
    );
  }
}

// TODO: Add PropTypes

const mapStateToProps = state => ({
  items: state.items
});

const mapDispatchToProps = dispatch => ({
  deleteItem: id => {
    dispatch(deleteItem(id));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemList);
