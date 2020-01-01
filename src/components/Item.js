import React, { Component } from "react";
import styled from "styled-components";

import { connect } from "react-redux";
import { createItem } from "../actions";

const ItemContainer = styled.div``;

class Item extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <li>
        <p>
          {this.props.type} - {this.props.text}
        </p>
        <p>{this.props.scheduledDate}</p>
        <p>{this.props.dueDate}</p>
      </li>
    );
  }
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Item);
