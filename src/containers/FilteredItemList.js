import React, { Component } from "react";
import { connect } from "react-redux";
import ItemList from "../components/ItemList";

// TODO: Need to better express filters and params
const getFilteredItems = (items, filter, params) => {
  switch (filter) {
    case "SHOW_ALL":
      return items;
    case "SHOW_INBOX":
      return items.filter(i => i.projectId == null);
    case "SHOW_COMPLETED":
      return items.filter(i => i.completed);
    case "SHOW_SCHEDULED":
      return items.filter(i => i.scheduledDate != null);
    case "SHOW_UNSCHEDULED":
      return items.filter(i => i.scheduledDate == null);
    case "SHOW_FROM_PROJECT":
      return items.filter(i => i.projectId == params.projectId);
    default:
      throw new Error("Unknown filter: " + filter);
  }
};

class FilteredItemList extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ItemList
        items={getFilteredItems(
          this.props.items,
          this.props.filter,
          this.props.params
        )}
      />
    );
  }
}

export default FilteredItemList;
