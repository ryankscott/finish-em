import React, { Component } from "react";
import { connect } from "react-redux";
import ItemList from "../components/ItemList";
import { removeItemTypeFromString, isDateStringBeforeToday } from "../utils";
import { isSameDay, isAfter } from "date-fns";

function filterArray(array, filters, anyMatch) {
  const filterKeys = Object.keys(filters);
  return array.filter(item => {
    // validates all filter criteria
    const filterResults = filterKeys.map(key => {
      // ignores non-function predicates
      if (typeof filters[key] !== "function") return true;
      // TODO: Maybe change this to not care about the key
      return filters[key](item[key]);
    });
    // If anyMatch is set to true, if one of the filter matches it will return the item
    return anyMatch
      ? filterResults.some(f => f == true)
      : filterResults.every(f => f == true);
  });
}

const getFilteredItems = (items, filter, params) => {
  switch (filter) {
    case "SHOW_ALL":
      return items;
    case "SHOW_INBOX":
      return filterArray(items, {
        projectId: projectId => projectId == null
      });
    case "SHOW_COMPLETED":
      return filterArray(items, {
        completed: completed => completed == true
      });
    case "SHOW_SCHEDULED":
      return filterArray(items, {
        scheduledDate: scheduledDate => scheduledDate != null
      });
    case "SHOW_SCHEDULED_ON_DAY":
      return filterArray(items, {
        scheduledDate: scheduledDate =>
          isSameDay(scheduledDate, params.scheduledDate)
      });
    case "SHOW_NOT_SCHEDULED":
      return filterArray(items, {
        scheduledDate: scheduledDate => scheduledDate == null
      });
    case "SHOW_FROM_PROJECT_BY_TYPE":
      return filterArray(items, {
        projectId: projectId => projectId == params.projectId,
        type: type => type == params.type,
        archived: archived => archived == false
      });
    case "SHOW_ARCHIVED_FROM_PROJECT":
      return filterArray(items, {
        projectId: projectId => projectId == params.projectId,
        archived: archived => archived == true
      });
    case "SHOW_OVERDUE":
      return filterArray(
        items,
        {
          scheduledDate: scheduledDate => isAfter(new Date(), scheduledDate),
          dueDate: dueDate => isAfter(new Date(), dueDate)
        },
        true
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
