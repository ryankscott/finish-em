import React from "react";
import PropTypes from "prop-types";
import Item from "../components/Item";
import { HotKeys } from "react-hotkeys";

import { connect } from "react-redux";
const keyMap = {
  SCHEDULE: "s",
  MOVE_UP: "k",
  MOVE_DOWN: "j"
};
const handlers = {
  SCHEDULE: event => console.log("scheduling!"),
  MOVE_UP: event =>
    event.target.previousSibling && event.target.previousSibling.focus(),
  MOVE_DOWN: event =>
    event.target.nextSibling && event.target.nextSibling.focus()
};

const ItemList = ({ items }) => {
  return (
    <ul>
      <HotKeys keyMap={keyMap} handlers={handlers}>
        {Object.values(items).map(i => {
          return (
            <Item
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
};

// TODO: Add PropTypes

const mapStateToProps = state => ({
  items: state.items
});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemList);
