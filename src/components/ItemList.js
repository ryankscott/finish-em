import React, { Component } from "react";
import PropTypes from "prop-types";
import Item from "../components/Item";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";
import { getItemById } from "../utils";

import { connect } from "react-redux";
import { deleteItem, refileItem } from "../actions";

const NoItemText = styled.p`
  color: ${props => props.theme.colours.disabledTextColour};
  font-family: ${props => props.theme.font.sansSerif};
  font-size: ${props => props.theme.fontSizes.small};
  padding-left: 10px;
`;

const Container = styled.div`
  margin: 10px 0px;
`;

function ItemList(props) {
  return (
    <ThemeProvider theme={theme}>
      <Container>
        {props.items.map((item, index) => {
          const isSubtask = item.parentId != null;
          if (!props.showSubtasks && isSubtask) return;
          return (
            <div>
              <Item
                {...item}
                key={item.id}
                onDelete={props.deleteItem}
                onRefile={props.refileItem}
                noIndentation={props.noIndentation}
              />
              {item.children &&
                item.children.map(c => {
                  const childItem = getItemById(c, props.items);
                  return (
                    <Item
                      {...childItem}
                      key={c}
                      onDelete={props.deleteItem}
                      onRefile={props.refileItem}
                      noIndentation={props.noIndentation}
                    />
                  );
                })}
            </div>
          );
        })}
        {props.items.length == 0 && <NoItemText>No items</NoItemText>}
      </Container>
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
