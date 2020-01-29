import React, { Component } from "react";
import PropTypes from "prop-types";
import Item from "../components/Item";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";

import { connect } from "react-redux";
import { deleteItem, refileItem } from "../actions";

const NoItemText = styled.p`
  color: ${props => props.theme.colours.disabledTextColour};
  font-family: ${props => props.theme.font.sansSerif};
  font-size: ${props => props.theme.fontSizes.small};
  padding-left: 10px;
`;

function ItemList(props) {
  return (
    <ThemeProvider theme={theme}>
      {props.items.map(i => {
        return (
          <Item
            {...i}
            key={i.id}
            onDelete={props.deleteItem}
            onRefile={props.refileItem}
          />
        );
      })}

      {props.items.length == 0 && <NoItemText>No items</NoItemText>}
    </ThemeProvider>
  );
}

// TODO: Add PropTypes
const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
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
