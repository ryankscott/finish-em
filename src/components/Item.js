import React, { Component, forwardRef } from "react";
import styled, { ThemeProvider, keyframes } from "styled-components";
import { connect } from "react-redux";
import { RRule } from "rrule";
import uuidv4 from "uuid/v4";

import { keymap } from "../keymap";

import {
  addChildItem,
  createItem,
  moveItem,
  updateItemDescription,
  completeItem,
  deleteItem,
  undeleteItem,
  uncompleteItem,
  setScheduledDate,
  setRepeatRule,
  setDueDate,
  hideChildren,
  showChildren
} from "../actions";
import { theme } from "../theme";
import ProjectDropdown from "./ProjectDropdown";
import EditableItem from "./EditableItem";
import DatePicker from "./DatePicker";
import RepeatPicker from "./RepeatPicker";
import EditableText from "./EditableText";
import ExpandIcon from "./ExpandIcon";
import IconButton from "./IconButton2";
import DateRenderer from "./DateRenderer";
import { getProjectNameById, removeItemTypeFromString } from "../utils";

const Container = styled.div`
  transition: max-height 0.2s ease-in-out, opacity 0.05s ease-in-out;
  max-height: ${props => (props.hidden ? "0px" : "200px")};
  font-family: ${props => props.theme.font.sansSerif};
  font-size: ${props => props.theme.fontSizes.medium};
  display: grid;
  opacity: ${props => (props.hidden ? "0" : "1")};
  grid-template-columns: ${props =>
    props.isSubtask && !props.noIndentation
      ? "60px 30px repeat(20, 1fr)"
      : "30px 30px repeat(20, 1fr)"};
  grid-auto-rows: minmax(20px, auto);
  grid-template-areas:
    "EXPAND TYPE DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC PROJECT PROJECT PROJECT"
    ". . SCHEDULED SCHEDULED SCHEDULED SCHEDULED . . . . DUE DUE DUE DUE . . . . REPEAT REPEAT REPEAT REPEAT";
  border-bottom: ${props => (props.hidden ? "0px" : "1px solid")}
  border-top: ${props => (props.hidden ? "0px" : "1px solid")};
  border-color: ${props => props.theme.colours.borderColour};
  padding: ${props => (props.hidden ? "0px" : "5px 5px 5px 5px")};
  align-items: center;
  cursor: pointer;
  color: ${props => props.theme.colours.defaultTextColour};
  :focus {
    background-color: ${props => props.theme.colours.focusBackgroundColour};
    border-color: ${props => props.theme.colours.focusBorderColour};
  }
`;

const QuickAddContainer = styled.div`
  display: ${props => (props.visible ? "block" : "none")};
`;

const Body = styled.div`
  margin: 5px 10px;
  grid-area: DESC;
  font-size: ${props => props.theme.fontSizes.regular};
  text-decoration: ${props =>
    props.completed == true ? "line-through" : null};
`;

const Project = styled.div`
  grid-area: PROJECT;
  display: ${props => (props.visible ? "flex" : "none")};
  justify-content: center;
  text-align: center;
  margin: 2px 2px 2px 2px;
  padding: 2px 4px;
  font-size: ${props => props.theme.fontSizes.xsmall};
  color: ${props => props.theme.colours.altTextColour};
  background-color: ${props => props.theme.colours.primaryColour};
  border-radius: 5px;
`;

class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectDropdownVisible: false,
      scheduledDateDropdownVisible: false,
      dueDateDropdownVisible: false,
      repeatDropdownVisible: false,
      descriptionEditable: false,
      quickAddContainerVisible: false,
      keyPresses: []
    };
    this.setScheduledDate = this.setScheduledDate.bind(this);
    this.setDueDate = this.setDueDate.bind(this);
    this.setRepeatRule = this.setRepeatRule.bind(this);
    this.moveItem = this.moveItem.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleExpand = this.handleExpand.bind(this);
    this.handleIconClick = this.handleIconClick.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);

    this.handlers = {
      TODO: {
        // EDIT_ITEM_DESC: event => {
        //   console.log(this.description);
        // },
        NEXT_ITEM: event => {
          // If it's a parent element we need to get the first child
          if (this.props.children.length > 0) {
            const nextItem = event.target.parentNode.nextSibling;
            if (nextItem) {
              nextItem.firstChild.focus();
              return;
            }
          }
          // If it's a child
          if (this.props.parentId != null) {
            const nextItem = event.target.parentNode.nextSibling;
            if (nextItem) {
              nextItem.firstChild.focus();
              return;
            }
            // If it's the last child
            else {
              const nextItem =
                event.target.parentNode.parentNode.nextSibling.firstChild;
              if (nextItem) {
                nextItem.firstChild.focus();
                return;
              }
            }
          }
          const parent = event.target.parentNode.parentNode;
          const nextItem = parent.nextSibling;
          if (nextItem) {
            nextItem.firstChild.firstChild.focus();
            return;
          }
        },
        PREV_ITEM: event => {
          if (this.props.children.length > 0) {
            const prevItem = event.target.parentNode.previousSibling;
            if (prevItem) {
              prevItem.firstChild.focus();
              return;
            }
          }
          // If it's a child
          if (this.props.parentId != null) {
            const nextItem = event.target.parentNode.previousSibling;
            if (nextItem) {
              nextItem.firstChild.focus();
              return;
            }
            // If it's the last child
            else {
              const prevItem =
                event.target.parentNode.parentNode.previousSibling.firstChild;
              if (prevItem) {
                prevItem.firstChild.focus();
                return;
              }
            }
          }
          // TODO: Fix issue for first item
          const parent = event.target.parentNode.parentNode;
          const prevItem = parent.previousSibling.firstChild;
          if (prevItem) {
            prevItem.firstChild.focus();
            return;
          }
        },
        TOGGLE_CHILDREN: () => {
          this.props.hiddenChildren
            ? this.props.showChildren(this.props.id)
            : this.props.hideChildren(this.props.id);
        },
        SET_SCHEDULED_DATE: event => {
          if (this.props.deleted || this.props.completed) return;
          this.setState({
            scheduledDateDropdownVisible: !this.state
              .scheduledDateDropdownVisible,
            dueDateDropdownVisible: false,
            projectDropdownVisible: false,
            repeatDropdownVisible: false
          });
          event.preventDefault();
        },
        SET_DUE_DATE: event => {
          if (this.props.deleted || this.props.completed) return;
          this.setState({
            dueDateDropdownVisible: !this.state.dueDateDropdownVisible,
            scheduledDateDropdownVisible: false,
            projectDropdownVisible: false,
            repeatDropdownVisible: false
          });
          event.preventDefault();
        },
        CREATE_SUBTASK: () => {
          if (this.props.deleted || this.props.completed) return;
          this.setState({
            quickAddContainerVisible: !this.state.quickAddContainerVisible,
            scheduledDateDropdownVisible: false,
            dueDateDropdownVisible: false,
            projectDropdownVisible: false,
            repeatDropdownVisible: false
          });
        },
        COMPLETE_ITEM: () => {
          if (this.props.deleted || this.props.completed) return;
          this.props.completeItem(this.props.id);
        },
        UNCOMPLETE_ITEM: () => {
          if (this.props.deleted) return;
          this.props.uncompleteItem(this.props.id);
        },
        REPEAT_ITEM: event => {
          if (this.props.deleted || this.props.completed) return;
          this.setState({
            repeatDropdownVisible: !this.state.repeatDropdownVisible,
            scheduledDateDropdownVisible: false,
            dueDateDropdownVisible: false,
            projectDropdownVisible: false
          });
          event.preventDefault();
        },
        DELETE_ITEM: event => {
          if (this.props.deleted) return;
          this.props.deleteItem(event.target.id);
        },
        UNDELETE_ITEM: () => {
          this.props.undeleteItem(this.props.id);
        },
        MOVE_ITEM: event => {
          if (this.props.deleted || this.props.completed) return;
          this.setState({
            projectDropdownVisible: !this.state.projectDropdownVisible,
            dueDateDropdownVisible: false,
            scheduledDateDropdownVisible: false,
            repeatDropdownVisible: false
          });
          event.preventDefault();
        },
        ESCAPE: () => {
          this.setState({
            projectDropdownVisible: false,
            dueDateDropdownVisible: false,
            scheduledDateDropdownVisible: false,
            descriptionEditable: false,
            repeatDropdownVisible: false
          });
        }
      },
      NOTE: {
        DELETE_ITEM: () => {
          this.props.deleteItem(this.props.id);
        },
        UNDELETE_ITEM: () => {
          this.props.undeleteItem(this.props.id);
        },
        MOVE_ITEM: event => {
          this.setState({
            projectDropdownVisible: !this.state.projectDropdownVisible,
            dueDateDropdownVisible: false,
            scheduledDateDropdownVisible: false,
            repeatDropdownVisible: false
          });
          event.preventDefault();
        },
        ESCAPE: () => {
          this.description.blur();
          this.setState({
            projectDropdownVisible: false,
            dueDateDropdownVisible: false,
            scheduledDateDropdownVisible: false,
            descriptionEditable: false,
            repeatDropdownVisible: false
          });
        }
      }
    };
  }

  handleDescriptionChange(text) {
    this.props.updateItemDescription(
      this.props.id,
      this.props.type + " " + text
    );
  }

  showDueDateDropdown() {
    this.setState({
      dueDateDropdownVisible: !this.state.dueDateDropdownVisible,
      scheduledDateDropdownVisible: false,
      projectDropdownVisible: false,
      repeatDropdownVisible: false
    });
    this.setState({
      dueDateDropdownVisible: !this.state.dueDateDropdownVisible
    });
  }

  setRepeatRule(r) {
    this.props.setRepeatRule(this.props.id, r);
    this.setState({ repeatDropdownVisible: false });
    this.container.focus();
  }

  setScheduledDate(d) {
    this.props.setScheduledDate(this.props.id, d);
    this.setState({ scheduledDateDropdownVisible: false });
    this.container.focus();
  }

  setDueDate(d) {
    this.props.setDueDate(this.props.id, d);
    this.setState({ dueDateDropdownVisible: false });
    this.container.focus();
  }

  moveItem(projectId) {
    this.props.moveItem(this.props.id, projectId);
    this.setState({ projectDropdownVisible: false });
    this.container.focus();
  }

  createSubTask(text) {
    this.props.createSubTask(this.props.id, text, this.props.projectId);
    this.setState({ quickAddContainerVisible: false });
  }

  // TODO: Refactor the shit out of this
  handleKeyPress(event) {
    let currentKeyPresses = this.state.keyPresses;
    // Remove the first value in the array (3 is the max shortcut matching length)
    currentKeyPresses =
      currentKeyPresses.length >= 3
        ? currentKeyPresses.slice(1)
        : currentKeyPresses;
    currentKeyPresses.push(event.key);

    // Clear keypress history if using the arrow keys. Enables quick scrolling
    if (event.key == "ArrowUp" || event.key == "ArrowDown") {
      setTimeout(() => {
        this.setState({
          keyPresses: []
        });
      }, 200);
      // After 1s remove the first item in the array
    } else {
      this.setState({}, () => {
        setTimeout(() => {
          this.setState({
            keyPresses: this.state.keyPresses.slice(1)
          });
        }, 500);
      });
    }
    // TODO handle not matching
    // TODO handle multiple key bindings for each action
    for (let [key, value] of Object.entries(keymap.ITEM)) {
      currentKeyPresses.forEach((k, v) => {
        if (v < currentKeyPresses.length) {
          const combo = k + " " + currentKeyPresses[v + 1];
          if (combo == value) {
            this.handlers["TODO"][key](event);
            return;
          }
          const single = k;
          if (single == value) {
            this.handlers["TODO"][key](event);
            return;
          }
        }
      });
    }
  }

  handleIconClick() {
    if (this.props.type == "TODO") {
      this.props.completed
        ? this.props.uncompleteItem(this.props.id)
        : this.props.completeItem(this.props.id);
      return;
    }
    return;
  }

  handleExpand() {
    this.props.hiddenChildren
      ? this.props.showChildren(this.props.id)
      : this.props.hideChildren(this.props.id);
    return;
  }

  render() {
    // Rehydrate the string repeating rule to an object
    const repeat = this.props.repeat
      ? RRule.fromString(this.props.repeat)
      : this.props.repeat;
    return (
      <ThemeProvider theme={theme}>
        <div key={this.props.id} id={this.props.id}>
          <Container
            hidden={this.props.hidden}
            noIndentation={this.props.noIndentation}
            isSubtask={this.props.parentId != null}
            onKeyDown={this.handleKeyPress}
            id={this.props.id}
            tabIndex={this.props.hidden ? "-1" : "0"}
            itemType={this.props.type}
            badshortcutAnimation={this.state.badshortcutAnimation}
            ref={container => (this.container = container)}
          >
            <div style={{ gridArea: "EXPAND" }}>
              <ExpandIcon
                expanded={this.props.hiddenChildren}
                onClick={this.handleExpand}
                visible={this.props.children && this.props.children.length > 0}
              />
            </div>
            <div style={{ gridArea: "TYPE" }}>
              <IconButton
                onClick={this.handleIconClick}
                visible={true}
                icon={
                  this.props.type == "NOTE"
                    ? "NOTE"
                    : this.props.completed
                    ? "TODO_CHECKED"
                    : "TODO_UNCHECKED"
                }
              />
            </div>
            <Body id="body" completed={this.props.completed}>
              <EditableText
                editable={this.state.descriptionEditable}
                readOnly={this.props.completed}
                input={removeItemTypeFromString(this.props.text)}
                onUpdate={this.handleDescriptionChange}
                singleline={true}
              />
            </Body>
            <Project visible={this.props.showProject}>
              {getProjectNameById(this.props.projectId, this.props.projects)}
            </Project>
            <div style={{ gridArea: "SCHEDULED" }}>
              <DateRenderer
                visible={this.props.scheduledDate}
                completed={this.props.completed}
                type="SCHEDULED"
                position="flex-start"
                date={this.props.scheduledDate}
              />
            </div>
            <div style={{ gridArea: "DUE" }}>
              <DateRenderer
                visible={this.props.dueDate}
                completed={this.props.completed}
                type="DUE"
                position="center"
                date={this.props.dueDate}
              />
            </div>
            <div style={{ gridArea: "REPEAT" }}>
              <DateRenderer
                visible={repeat}
                completed={this.props.completed}
                type="REPEAT"
                position="flex-end"
                repeat={repeat}
              />
            </div>
          </Container>
          <QuickAddContainer visible={this.state.quickAddContainerVisible}>
            <EditableItem
              onSubmit={text => this.createSubTask(text)}
              readOnly={false}
            />
          </QuickAddContainer>
          <DatePicker
            key={"sd" + this.props.id}
            placeholder={"Schedule to: "}
            visible={this.state.scheduledDateDropdownVisible}
            onSubmit={this.setScheduledDate}
          />
          <DatePicker
            key={"dd" + this.props.id}
            placeholder={"Due on: "}
            visible={this.state.dueDateDropdownVisible}
            onSubmit={this.setDueDate}
          />
          <RepeatPicker
            key={"rp" + this.props.id}
            placeholder={"Repeat: "}
            visible={this.state.repeatDropdownVisible}
            onSubmit={this.setRepeatRule}
          />
          <ProjectDropdown
            key={"p" + this.props.id}
            placeholder={"Move to: "}
            visible={this.state.projectDropdownVisible}
            onSubmit={this.moveItem}
          />
        </div>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  projects: state.projects
});
const mapDispatchToProps = dispatch => ({
  createSubTask: (parentId, text, projectId) => {
    const childId = uuidv4();
    dispatch(createItem(childId, text, projectId, parentId));
    dispatch(addChildItem(childId, parentId));
  },
  updateItemDescription: (id, itemId) => {
    dispatch(updateItemDescription(id, itemId));
  },
  uncompleteItem: id => {
    dispatch(uncompleteItem(id));
  },
  completeItem: id => {
    dispatch(completeItem(id));
  },
  undeleteItem: id => {
    dispatch(undeleteItem(id));
  },
  deleteItem: id => {
    dispatch(deleteItem(id));
  },
  moveItem: (id, projectId) => {
    dispatch(moveItem(id, projectId));
  },
  setScheduledDate: (id, date) => {
    dispatch(setScheduledDate(id, date));
  },
  setDueDate: (id, date) => {
    dispatch(setDueDate(id, date));
  },
  setRepeatRule: (id, rule) => {
    dispatch(setRepeatRule(id, rule));
  },
  hideChildren: id => {
    dispatch(hideChildren(id));
  },
  showChildren: id => {
    dispatch(showChildren(id));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Item);
