import React, { Component, KeyboardEvent } from "react";
import { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import { RRule, rrulestr } from "rrule";
import uuidv4 from "uuid/v4";
import { Uuid } from "@typed/uuid";
import { ItemType, ProjectType } from "../interfaces";
import { Body, Container, Project, QuickAdd } from "./styled/Item";

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
  setDueDate
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
  formatRelativeDate,
  getItemById
} from "../utils";
import { parseISO } from "date-fns";

interface ItemProps extends ItemType {
  noIndentOnSubtasks: boolean;
  showProject: boolean;
  keymap: Object;
  projects: ProjectType[];
  items: ItemType[];
  updateItemDescription: (text: string) => void;
  setRepeatRule: (id: Uuid, rule: RRule) => void;
  setScheduledDate: (id: Uuid, date: Date) => void;
  setDueDate: (id: Uuid, date: Date) => void;
  completeItem: (id: Uuid) => void;
  uncompleteItem: (id: Uuid) => void;
  moveItem: (id: Uuid, projectId: Uuid) => void;
  createSubTask: (id: Uuid, text: string, projectId: Uuid) => void;
  deleteItem: (id: Uuid) => void;
  undeleteItem: (id: Uuid) => void;
}

interface ItemState {
  projectDropdownVisible: boolean;
  scheduledDateDropdownVisible: boolean;
  dueDateDropdownVisible: boolean;
  repeatDropdownVisible: boolean;
  descriptionEditable: boolean;
  quickAddContainerVisible: boolean;
  keyPresses: string[];
  hideChildren: boolean;
}

class Item extends Component<ItemProps, ItemState> {
  private container: React.RefObject<HTMLInputElement>;
  private editor: React.RefObject<HTMLInputElement>;
  private quickAdd: React.RefObject<HTMLInputElement>;
  handlers: {};
  constructor(props: ItemProps) {
    super(props);
    this.state = {
      projectDropdownVisible: false,
      scheduledDateDropdownVisible: false,
      dueDateDropdownVisible: false,
      repeatDropdownVisible: false,
      descriptionEditable: false,
      quickAddContainerVisible: false,
      hideChildren: false,
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
    this.editor = React.createRef();
    this.quickAdd = React.createRef();
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
          this.state.hideChildren
            ? this.setState({ hideChildren: false })
            : this.setState({ hideChildren: true });
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
        CREATE_SUBTASK: event => {
          if (this.props.deleted || this.props.completed) return;
          this.setState({
            quickAddContainerVisible: !this.state.quickAddContainerVisible,
            scheduledDateDropdownVisible: false,
            dueDateDropdownVisible: false,
            projectDropdownVisible: false,
            repeatDropdownVisible: false
          });
          this.quickAdd.current.focus();
          event.preventDefault();
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
        DELETE_ITEM: () => {
          if (this.props.deleted) return;
          this.props.deleteItem(this.props.id);
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
        },
        EDIT_ITEM_DESC: event => {
          this.editor.current.focus();
          event.preventDefault();
        }
      },
      NOTE: {
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

  handleDescriptionChange(text: string) {
    this.props.updateItemDescription(
      this.props.id,
      this.props.type.concat(" ", text)
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

  setRepeatRule(r: RRule) {
    this.props.setRepeatRule(this.props.id, r);
    this.setState({ repeatDropdownVisible: false });
    this.container.current.focus();
  }

  setScheduledDate(d: Date) {
    this.props.setScheduledDate(this.props.id, d);
    this.setState({ scheduledDateDropdownVisible: false });
    this.container.current.focus();
  }

  setDueDate(d: Date) {
    this.props.setDueDate(this.props.id, d);
    this.setState({ dueDateDropdownVisible: false });
    this.container.current.focus();
  }

  moveItem(projectId: Uuid) {
    this.props.moveItem(this.props.id, projectId);
    this.setState({ projectDropdownVisible: false });
    this.container.current.focus();
  }

  createSubTask(text: string) {
    this.props.createSubTask(this.props.id, text, this.props.projectId);
    this.setState({ quickAddContainerVisible: false });
  }

  // TODO: Refactor the shit out of this
  handleKeyPress(event: KeyboardEvent<HTMLDivElement>) {
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
            const handler = this.handlers[this.props.type][key];
            handler ? handler(event) : null;
            return;
          }
          const single = k;
          if (single == value) {
            const handler = this.handlers[this.props.type][key];
            handler ? handler(event) : null;
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
    }
    return;
  }

  handleExpand() {
    this.state.hideChildren
      ? this.setState({
          hideChildren: false
        })
      : this.setState({ hideChildren: true });
  }

  render() {
    const repeat = this.props.repeat
      ? rrulestr(this.props.repeat).toText()
      : "";
    const dueDate = this.props.dueDate
      ? formatRelativeDate(parseISO(this.props.dueDate))
      : null;
    const scheduledDate = this.props.scheduledDate
      ? formatRelativeDate(parseISO(this.props.scheduledDate))
      : null;
    return (
      <ThemeProvider theme={theme}>
        <div key={this.props.id} id={this.props.id}>
          <Container
            noIndentOnSubtasks={this.props.noIndentOnSubtasks}
            isSubtask={this.props.parentId != null}
            onKeyDown={this.handleKeyPress}
            id={this.props.id}
            tabIndex={0}
            itemType={this.props.type}
            ref={this.container}
          >
            <div style={{ gridArea: "EXPAND" }}>
              <ExpandIcon
                expanded={!this.state.hideChildren}
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
                ref={this.editor}
                key={this.props.id}
                readOnly={this.props.completed}
                input={removeItemTypeFromString(this.props.text)}
                onUpdate={this.handleDescriptionChange}
                singleline={true}
              />
            </Body>
            <Project visible={this.props.showProject}>
              {this.props.showProject
                ? getProjectNameById(this.props.projectId, this.props.projects)
                : "null"}
            </Project>
            <div style={{ gridArea: "SCHEDULED" }}>
              <DateRenderer
                visible={this.props.scheduledDate != null}
                completed={this.props.completed}
                type="SCHEDULED"
                position="flex-start"
                text={scheduledDate}
              />
            </div>
            <div style={{ gridArea: "DUE" }}>
              <DateRenderer
                visible={this.props.dueDate != null}
                completed={this.props.completed}
                type="DUE"
                position="center"
                text={dueDate}
              />
            </div>
            <div style={{ gridArea: "REPEAT" }}>
              <DateRenderer
                visible={this.props.repeat != null}
                completed={this.props.completed}
                type="REPEAT"
                position="flex-end"
                text={repeat}
              />
            </div>
          </Container>
          <QuickAdd visible={this.state.quickAddContainerVisible}>
            <EditableItem
              ref={this.quickAdd}
              readOnly={false}
              focus={this.state.quickAddContainerVisible}
              onSubmit={text => this.createSubTask(text)}
            />
          </QuickAdd>
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
        {!this.state.hideChildren &&
          this.props.children?.map(c => {
            const childItem = getItemById(c, this.props.items);
            // Sometimes the child item has been filtered out, so we don't want to render an empty container
            if (!childItem) return;
            return (
              <Item
                {...childItem}
                key={c}
                items={this.props.items}
                noIndentOnSubtasks={this.props.noIndentOnSubtasks}
                showProject={this.props.showProject}
                keymap={this.props.keymap}
                projects={this.props.projects}
                updateItemDescription={this.props.updateItemDescription}
                setScheduledDate={this.props.setScheduledDate}
                setDueDate={this.props.setDueDate}
                setRepeatRule={this.props.setRepeatRule}
                moveItem={this.props.moveItem}
                completeItem={this.props.completeItem}
                uncompleteItem={this.props.uncompleteItem}
                createSubTask={this.props.createSubTask}
                deleteItem={this.props.deleteItem}
                undeleteItem={this.props.undeleteItem}
              />
            );
          })}
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  projects: state.projects,
  items: state.items
});
const mapDispatchToProps = dispatch => ({
  createSubTask: (parentId: Uuid, text: string, projectId: Uuid) => {
    const childId = uuidv4();
    dispatch(createItem(childId, text, projectId));
    dispatch(addChildItem(childId, parentId));
  },
  updateItemDescription: (id: Uuid, text: string) => {
    dispatch(updateItemDescription(id, text));
  },
  uncompleteItem: (id: Uuid) => {
    dispatch(uncompleteItem(id));
  },
  completeItem: (id: Uuid) => {
    dispatch(completeItem(id));
  },
  undeleteItem: (id: Uuid) => {
    dispatch(undeleteItem(id));
  },
  deleteItem: (id: Uuid) => {
    dispatch(deleteItem(id));
  },
  moveItem: (id: Uuid, projectId: Uuid) => {
    dispatch(moveItem(id, projectId));
  },
  setScheduledDate: (id: Uuid, date: Date) => {
    dispatch(setScheduledDate(id, date));
  },
  setDueDate: (id: Uuid, date: Date) => {
    dispatch(setDueDate(id, date));
  },
  setRepeatRule: (id: Uuid, rule: RRule) => {
    dispatch(setRepeatRule(id, rule));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Item);
