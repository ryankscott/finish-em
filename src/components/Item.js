import React, { Component } from "react";
import styled from "styled-components";

import { connect } from "react-redux";
import { createItem } from "../actions";

const ItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 25px;
  width: 450px;
  border: 1px solid #ccc;
  padding: 5px 0px 5px 5px;
  align-items: center;
  :focus {
    background-color: #e5e5e5;
  }
`;

// TODO: Conditional styling
const ItemType = styled.div`
  color: #ffffff;
  background-color: #ff9e80;
  border: 1px solid #ff8e80;
  margin: 2px 5px 2px 2px;
  padding: 2px 5px;
  border-radius: 5px;
  cursor: pointer;
`;

class Item extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ItemContainer id={this.props.id} tabIndex="0">
        <ItemType>{this.props.type}</ItemType>
        {this.props.text} - {this.props.scheduledDate}
        {this.props.dueDate}
      </ItemContainer>
    );
  }
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Item);
