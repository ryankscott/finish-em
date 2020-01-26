import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";

import { connect } from "react-redux";
import { configure, HotKeys, getApplicationKeyMap } from "react-hotkeys";
import { formatRelative, isBefore, parseISO, isValid, isAfter } from "date-fns";
import { enGB } from "date-fns/esm/locale";

import {
  deleteItem,
  refileItem,
  completeItem,
  uncompleteItem,
  setScheduledDate,
  setDueDate
} from "../actions";
import { theme } from "../theme";
import ProjectDropdown from "../components/ProjectDropdown";
import DatePicker from "../components/DatePicker";
import {
  formatDateStringRelativeToNow,
  isDateStringBeforeToday,
  removeItemTypeFromString
} from "../utils";

const ItemContainer = styled.div`
  font-family: ${props => props.theme.font.sansSerif};
  font-size: ${props => props.theme.fontSizes.medium};
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-areas:
    "type body body body body body body body body body"
    "scheduled scheduled scheduled scheduled . . due due due due";
  height: 50px;
  width: 650px;
  border: 1px solid;
  border-color: ${props => props.theme.colours.borderColour};
  padding: 5px 5px 5px 5px;
  margin: 0px 0px 0px 10px;
  align-items: center;
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
  cursor: pointer;
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

// React-hotkeys configuration
configure({
  logLevel: "debug"
});

class Item extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projectDropdownVisible: false,
      scheduledDatePopupVisible: false,
      dueDatePopupVisible: false
    };
    this.refileItem = this.refileItem.bind(this);
    this.setScheduledDate = this.setScheduledDate.bind(this);
    this.setDueDate = this.setDueDate.bind(this);

    this.hotkeyHandler = {
      TEST: event => {
        console.log(getApplicationKeyMap());
      },
      SET_SCHEDULED_DATE: event => {
        console.log("scheduling");
        this.setState({
          scheduledDatePopupVisible: true
        });
      },
      SET_DUE_DATE: event => {
        this.setState({
          dueDatePopupVisible: true
        });
      },
      DELETE: event => {
        // TODO: This is probably wrong
        this.props.deleteItem(event.target.id);
      },
      COMPLETE: event => {
        this.props.completeItem(event.target.id);
      },
      UNCOMPLETE: event => {
        this.props.uncompleteItem(event.target.id);
      },
      REFILE: event => {
        console.log("refiling");
        this.setState({
          projectDropdownVisible: true
        });
      },
      ESCAPE: event => {
        this.setState({
          projectDropdownVisible: false,
          dueDatePopupVisible: false,
          scheduledDatePopupVisible: false
        });
      }
      // // TODO: Yikes that's a complicated meat-ball
      // MOVE_UP: event => {
      //   event.target.parentElement.previousSibling &&
      //     event.target.parentElement.previousSibling.firstChild.focus();
      // },
      // MOVE_DOWN: event => {
      //   event.target.parentElement.nextSibling &&
      //     event.target.parentElement.nextSibling.firstChild.focus();
      // }
    };
    this.keyMaps = {
      TODO: {
        SET_SCHEDULED_DATE: { sequence: "s", action: "keyup" },
        SET_DUE_DATE: "d",
        DELETE: "i x",
        REFILE: "i r",
        COMPLETE: "i w d",
        UNCOMPLETE: "i w t",
        ESCAPE: ["Escape", "j k"],
        // MOVE_UP: ["k", "ArrowUp"],
        // MOVE_DOWN: ["j", "ArrowDown"],
        TEST: "t"
      },
      NOTE: {
        DELETE: "i x",
        REFILE: "i r",
        ESCAPE: ["Escape", "j k"],
        // MOVE_UP: ["k", "ArrowUp"],
        // MOVE_DOWN: ["j", "ArrowDown"],
        TEST: "t"
      }
    };
  }

  // TODO: This is a hack so that I can have access to the props...

  setScheduledDate(d) {
    this.props.setScheduledDate(this.props.id, d);
    this.setState({ scheduledDatePopupVisible: false });
  }

  setDueDate(d) {
    this.props.setDueDate(this.props.id, d);
    this.setState({ dueDatePopupVisible: false });
  }

  // TODO: This feels wrong but I can't find a better way to get the id of the item
  refileItem(projectId) {
    this.props.refileItem(this.props.id, projectId);
    this.setState({ projectDropdownVisible: false });
  }

  // TODO: Consider extracting DueDate to a component
  // TODO: Proper locales
  render() {
    return (
      <ThemeProvider theme={theme}>
        <HotKeys
          keyMap={this.keyMaps[this.props.type]}
          handlers={this.hotkeyHandler}
          tabIndex={0}
        >
          <ItemContainer id={this.props.id} tabIndex={0}>
            <ItemType itemType={this.props.type}>
              {this.props.completed ? "DONE" : this.props.type}
            </ItemType>
            <ItemBody completed={this.props.completed}>
              {removeItemTypeFromString(this.props.text)}
            </ItemBody>
            {this.props.dueDate && (
              <DueDate>
                {"Due: " +
                  formatRelative(this.props.dueDate, new Date(), {
                    locale: enGB
                  })}
              </DueDate>
            )}
            {this.props.scheduledDate && (
              <ScheduledDate>
                {"Scheduled: " +
                  formatRelative(this.props.scheduledDate, new Date(), {
                    locale: enGB
                  })}
              </ScheduledDate>
            )}
          </ItemContainer>
          <DatePicker
            visible={this.state.scheduledDatePopupVisible}
            onSubmit={this.setScheduledDate}
            close={() => this.setState({ scheduledDatePopupVisible: false })}
            placeholder={"Schedule: "}
          />
          <DatePicker
            visible={this.state.dueDatePopupVisible}
            onSubmit={this.setDueDate}
            close={() => this.setState({ dueDatePopupVisible: false })}
            placeholder={"Due: "}
          />
          <ProjectDropdown
            onSubmit={this.refileItem}
            visible={this.state.projectDropdownVisible}
          />
        </HotKeys>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({
  uncompleteItem: id => {
    dispatch(uncompleteItem(id));
  },
  completeItem: id => {
    dispatch(completeItem(id));
  },
  deleteItem: id => {
    dispatch(deleteItem(id));
  },
  refileItem: (id, projectId) => {
    dispatch(refileItem(id, projectId));
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
