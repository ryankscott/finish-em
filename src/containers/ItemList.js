import React from "react";
import PropTypes from "prop-types";
import Item from "../components/Item";

import { connect } from "react-redux";

const ItemList = ({ items }) => {
  return (
    <ul>
      {Object.values(items).map(i => {
        return (
          <Item
            key={i.id}
            type={i.type}
            text={i.text}
            scheduledDate={i.scheduledDate}
            dueDate={i.dueDate}
          />
        );
      })}
    </ul>
  );
};

// TODO: Add PropTypes

const mapStateToProps = state => ({
  items: state.items
});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemList);
