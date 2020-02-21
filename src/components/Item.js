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

import { headShake } from "react-animations";

import {
  archiveItem,
  unarchiveItem,
  moveItem,
  updateItemDescription,
  completeItem,
  deleteItem,
  undeleteItem,
  uncompleteItem,
  setScheduledDate,
  setDueDate
} from "../actions";
import { theme } from "../theme";
import ProjectDropdown from "../components/ProjectDropdown";
import DatePicker from "../components/DatePicker";
import { formatRelativeDate, removeItemTypeFromString } from "../utils";

const headShakeAnimation = keyframes`${headShake}`;
const ItemContainer = styled.div`
  animation: 1s ${props => (props.animate ? headShakeAnimation : "none")};
  font-family: ${props => props.theme.font.sansSerif};
  font-size: ${props => props.theme.fontSizes.medium};
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-areas:
    "type body body body body body body body body tag"
    "scheduled scheduled scheduled scheduled . . due due due due";
  height: ${props => (props.itemType == "TODO" ? "50px" : "30px")};
  width: 650px;
  border: 1px solid;
  border-color: ${props => props.theme.colours.borderColour};
  padding: 5px 5px 5px 5px;
  margin: 0px 0px 0px 10px;
  align-items: center;
  cursor: pointer;
  color: ${props =>
    props.archived ? "#CCC" : theme.colours.defaultTextColour};
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
      ? props.theme.colours.primaryColour
      : props.theme.colours.penternaryColour};
  margin: 2px 5px 2px 2px;
  padding: 2px 0px;
  border-radius: 5px;
`;

const ItemTag = styled.div`
  grid-area: tag;
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
`;

const ScheduledDate = styled.div`
  grid-area: scheduled;
  font-size: ${props => props.theme.fontSizes.xsmall};
  color: ${props => props.theme.colours.defaultTextColour}
  margin: 2px 5px 2px 2px;
  padding: 2px 5px;
  border-radius: 5px;
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
      scheduledDatePopupVisible: false,
      dueDatePopupVisible: false,
      descriptionEditable: false,
      preventDefaultEvents: false,
      animate: false
    };
    this.setScheduledDate = this.setScheduledDate.bind(this);
    this.setDueDate = this.setDueDate.bind(this);
    this.moveItem = this.moveItem.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);

    this.hotkeyHandler = {
      SET_SCHEDULED_DATE: event => {
        if (this.state.preventDefaultEvents == true) {
          return;
        }
        this.setState({
          scheduledDatePopupVisible: !this.state.scheduledDatePopupVisible,
          dueDatePopupVisible: false,
          projectDropdownVisible: false
        });
      },
      SET_DUE_DATE: event => {
        if (this.state.preventDefaultEvents == true) {
          return;
        }
        this.setState({
          dueDatePopupVisible: !this.state.dueDatePopupVisible,
          scheduledDatePopupVisible: false,
          projectDropdownVisible: false
        });
      },
      ARCHIVE: event => {
        if (this.state.preventDefaultEvents == true) {
          return;
        }
        this.props.archiveItem(event.target.id);
      },
      UNARCHIVE: event => {
        if (this.state.preventDefaultEvents == true) {
          return;
        }
        this.props.unarchiveItem(event.target.id);
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
          dueDatePopupVisible: false,
          scheduledDatePopupVisible: false
        });
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
          dueDatePopupVisible: false,
          scheduledDatePopupVisible: false,
          descriptionEditable: false,
          preventDefaultEvents: false
        });
      }
    };
  }

  setScheduledDate(d) {
    this.props.setScheduledDate(this.props.id, d);
    this.setState({ scheduledDatePopupVisible: false });
  }

  setDueDate(d) {
    this.props.setDueDate(this.props.id, d);
    this.setState({ dueDatePopupVisible: false });
  }

  moveItem(projectId) {
    this.props.moveItem(this.props.id, projectId);
    this.setState({ projectDropdownVisible: false });
  }

  handleKeyPress(event) {
    if (this.props.type == "TODO") {
      switch (event.key) {
        case "s":
          this.hotkeyHandler.SET_SCHEDULED_DATE(event);
          return;
        case "c":
          this.hotkeyHandler.COMPLETE(event);
          return;
        case "u":
          this.hotkeyHandler.UNCOMPLETE(event);
          return;
        case "d":
          this.hotkeyHandler.SET_DUE_DATE(event);
          return;
      }
    }
    console.log(event.key);
    switch (event.key) {
      case "a":
        this.hotkeyHandler.ARCHIVE(event);
        return;
      case "r":
        this.hotkeyHandler.UNARCHIVE(event);
        return;
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
      case "Meta":
        return;
      case "Tab":
        return;
      case "Shift":
        return;
      default:
        if (this.state.descriptionEditable == false) {
          this.setState(
            {
              animate: true
            },
            () => setTimeout(() => this.setState({ animate: false }), 200)
          );
        }
        return;
    }
  }

  // TODO: Consider extracting DueDate to a component
  // TODO: Proper locales
  render() {
    return (
      <ThemeProvider theme={theme}>
        <ItemContainer
          onKeyDown={this.handleKeyPress}
          id={this.props.id}
          tabIndex="0"
          archived={this.props.archived}
          itemType={this.props.type}
          animate={this.state.animate}
        >
          <ItemType itemType={this.props.type}>
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
            <DueDate>
              {"Due: " + formatRelativeDate(this.props.dueDate)}
            </DueDate>
          )}
          {this.props.scheduledDate && (
            <ScheduledDate>
              {"Scheduled: " + formatRelativeDate(this.props.scheduledDate)}
            </ScheduledDate>
          )}
        </ItemContainer>
        <DatePicker
          placeholder={"Schedule to: "}
          visible={this.state.scheduledDatePopupVisible}
          onSubmit={this.setScheduledDate}
        />
        <DatePicker
          placeholder={"Due on: "}
          visible={this.state.dueDatePopupVisible}
          onSubmit={this.setDueDate}
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

const mapStateToProps = state => ({});
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
  archiveItem: id => {
    dispatch(archiveItem(id));
  },
  unarchiveItem: id => {
    dispatch(unarchiveItem(id));
  },
  moveItem: (id, projectId) => {
    dispatch(moveItem(id, projectId));
  },
  setScheduledDate: (id, date) => {
    dispatch(setScheduledDate(id, date));
  },
  setDueDate: (id, date) => {
    dispatch(setDueDate(id, date));
  }
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Item);
