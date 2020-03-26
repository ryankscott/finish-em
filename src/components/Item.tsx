import React, { Component } from "react";
import { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import { RRule, rrulestr } from "rrule";
import uuidv4 from "uuid/v4";
import { Uuid } from "@typed/uuid";
import { ItemType, ProjectType } from "../interfaces";
import { Body, Container, Project, QuickAdd } from "./styled/item";

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
import IconButton from "./IconButton";
import DateRenderer from "./DateRenderer";
import {
  getProjectNameById,
  removeItemTypeFromString,
  formatRelativeDate
} from "../utils";
import { parseISO } from "date-fns";

interface ItemProps {
  item: ItemType;
  noIndentation: boolean;
  showProject: boolean;
  keymap: Object;
  projects: ProjectType[];
  updateItemDescription: (text: string) => void;
  setRepeatRule: (id: Uuid, rule: RRule) => void;
  setScheduledDate: (id: Uuid, date: Date) => void;
  setDueDate: (id: Uuid, date: Date) => void;
  completeItem: (id: Uuid) => void;
  uncompleteItem: (id: Uuid) => void;
  moveItem: (id: Uuid, projectId: Uuid) => void;
  createSubTask(id: Uuid, text: string, projectId: Uuid);
  showChildren: (id: Uuid) => void;
  hideChildren: (id: Uuid) => void;
}

interface ItemState {
  projectDropdownVisible: boolean;
  scheduledDateDropdownVisible: boolean;
  dueDateDropdownVisible: boolean;
  repeatDropdownVisible: boolean;
  descriptionEditable: boolean;
  quickAddContainerVisible: boolean;
  keyPresses: string[];
}

class Item extends Component<ItemProps, ItemState> {
  private container: React.RefObject<HTMLInputElement>;
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
    this.container = React.createRef();
    this.handlers = {
      TODO: {
        // EDIT_ITEM_DESC: event => {
        //   console.log(this.description);
        // },
        NEXT_ITEM: event => {
          // If it's a parent element we need to get the first child
          if (this.props.item.children.length > 0) {
            const nextItem = event.target.parentNode.nextSibling;
            if (nextItem) {
              nextItem.firstChild.focus();
              return;
            }
          }
          // If it's a child
          if (this.props.item.parentId != null) {
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
          if (this.props.item.children.length > 0) {
            const prevItem = event.target.parentNode.previousSibling;
            if (prevItem) {
              prevItem.firstChild.focus();
              return;
            }
          }
          // If it's a child
          if (this.props.item.parentId != null) {
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
          this.props.item.hiddenChildren
            ? this.props.showChildren(this.props.item.id)
            : this.props.hideChildren(this.props.item.id);
        },
        SET_SCHEDULED_DATE: event => {
          if (this.props.item.deleted || this.props.item.completed) return;
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
          if (this.props.item.deleted || this.props.item.completed) return;
          this.setState({
            dueDateDropdownVisible: !this.state.dueDateDropdownVisible,
            scheduledDateDropdownVisible: false,
            projectDropdownVisible: false,
            repeatDropdownVisible: false
          });
          event.preventDefault();
        },
        CREATE_SUBTASK: () => {
          if (this.props.item.deleted || this.props.item.completed) return;
          this.setState({
            quickAddContainerVisible: !this.state.quickAddContainerVisible,
            scheduledDateDropdownVisible: false,
            dueDateDropdownVisible: false,
            projectDropdownVisible: false,
            repeatDropdownVisible: false
          });
        },
        COMPLETE_ITEM: () => {
          if (this.props.item.deleted || this.props.item.completed) return;
          this.props.completeItem(this.props.item.id);
        },
        UNCOMPLETE_ITEM: () => {
          if (this.props.item.deleted) return;
          this.props.uncompleteItem(this.props.item.id);
        },
        REPEAT_ITEM: event => {
          if (this.props.item.deleted || this.props.item.completed) return;
          this.setState({
            repeatDropdownVisible: !this.state.repeatDropdownVisible,
            scheduledDateDropdownVisible: false,
            dueDateDropdownVisible: false,
            projectDropdownVisible: false
          });
          event.preventDefault();
        },
        DELETE_ITEM: () => {
          if (this.props.item.deleted) return;
          this.props.deleteItem(this.props.item.id);
        },
        UNDELETE_ITEM: () => {
          this.props.undeleteItem(this.props.item.id);
        },
        MOVE_ITEM: event => {
          if (this.props.item.deleted || this.props.item.completed) return;
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
        NEXT_ITEM: event => {
          // If it's a parent element we need to get the first child
          if (this.props.item.children.length > 0) {
            const nextItem = event.target.parentNode.nextSibling;
            if (nextItem) {
              nextItem.firstChild.focus();
              return;
            }
          }
          // If it's a child
          if (this.props.item.parentId != null) {
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
          if (this.props.item.children.length > 0) {
            const prevItem = event.target.parentNode.previousSibling;
            if (prevItem) {
              prevItem.firstChild.focus();
              return;
            }
          }
          // If it's a child
          if (this.props.item.parentId != null) {
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
        DELETE_ITEM: () => {
          this.props.deleteItem(this.props.item.id);
        },
        UNDELETE_ITEM: () => {
          this.props.undeleteItem(this.props.item.id);
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
      this.props.item.id,
      this.props.item.type.concat(" ", text)
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
    this.props.setRepeatRule(this.props.item.id, r);
    this.setState({ repeatDropdownVisible: false });
    this.container.current.focus();
  }

  setScheduledDate(d) {
    this.props.setScheduledDate(this.props.item.id, d);
    this.setState({ scheduledDateDropdownVisible: false });
    this.container.current.focus();
  }

  setDueDate(d) {
    this.props.setDueDate(this.props.item.id, d);
    this.setState({ dueDateDropdownVisible: false });
    this.container.current.focus();
  }

  moveItem(projectId) {
    this.props.moveItem(this.props.item.id, projectId);
    this.setState({ projectDropdownVisible: false });
    this.container.current.focus();
  }

  createSubTask(text) {
    this.props.createSubTask(
      this.props.item.id,
      text,
      this.props.item.projectId
    );
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
    for (let [key, value] of Object.entries(this.props.keymap)) {
      currentKeyPresses.forEach((k, v) => {
        if (v < currentKeyPresses.length) {
          const combo = k + " " + currentKeyPresses[v + 1];
          if (combo == value) {
            const handler = this.handlers[this.props.item.type][key];
            handler ? handler(event) : null;
            return;
          }
          const single = k;
          if (single == value) {
            const handler = this.handlers[this.props.item.type][key];
            handler ? handler(event) : null;
            return;
          }
        }
      });
    }
  }

  handleIconClick(e) {
    if (this.props.item.type == "TODO") {
      this.props.item.completed
        ? this.props.uncompleteItem(this.props.item.id)
        : this.props.completeItem(this.props.item.id);
    }
    return;
  }

  handleExpand() {
    this.props.item.hiddenChildren
      ? this.props.showChildren(this.props.item.id)
      : this.props.hideChildren(this.props.item.id);
    return;
  }

  render() {
    // TODO #22: Somehow we sometimes get a null item being passed in
    if (!this.props.item) return null;
    const repeat = this.props.item.repeat
      ? rrulestr(this.props.item.repeat).toText()
      : "";
    const dueDate = this.props.item.dueDate
      ? formatRelativeDate(parseISO(this.props.item.dueDate))
      : null;
    const scheduledDate = this.props.item.scheduledDate
      ? formatRelativeDate(parseISO(this.props.item.scheduledDate))
      : null;
    return (
      <ThemeProvider theme={theme}>
        <div key={this.props.item.id} id={this.props.item.id}>
          <Container
            hidden={this.props.item.hidden}
            noIndentation={this.props.noIndentation}
            isSubtask={this.props.item.parentId != null}
            onKeyDown={this.handleKeyPress}
            id={this.props.item.id}
            tabIndex={this.props.item.hidden ? -1 : 0}
            itemType={this.props.item.type}
            ref={this.container}
          >
            <div style={{ gridArea: "EXPAND" }}>
              <ExpandIcon
                expanded={!this.props.item.hiddenChildren}
                onClick={this.handleExpand}
                visible={
                  this.props.item.children &&
                  this.props.item.children.length > 0
                }
              />
            </div>
            <div style={{ gridArea: "TYPE" }}>
              <IconButton
                onClick={this.handleIconClick}
                visible={true}
                icon={
                  this.props.item.type == "NOTE"
                    ? "NOTE"
                    : this.props.item.completed
                    ? "TODO_CHECKED"
                    : "TODO_UNCHECKED"
                }
              />
            </div>
            <Body id="body" completed={this.props.item.completed}>
              <EditableText
                editable={this.state.descriptionEditable}
                readOnly={this.props.item.completed}
                input={removeItemTypeFromString(this.props.item.text)}
                onUpdate={this.handleDescriptionChange}
                singleline={true}
              />
            </Body>
            <Project visible={this.props.showProject}>
              {getProjectNameById(
                this.props.item.projectId,
                this.props.projects
              )}
            </Project>
            <div style={{ gridArea: "SCHEDULED" }}>
              <DateRenderer
                visible={this.props.item.scheduledDate != null}
                completed={this.props.item.completed}
                type="SCHEDULED"
                position="flex-start"
                text={scheduledDate}
              />
            </div>
            <div style={{ gridArea: "DUE" }}>
              <DateRenderer
                visible={this.props.item.dueDate != null}
                completed={this.props.item.completed}
                type="DUE"
                position="center"
                text={dueDate}
              />
            </div>
            <div style={{ gridArea: "REPEAT" }}>
              <DateRenderer
                visible={this.props.item.repeat != null}
                completed={this.props.item.completed}
                type="REPEAT"
                position="flex-end"
                text={repeat}
              />
            </div>
          </Container>
          <QuickAdd visible={this.state.quickAddContainerVisible}>
            <EditableItem
              onSubmit={text => this.createSubTask(text)}
              readOnly={false}
            />
          </QuickAdd>
          <DatePicker
            key={"sd" + this.props.item.id}
            placeholder={"Schedule to: "}
            visible={this.state.scheduledDateDropdownVisible}
            onSubmit={this.setScheduledDate}
          />
          <DatePicker
            key={"dd" + this.props.item.id}
            placeholder={"Due on: "}
            visible={this.state.dueDateDropdownVisible}
            onSubmit={this.setDueDate}
          />
          <RepeatPicker
            key={"rp" + this.props.item.id}
            placeholder={"Repeat: "}
            visible={this.state.repeatDropdownVisible}
            onSubmit={this.setRepeatRule}
          />
          <ProjectDropdown
            key={"p" + this.props.item.id}
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
