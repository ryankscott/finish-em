import React from "react";
import { connect } from "react-redux";
import { createItem } from "../actions";
import EditableItem from "./EditableItem";
import uuidv4 from "uuid/v4";
import { Uuid } from "@typed/uuid";

interface QuickAddProps {
  projectId: Uuid;
  onSubmit: (text: string, projectId: Uuid) => void;
}
const QuickAdd = (props: QuickAddProps) => (
  <EditableItem
    onSubmit={(text) => props.onSubmit(text, props.projectId)}
    readOnly={false}
  />
);

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({
  onSubmit: (text: string, projectId: Uuid) => {
    dispatch(createItem(uuidv4(), text, projectId, null));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(QuickAdd);
