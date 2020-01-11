import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import {
  Editor,
  EditorState,
  ContentState,
  CompositeDecorator,
  SelectionState,
  Modifier
} from "draft-js";
import styled from "styled-components";
import chrono from "chrono-node";
import { createItem } from "../actions";
import { validateItemString } from "../utils";
import Item from "./Item";

class QuickAdd2 extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(id, text) {
    this.props.onSubmit(text);
  }

  render() {
    return <Item onSubmit={this.handleSubmit} readOnly={false} />;
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
  onSubmit: text => {
    dispatch(createItem(text));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QuickAdd2);
