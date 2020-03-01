import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";
import { createItem } from "../actions";
import EditableItem from "./EditableItem";
import uuidv4 from "uuid/v4";

class QuickAdd extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <EditableItem
        onSubmit={text => this.props.onSubmit(text, this.props.projectId)}
        readOnly={false}
      />
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
  // TODO: fix creating things on the quick add
  onSubmit: (text, projectId) => {
    dispatch(createItem(uuidv4(), text, projectId, null));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QuickAdd);
