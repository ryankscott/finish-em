import React, { Component } from "react";
import PropTypes from "prop-types";
import Item from "../components/Item";

import { connect } from "react-redux";
import { updateItem, createItem, deleteItem, refileItem } from "../actions";

class ItemList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        {this.props.items.map(i => {
          return (
            <Item
              id={i.id}
              key={i.id}
              type={i.type}
              text={i.text}
              projectID={i.projectID}
              scheduledDate={i.scheduledDate}
              dueDate={i.dueDate}
              readOnly={false}
              onSubmit={this.props.updateItem}
              onDelete={this.props.deleteItem}
              onRefile={this.props.refileItem}
            />
          );
        })}
      </div>
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
