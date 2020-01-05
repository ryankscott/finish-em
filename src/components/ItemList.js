import React, { Component } from "react";
import PropTypes from "prop-types";
import Item from "../components/Item";

import { connect } from "react-redux";

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
            />
          );
        })}
      </div>
    );
  }
}

// TODO: Add PropTypes
const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemList);
