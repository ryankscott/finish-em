import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
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

import {
  archiveItem,
  refileItem,
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
import { removeItemTypeFromString } from "../utils";

const ItemContainer = styled.div`
  font-family: ${props => props.theme.font.sansSerif};
  font-size: ${props => props.theme.fontSizes.medium};
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-areas:
    "type body body body body body body body body tag"
    "scheduled scheduled scheduled scheduled . . due due due due";
  height: 50px;
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
      dueDatePopupVisible: false
    };
    this.setScheduledDate = this.setScheduledDate.bind(this);
    this.setDueDate = this.setDueDate.bind(this);
    this.refileItem = this.refileItem.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);

    this.hotkeyHandler = {
      SET_SCHEDULED_DATE: event => {
        this.setState({
          scheduledDatePopupVisible: !this.state.scheduledDatePopupVisible,
          dueDatePopupVisible: false,
          projectDropdownVisible: false
        });
      },
      SET_DUE_DATE: event => {
        this.setState({
          dueDatePopupVisible: !this.state.dueDatePopupVisible,
          scheduledDatePopupVisible: false,
          projectDropdownVisible: false
        });
      },
      ARCHIVE: event => {
        this.props.archiveItem(event.target.id);
      },
      COMPLETE: event => {
        this.props.completeItem(event.target.id);
      },
      UNCOMPLETE: event => {
        this.props.uncompleteItem(event.target.id);
      },
      DELETE: event => {
        this.props.deleteItem(event.target.id);
      },
      UNDELETE: event => {
        this.props.undeleteItem(event.target.id);
      },
      REFILE: event => {
        this.setState({
          projectDropdownVisible: !this.state.projectDropdownVisible,
          dueDatePopupVisible: false,
          scheduledDatePopupVisible: false
        });
      },
      ESCAPE: event => {
        this.setState({
          projectDropdownVisible: false,
          dueDatePopupVisible: false,
          scheduledDatePopupVisible: false
        });
      }
    };
  }
  componentDidMount() {}

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

  handleKeyPress(event) {
    console.log("Key pressed:  " + event.key);
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

    switch (event.key) {
      case "a":
        this.hotkeyHandler.ARCHIVE(event);
        return;
      case "escape":
        this.hotkeyHandler.ESCAPE(event);
        return;
      case "r":
        this.hotkeyHandler.REFILE(event);
        return;
      case "x":
        this.hotkeyHandler.DELETE(event);
        return;
      case "z":
        this.hotkeyHandler.UNDELETE(event);
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
        >
          <ItemType itemType={this.props.type}>
            {this.props.completed ? "DONE" : this.props.type}
          </ItemType>
          <ItemBody completed={this.props.completed}>
            {this.props.type == "NOTE" &&
              format(this.props.createdAt, "dd/MM/yyyy") + " - "}
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
          key={"p" + this.props.id}
          placeholder={"Refile to: "}
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
  undeleteItem: id => {
    dispatch(undeleteItem(id));
  },
  deleteItem: id => {
    dispatch(deleteItem(id));
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
