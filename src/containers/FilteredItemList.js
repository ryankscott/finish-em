import React, { Component } from "react";
import { connect } from "react-redux";
import ItemList from "../components/ItemList";
import { endOfDay, isSameDay, isAfter, isPast } from "date-fns";
import { getTasksAndSubtasks } from "../utils";

const comparators = {
  STATUS: (a, b) => {
    if (a.completed == true && b.completed == false) {
      return 1;
    } else if (a.completed == false && b.completed == true) {
      return -1;
    }
    return 0;
  },
  DUE: (a, b) => {
    if (a.dueDate == null) {
      return 1;
    } else if (isAfter(a.dueDate, b.dueDate)) {
      return 1;
    } else if (isAfter(b.dueDate, a.dueDate)) {
      return -1;
    }
    return 0;
  },
  SCHEDULED: (a, b) => {
    if (a.scheduledDate == null) {
      return 1;
    } else if (isAfter(a.scheduledDate, b.scheduledDate)) {
      return 1;
    } else if (isAfter(b.scheduledDate, a.scheduledDate)) {
      return -1;
    }
    return 0;
  }
};

const sortItems = (items, criteria) => {
  switch (criteria) {
    case "STATUS":
      return items.sort(comparators.STATUS);
    case "DUE":
      return items.sort(comparators.DUE);
    case "SCHEDULED":
      return items.sort(comparators.SCHEDULED);
    default:
      return items;
  }
};
const filterItems = (items, filter, params) => {
  switch (filter) {
    case "SHOW_ALL":
      return items;
    case "SHOW_DELETED":
      return getTasksAndSubtasks(items, i => i.deleted == true);
    case "SHOW_INBOX":
      return getTasksAndSubtasks(
        items,
        i => i.projectId == null && i.deleted == false
      );
    case "SHOW_COMPLETED":
      return getTasksAndSubtasks(
        items,
        i => i.completed == true && i.deleted == false
      );
    case "SHOW_SCHEDULED":
      return getTasksAndSubtasks(
        items,
        i => i.scheduledDate != null && i.deleted == false
      );
    case "SHOW_SCHEDULED_ON_DAY":
      return getTasksAndSubtasks(
        items,
        i =>
          isSameDay(i.scheduledDate, params.scheduledDate) && i.deleted == false
      );
    case "SHOW_NOT_SCHEDULED":
      return getTasksAndSubtasks(
        items,
        i => i.type == "TODO" && i.scheduledDate == null && i.deleted == false
      );
    case "SHOW_FROM_PROJECT_BY_TYPE":
      return getTasksAndSubtasks(
        items,
        i =>
          i.projectId == params.projectId &&
          i.type == params.type &&
          i.deleted == false
      );
    case "SHOW_OVERDUE":
      return getTasksAndSubtasks(
        items,
        i =>
          isPast(endOfDay(i.scheduledDate)) ||
          (isPast(endOfDay(i.dueDate)) && i.deleted == false)
      );
    default:
      throw new Error("Unknown filter: " + filter);
  }
};

function FilteredItemList(props) {
  const filteredItems = filterItems(props.items, props.filter, props.params);
  const sortedItems = sortItems(filteredItems, props.sortCriteria);
  return (
    <ItemList
      noIndentation={props.noIndentation}
      showSubtasks={props.showSubtasks}
      items={sortedItems}
    />
  );
}

const mapStateToProps = state => ({
  items: state.items
});
const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FilteredItemList);
