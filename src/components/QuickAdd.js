import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import { createItem } from "../actions";
import EditableItem from "./EditableItem";

class QuickAdd extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(id, text) {
    this.props.onSubmit(text);
  }

  render() {
    return <EditableItem onSubmit={this.handleSubmit} readOnly={false} />;
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
)(QuickAdd);
