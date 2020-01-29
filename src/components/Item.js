import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import { formatRelative, isBefore, parseISO, isValid, isAfter } from "date-fns";
import { enGB } from "date-fns/esm/locale";
import * as Mousetrap from "Mousetrap";

import {
  archiveItem,
  refileItem,
  completeItem,
  uncompleteItem,
  setScheduledDate,
  setDueDate
} from "../actions";
import { theme } from "../theme";
import ProjectDropdown from "../components/ProjectDropdown";
import DatePicker from "../components/DatePicker";
import { removeItemTypeFromString } from "../utils";

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
  cursor: pointer;
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
      focussed: false
    };
    this.setScheduledDate = this.setScheduledDate.bind(this);
    this.setDueDate = this.setDueDate.bind(this);
    this.refileItem = this.refileItem.bind(this);

    this.hotkeyHandler = {
      SET_SCHEDULED_DATE: event => {
        console.log("scheduling");
        this.setState({
          scheduledDatePopupVisible: !this.state.scheduledDatePopupVisible,
          dueDatePopupVisible: false,
          projectDropdownVisible: false
        });
      },
      SET_DUE_DATE: event => {
        console.log("due date");
        this.setState({
          dueDatePopupVisible: !this.state.dueDatePopupVisible,
          scheduledDatePopupVisible: false,
          projectDropdownVisible: false
        });
      },
      ARCHIVE: event => {
        console.log("archiving");
        this.props.archiveItem(event.target.id);
      },
      COMPLETE: event => {
        console.log("completing");
        this.props.completeItem(event.target.id);
      },
      UNCOMPLETE: event => {
        console.log("uncompleting");
        this.props.uncompleteItem(event.target.id);
      },
      REFILE: event => {
        console.log("refiling");
        console.log("id: " + event.target.id);
        console.log("target: ");
        console.log(event.target);
        console.log("dropdown visible: " + this.state.projectDropdownVisible);
        console.log("is in focus: " + this.state.focussed);
        // if (!this.state.focussed) return;
        this.setState({
          projectDropdownVisible: !this.state.projectDropdownVisible,
          dueDatePopupVisible: false,
          scheduledDatePopupVisible: false
        });
      },
      ESCAPE: event => {
        console.log("escaping");
        this.setState({
          projectDropdownVisible: false,
          dueDatePopupVisible: false,
          scheduledDatePopupVisible: false
        });
      }
    };
  }
  componentDidMount() {
    Mousetrap.bind("r", this.hotkeyHandler.REFILE);
    Mousetrap.bind("s", this.hotkeyHandler.SET_SCHEDULED_DATE);
    Mousetrap.bind("c", this.hotkeyHandler.COMPLETE);
    Mousetrap.bind("u", this.hotkeyHandler.UNCOMPLETE);
    Mousetrap.bind("d", this.hotkeyHandler.SET_DUE_DATE);
    Mousetrap.bind("a", this.hotkeyHandler.ARCHIVE);
    Mousetrap.bind("escape", this.hotkeyHandler.ESCAPE);
  }
  componentWillUnmount() {
    Mousetrap.unbind("r");
    Mousetrap.unbind("s");
    Mousetrap.unbind("d");
    Mousetrap.unbind("a");
    Mousetrap.unbind("escape");
  }

  setScheduledDate(d) {
    this.props.setScheduledDate(this.props.id, d);
    this.setState({ scheduledDatePopupVisible: false });
  }

  setDueDate(d) {
    this.props.setDueDate(this.props.id, d);
    this.setState({ dueDatePopupVisible: false });
  }

  refileItem(projectId) {
    this.props.refileItem(this.props.id, projectId);
    this.setState({ projectDropdownVisible: false });
  }

  // TODO: Consider extracting DueDate to a component
  // TODO: Proper locales
  render() {
    return (
      <ThemeProvider theme={theme}>
        <ItemContainer
          onFocus={() => this.setState({ focussed: true })}
          onBlur={() => this.setState({ focussed: false })}
          id={this.props.id}
          tabIndex={0}
        >
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
          placeholder={this.props.id}
          visible={this.state.projectDropdownVisible}
          onSubmit={this.refileItem}
        />
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
  archiveItem: id => {
    dispatch(archiveItem(id));
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
