import React, { Component } from "react";
import styled from "styled-components";

import { connect } from "react-redux";
import { createItem } from "../actions";
import { configure, HotKeys } from "react-hotkeys";

import { deleteItem, refileItem } from "../actions";
import ProjectDropdown from "../components/ProjectDropdown";

const ItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 25px;
  width: 450px;
  border: 1px solid #ccc;
  padding: 5px 0px 5px 5px;
  align-items: center;
  :focus {
    background-color: #e5e5e5;
  }
`;

// TODO: Conditional styling
const ItemType = styled.div`
  color: #ffffff;
  background-color: #ff9e80;
  border: 1px solid #ff8e80;
  margin: 2px 5px 2px 2px;
  padding: 2px 5px;
  border-radius: 5px;
  cursor: pointer;
`;
// React-hotkeys configuration
configure({
  logLevel: "warn",
  ignoreRepeatedEventsWhenKeyHeldDown: false
});

const keyMap = {
  SCHEDULE: "s",
  DELETE: "x",
  REFILE: "r",
  MOVE_UP: ["k", "ArrowUp"],
  MOVE_DOWN: ["j", "ArrowDown"]
};

class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectDropdownVisible: false
    };
    this.hotkeyHandler = this.hotkeyHandler.bind(this);
    this.refileItem = this.refileItem.bind(this);
  }

  // TODO: This is a hack so that I can have access to the props...
  hotkeyHandler() {
    return {
      SCHEDULE: event => console.log("scheduling!"),
      DELETE: event => {
        // TODO: This is probably wrong
        this.props.deleteItem(event.target.id);
      },
      REFILE: event => {
        console.log("refiling");
        this.setState({
          projectDropdownVisible: true
        });
      },
      // TODO: Yikes that's a complicated meat-ball
      MOVE_UP: event => {
        event.target.parentElement.previousSibling &&
          event.target.parentElement.previousSibling.firstChild.focus();
      },
      MOVE_DOWN: event => {
        event.target.parentElement.nextSibling &&
          event.target.parentElement.nextSibling.firstChild.focus();
      }
    };
  }

  // TODO: This feels wrong but I can't find a better way to get the id of the item
  refileItem(projectId) {
    this.props.refileItem(this.props.id, projectId);
    this.setState({ projectDropdownVisible: false });
  }

  render() {
    return (
      <HotKeys keyMap={keyMap} handlers={this.hotkeyHandler()}>
        <ItemContainer id={this.props.id} tabIndex="0">
          <ItemType>{this.props.type}</ItemType>
          {this.props.text} - {this.props.scheduledDate}
          {this.props.dueDate}
        </ItemContainer>
        <ProjectDropdown
          onSubmit={this.refileItem}
          visible={this.state.projectDropdownVisible}
        />
      </HotKeys>
    );
  }
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({
  deleteItem: id => {
    dispatch(deleteItem(id));
  },
  refileItem: (id, projectId) => {
    dispatch(refileItem(id, projectId));
  }
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Item);
