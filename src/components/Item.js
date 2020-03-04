import React, { Component } from "react";
import styled, { ThemeProvider, keyframes } from "styled-components";
import { connect } from "react-redux";
import {
  format,
  formatRelative,
  isBefore,
  parseISO,
  isValid,
  isAfter
} from "date-fns";
import { enGB } from "date-fns/esm/locale";
import { RRule } from "rrule";
import uuidv4 from "uuid/v4";

import { headShake, fadeInDown } from "react-animations";
import { HotKeys } from "react-hotkeys";
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
import { formatRelativeDate, removeItemTypeFromString } from "../utils";
import {
  repeatIcon,
  dueIcon,
  scheduledIcon,
  todoUncheckedIcon,
  todoCheckedIcon,
  noteIcon,
  expandedIcon,
  collapsedIcon
} from "../assets/icons";
const headShakeAnimation = keyframes`${headShake}`;

const Container = styled.div`
  animation: 1s
    ${props => (props.badshortcutAnimation ? headShakeAnimation : "none")};
  font-family: ${props => props.theme.font.sansSerif};
  font-size: ${props => props.theme.fontSizes.medium};
  display: ${props => (props.hidden ? "none" : "grid")};
  grid-template-columns: 20px 40px repeat(9, 1fr);
  grid-template-areas:
    "collapse type body body body body body body body body body"
    "collapse scheduled scheduled scheduled .  due due due repeat repeat repeat";
  min-height: ${props => (props.itemType == "TODO" ? "50px" : "30px")};
  width: ${props =>
    props.isSubtask && !props.noIndentation ? "600px" : "650px"}
  border-bottom: 1px solid;
  border-top: 1px solid;
  border-color: ${props => props.theme.colours.borderColour};
  padding: 5px 5px 5px 5px;
  margin-left: ${props =>
    props.isSubtask && !props.noIndentation ? "50px" : "0px"}
  align-items: center;
  cursor: pointer;
  color: ${props => theme.colours.defaultTextColour};
  :focus {
    background-color: ${props => props.theme.colours.focusBackgroundColour};
    border-color: ${props => props.theme.colours.focusBorderColour};
  }
`;

const QuickAddContainer = styled.div`
  display: ${props => (props.visible ? "block" : "none")};
`;

const Icon = styled.div`
  display: flex;
  grid-area: type;
  justify-content: start;
  padding-left: 5px;
`;

const ExpandIcon = styled.div`
  display: flex;
  grid-area: collapse;
  justify-content: center;
  align-self: start;
  margin-top: 10px;
`;

const DueDate = styled.div`
  grid-area: due;
  font-size: ${props => props.theme.fontSizes.xsmall};
  color: ${props => props.theme.colours.defaultTextColour}
  margin: 2px 5px 2px 2px;
  padding: 2px 5px;
  border-radius: 5px;
  text-align: end;
  text-decoration: ${props =>
    props.completed == true ? "line-through" : null};
`;

const ScheduledDate = styled.div`
  grid-area: scheduled;
  font-size: ${props => props.theme.fontSizes.xsmall};
  color: ${props => props.theme.colours.defaultTextColour}
  margin: 2px 5px 2px 2px;
  padding: 2px 5px;
  border-radius: 5px;
  text-decoration: ${props =>
    props.completed == true ? "line-through" : null};
`;

const RepeatDate = styled.div`
  grid-area: repeat;
  font-size: ${props => props.theme.fontSizes.xsmall};
  color: ${props => props.theme.colours.defaultTextColour}
  margin: 2px 5px 2px 2px;
  padding: 2px 5px;
  border-radius: 5px;
  text-decoration: ${props =>
    props.completed == true ? "line-through" : null};
`;

const SubTextContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: ${props => props.position};
  margin-left: ${props => (props.position == "start" ? "32px" : "0px")};
`;

const SubText = styled.div`
  padding: 0px 5px;
`;

const Body = styled.span`
  padding: 8px 0px;
  grid-area: body;
  font-size: ${props => props.theme.fontSizes.regular};
  text-decoration: ${props =>
    props.completed == true ? "line-through" : null};
`;

const Subtasks = styled.div`
  grid-area: subtasks;
  font-size: ${props => props.theme.fontSizes.xsmall};
  color: ${props => props.theme.colours.defaultTextColour};
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
      badshortcutAnimation: false,
      quickAddContainerVisible: false
    };
    this.setScheduledDate = this.setScheduledDate.bind(this);
    this.setDueDate = this.setDueDate.bind(this);
    this.setRepeatRule = this.setRepeatRule.bind(this);
    this.moveItem = this.moveItem.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleExpand = this.handleExpand.bind(this);

    this.handlers = {
      TODO: {
        TOGGLE_CHILDREN: event => {
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
        CREATE_SUBTASK: event => {
          if (this.props.deleted || this.props.completed) return;
          this.setState({
            quickAddContainerVisible: !this.state.quickAddContainerVisible,
            scheduledDateDropdownVisible: false,
            dueDateDropdownVisible: false,
            projectDropdownVisible: false,
            repeatDropdownVisible: false
          });
          console.log("Checklist");
        },
        COMPLETE_ITEM: event => {
          if (this.props.deleted || this.props.completed) return;
          this.props.completeItem(event.target.id);
        },
        UNCOMPLETE_ITEM: event => {
          if (this.props.deleted) return;
          this.props.uncompleteItem(event.target.id);
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
        UNDELETE_ITEM: event => {
          this.props.undeleteItem(event.target.id);
        },
        EDIT_ITEM_DESCRIPTION: event => {
          if (this.props.deleted || this.props.completed) return;
          this.setState(
            {
              descriptionEditable: true
            },
            () => {
              this.description.focus();
            }
          );
          event.preventDefault();
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
        ENTER: event => {
          this.setState(
            {
              descriptionEditable: false
            },
            () => {
              this.description.blur();
            }
          );
          // TODO: This is kinda silly because the TEXT expects the type at the front
          this.props.updateItemDescription(
            event.target.parentElement.id,
            this.props.type + " " + event.target.innerText
          );
        },
        ESCAPE: event => {
          this.description.blur();
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
        DELETE_ITEM: event => {
          this.props.deleteItem(event.target.id);
        },
        UNDELETE_ITEM: event => {
          this.props.undeleteItem(event.target.id);
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
        ENTER: event => {
          this.setState(
            {
              descriptionEditable: false
            },
            () => {
              this.description.blur();
            }
          );
          // TODO: This is kinda silly because the TEXT expects the type at the front
          this.props.updateItemDescription(
            event.target.parentElement.id,
            this.props.type + " " + event.target.innerText
          );
        },
        EDIT_ITEM_DESCRIPTION: event => {
          this.setState(
            {
              descriptionEditable: true
            },
            () => {
              this.description.focus();
            }
          );
          event.preventDefault();
        },
        ESCAPE: event => {
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

  showDueDateDropdown(e) {
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

  handleKeyPress(event) {
    switch (event.key) {
      case "Enter":
        this.handlers[this.props.type].ENTER(event);
        return;
      case "Escape":
        this.handlers[this.props.type].ESCAPE(event);
    }
  }

  handleExpand() {
    this.props.hiddenChildren
      ? this.props.showChildren(this.props.id)
      : this.props.hideChildren(this.props.id);
    return;
  }

  // TODO: Consider extracting DueDate to a component
  // TODO: Proper locales
  render() {
    // Rehydrate the string repeating rule to an object
    const repeat = this.props.repeat
      ? RRule.fromString(this.props.repeat)
      : this.props.repeat;
    return (
      <ThemeProvider theme={theme}>
        <HotKeys keyMap={keymap.ITEM} handlers={this.handlers[this.props.type]}>
          <Container
            hidden={this.props.hidden}
            noIndentation={this.props.noIndentation}
            isSubtask={this.props.parentId != null}
            onKeyDown={this.handleKeyPress}
            id={this.props.id}
            tabIndex="0"
            itemType={this.props.type}
            badshortcutAnimation={this.state.badshortcutAnimation}
            ref={container => (this.container = container)}
          >
            {this.props.children && this.props.children.length > 0 && (
              <ExpandIcon onClick={this.handleExpand}>
                {this.props.hiddenChildren ? collapsedIcon : expandedIcon}
              </ExpandIcon>
            )}
            <Icon>
              {this.props.type == "NOTE"
                ? noteIcon
                : this.props.completed
                ? todoCheckedIcon
                : todoUncheckedIcon}
            </Icon>
            <Body
              ref={c => (this.description = c)}
              contentEditable={this.state.descriptionEditable}
              completed={this.props.completed}
              suppressContentEditableWarning={true}
            >
              {removeItemTypeFromString(this.props.text)}
            </Body>
            {this.props.scheduledDate && (
              <ScheduledDate completed={this.props.completed}>
                <SubTextContainer key={"scheduled"} position={"start"}>
                  {scheduledIcon}
                  <SubText key={"subtext-scheduled"}>
                    {formatRelativeDate(this.props.scheduledDate)}
                  </SubText>
                </SubTextContainer>
              </ScheduledDate>
            )}
            {this.props.dueDate && (
              <DueDate completed={this.props.completed}>
                <SubTextContainer key={"due"} position={"center"}>
                  {dueIcon}
                  <SubText key={"subtext-due"}>
                    {formatRelativeDate(this.props.dueDate)}{" "}
                  </SubText>
                </SubTextContainer>
              </DueDate>
            )}
            {this.props.repeat && (
              <RepeatDate completed={this.props.completed}>
                <SubTextContainer key={"repeat"} position={"flex-end"}>
                  {repeatIcon}
                  <SubText key={"subtext-repeat"}>{repeat.toText()}</SubText>
                </SubTextContainer>
              </RepeatDate>
            )}
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
        </HotKeys>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Item);
