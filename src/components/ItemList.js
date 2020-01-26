import React, { Component } from "react";
import PropTypes from "prop-types";
import Item from "../components/Item";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";

import { connect } from "react-redux";
import { updateItem, createItem, deleteItem, refileItem } from "../actions";

const NoItemText = styled.p`
  color: ${props => props.theme.colours.disabledTextColour};
  font-family: ${props => props.theme.font.sansSerif};
  font-size: ${props => props.theme.fontSizes.small};
  padding-left: 10px;
`;

class ItemList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        {this.props.items.map(i => {
          return (
            <Item
              id={i.id}
              key={i.id}
              type={i.type}
              text={i.text}
              completed={i.completed}
              projectID={i.projectID}
              scheduledDate={i.scheduledDate}
              dueDate={i.dueDate}
              onDelete={this.props.deleteItem}
              onRefile={this.props.refileItem}
            />
          );
        })}
        {this.props.items.length == 0 && <NoItemText>No items</NoItemText>}
      </ThemeProvider>
    );
  }
}

// TODO: Add PropTypes
const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
  updateItem: (id, text) => {
    dispatch(updateItem(id, text));
  },
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
)(ItemList);
