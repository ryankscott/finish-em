import React, { Component } from "react";
import { connect } from "react-redux";
import ItemList from "../components/ItemList";
import { removeItemTypeFromString, isDateStringBeforeToday } from "../utils";
import { isSameDay, isAfter } from "date-fns";

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
    // TODO: Fix this comparison (string to ? )
    case "SHOW_SCHEDULED_ON_DAY":
      return items.filter(i =>
        isSameDay(i.scheduledDate, params.scheduledDate)
      );
    case "SHOW_UNSCHEDULED":
      return items.filter(i => i.scheduledDate == null);
    case "SHOW_FROM_PROJECT":
      return items.filter(
        i => i.projectId == params.projectId && i.type == params.type
      );
    case "SHOW_OVERDUE":
      return items.filter(
        i =>
          isAfter(new Date(), i.scheduledDate) || isAfter(new Date(), i.dueDate)
      );
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

const mapStateToProps = state => ({
  items: state.items
});
const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FilteredItemList);
