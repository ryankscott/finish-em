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

import { headShake, fadeInDown } from "react-animations";

import {
  moveItem,
  updateItemDescription,
  completeItem,
  deleteItem,
  undeleteItem,
  uncompleteItem,
  setScheduledDate,
  setRepeatRule,
  setParent,
  removeParent,
  setDueDate
} from "../actions";
import { theme } from "../theme";
import ProjectDropdown from "../components/ProjectDropdown";
import DatePicker from "../components/DatePicker";
import RepeatPicker from "../components/RepeatPicker";
import { formatRelativeDate, removeItemTypeFromString } from "../utils";

const headShakeAnimation = keyframes`${headShake}`;
const fadeInDownAnimation = keyframes`${fadeInDown}`;
const ItemContainer = styled.div`
  animation: 1s
    ${props => (props.badshortcutAnimation ? headShakeAnimation : "none")};
  font-family: ${props => props.theme.font.sansSerif};
  font-size: ${props => props.theme.fontSizes.medium};
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-areas:
    "type body body body body body body body body project"
    "scheduled scheduled scheduled .  due due due repeat repeat repeat";
  height: ${props => (props.itemType == "TODO" ? "50px" : "30px")};
  width: ${props => (props.parentId ? "600px" : "650px")}
  border: 1px solid;
  border-color: ${props => props.theme.colours.borderColour};
  padding: 5px 5px 5px 5px;
  margin: 0px 0px 0px 10px;
  margin-left: ${props => (props.parentId ? "50px" : "0px")}
  align-items: center;
  cursor: pointer;
  color: ${props => theme.colours.defaultTextColour};
  :focus {
    background-color: ${props => props.theme.colours.focusBackgroundColour};
    border-color: ${props => props.theme.colours.focusBorderColour};
  }
`;

const ItemType = styled.div`
  grid-area: type;
  text-align: center;
  font-size: ${props => props.theme.fontSizes.xsmall};
  color: ${props => props.theme.colours.altTextColour};
  background-color: ${props =>
    props.itemType == "TODO"
      ? props.completed
        ? props.theme.colours.secondaryColour
        : props.theme.colours.primaryColour
      : props.theme.colours.penternaryColour};
  margin: 2px 5px 2px 2px;
  padding: 2px 0px;
  border-radius: 5px;
`;

const ItemProject = styled.div`
  grid-area: project;
  text-align: center;
  font-size: ${props => props.theme.fontSizes.xsmall};
  color: ${props => props.theme.colours.altTextColour};
  background-color: ${props => props.theme.colours.tertiaryColour};
  margin: 2px 5px 2px 2px;
  padding: 2px 0px;
  border-radius: 5px;
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

const RepeatText = styled.div`
  grid-area: repeat;
  font-size: ${props => props.theme.fontSizes.xsmall};
  color: ${props => props.theme.colours.defaultTextColour}
  margin: 2px 5px 2px 2px;
  padding: 2px 5px;
  border-radius: 5px;
  text-align: end;
  text-decoration: ${props =>
    props.completed == true ? "line-through" : null};
`;

const ItemBody = styled.span`
  grid-area: body;
  font-size: ${props => props.theme.fontSizes.regular};
  text-decoration: ${props =>
    props.completed == true ? "line-through" : null};
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
      preventDefaultEvents: false,
      badshortcutAnimation: false
    };
    this.setScheduledDate = this.setScheduledDate.bind(this);
    this.setDueDate = this.setDueDate.bind(this);
    this.setRepeatRule = this.setRepeatRule.bind(this);
    this.moveItem = this.moveItem.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);

    this.hotkeyHandler = {
      REMOVE_PARENT: event => {
        if (this.state.preventDefaultEvents == true) {
          return;
        }
        // TODO: this doesn't handle if the previous item is a sibling of another item
        this.props.removeParent(event.target.id, props.prevItemId);
      },
      SET_PARENT: event => {
        if (this.state.preventDefaultEvents == true) {
          return;
        }
        this.props.setParent(event.target.id, props.prevItemId);
      },
      SET_SCHEDULED_DATE: event => {
        if (this.state.preventDefaultEvents == true) {
          return;
        }
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
        if (this.state.preventDefaultEvents == true) {
          return;
        }
        this.setState({
          dueDateDropdownVisible: !this.state.dueDateDropdownVisible,
          scheduledDateDropdownVisible: false,
          projectDropdownVisible: false,
          repeatDropdownVisible: false
        });
        event.preventDefault();
      },
      COMPLETE: event => {
        if (this.state.preventDefaultEvents == true) {
          return;
        }
        this.props.completeItem(event.target.id);
      },
      UNCOMPLETE: event => {
        if (this.state.preventDefaultEvents == true) {
          return;
        }
        this.props.uncompleteItem(event.target.id);
      },
      REPEAT: event => {
        if (this.state.preventDefaultEvents == true) {
          return;
        }
        this.setState({
          repeatDropdownVisible: !this.state.repeatDropdownVisible,
          scheduledDateDropdownVisible: false,
          dueDateDropdownVisible: false,
          projectDropdownVisible: false
        });
        event.preventDefault();
      },
      DELETE: event => {
        if (this.state.preventDefaultEvents == true) {
          return;
        }
        this.props.deleteItem(event.target.id);
      },
      UNDELETE: event => {
        if (this.state.preventDefaultEvents == true) {
          return;
        }
        this.props.undeleteItem(event.target.id);
      },
      MOVE: event => {
        if (this.state.preventDefaultEvents == true) {
          return;
        }
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
            descriptionEditable: false,
            preventDefaultEvents: false
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
      EDIT: event => {
        if (this.state.preventDefaultEvents == true) {
          return;
        }
        this.setState(
          {
            descriptionEditable: true,
            preventDefaultEvents: true
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
          preventDefaultEvents: false,
          repeatDropdownVisible: false
        });
      }
    };
  }

  onComponentWillMount() {}

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

  handleKeyPress(event) {
    if (this.props.type == "TODO") {
      // Only able to action not completed or not deleted items
      if (!(this.props.completed || this.props.deleted)) {
        switch (event.key) {
          case "s":
            this.hotkeyHandler.SET_SCHEDULED_DATE(event);
            return;
          case "c":
            this.hotkeyHandler.COMPLETE(event);
            return;
          case "d":
            this.hotkeyHandler.SET_DUE_DATE(event);
            return;
          case "r":
            this.hotkeyHandler.REPEAT(event);
            return;
        }
      } else {
        switch (event.key) {
          case "u":
            this.hotkeyHandler.UNCOMPLETE(event);
            return;
        }
      }
    }
    console.log(event.key);
    switch (event.key) {
      case "Enter":
        this.hotkeyHandler.ENTER(event);
        return;
      case "Escape":
        this.hotkeyHandler.ESCAPE(event);
        return;
      case "m":
        this.hotkeyHandler.MOVE(event);
        return;
      case "x":
        this.hotkeyHandler.DELETE(event);
        return;
      case "z":
        this.hotkeyHandler.UNDELETE(event);
        return;
      case "e":
        this.hotkeyHandler.EDIT(event);
        return;
      case ">":
        this.hotkeyHandler.SET_PARENT(event);
        return;
      case "<":
        this.hotkeyHandler.REMOVE_PARENT(event);
        return;
      case "Meta":
        return;
      case "?":
        return;
      case "Tab":
        return;
      case "Shift":
        return;
      default:
        if (this.state.descriptionEditable == false) {
          this.setState(
            {
              badshortcutAnimation: true
            },
            () =>
              setTimeout(
                () => this.setState({ badshortcutAnimation: false }),
                200
              )
          );
        }
        return;
    }
  }

  // TODO: Consider extracting DueDate to a component
  // TODO: Proper locales
  render() {
    // const project = this.props.projects.find(
    //   p => (p.id = this.props.projectId)
    // );
    // Rehydrate the string repeating rule to an object
    const repeat = this.props.repeat
      ? RRule.fromString(this.props.repeat)
      : this.props.repeat;
    return (
      <ThemeProvider theme={theme}>
        <ItemContainer
          onKeyDown={this.handleKeyPress}
          id={this.props.id}
          tabIndex="0"
          parentId={this.props.parentId}
          itemType={this.props.type}
          badshortcutAnimation={this.state.badshortcutAnimation}
          ref={container => (this.container = container)}
        >
          <ItemType itemType={this.props.type} completed={this.props.completed}>
            {this.props.completed ? "DONE" : this.props.type}
          </ItemType>
          <ItemBody
            ref={c => (this.description = c)}
            contentEditable={this.state.descriptionEditable}
            completed={this.props.completed}
            suppressContentEditableWarning={true}
          >
            {removeItemTypeFromString(this.props.text)}
          </ItemBody>
          {this.props.dueDate && (
            <DueDate completed={this.props.completed}>
              {"Due: " + formatRelativeDate(this.props.dueDate)}
            </DueDate>
          )}
          {this.props.repeat && (
            <RepeatText completed={this.props.completed}>
              {"Repeating: " + repeat.toText()}
            </RepeatText>
          )}
          {this.props.scheduledDate && (
            <ScheduledDate completed={this.props.completed}>
              {"Scheduled: " + formatRelativeDate(this.props.scheduledDate)}
            </ScheduledDate>
          )}
        </ItemContainer>
        <DatePicker
          placeholder={"Schedule to: "}
          visible={this.state.scheduledDateDropdownVisible}
          onSubmit={this.setScheduledDate}
        />
        <DatePicker
          placeholder={"Due on: "}
          visible={this.state.dueDateDropdownVisible}
          onSubmit={this.setDueDate}
        />
        <RepeatPicker
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
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  projects: state.projects
});
const mapDispatchToProps = dispatch => ({
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
  setParent: (id, parentId) => {
    dispatch(setParent(id, parentId));
  },
  removeParent: (id, parentId) => {
    dispatch(removeParent(id, parentId));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Item);
