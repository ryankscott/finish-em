import React from "react";
import { connect } from "react-redux";
import { createItem } from "../actions";
import EditableItem from "./EditableItem";
import uuidv4 from "uuid/v4";

const QuickAdd = props => (
  <EditableItem
    onSubmit={text => props.onSubmit(text, props.projectId)}
    readOnly={false}
  />
);

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
  // TODO: fix creating things on the quick add
  onSubmit: (text: string, projectId: string) => {
    dispatch(createItem(uuidv4(), text, projectId, null));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(QuickAdd);
