import { connect } from "react-redux";
import ItemList from "../components/ItemList";

const getFilteredItems = (items, filter) => {
  switch (filter) {
    case "SHOW_ALL":
      return items;
    case "SHOW_INBOX":
      return items.filter(i => i.project == 0);
    case "SHOW_COMPLETED":
      return items.filter(i => i.completed);
    case "SHOW_SCHEDULED":
      return items.filter(i => i.scheduledDate != null);
    case "SHOW_UNSCHEDULED":
      return items.filter(i => i.scheduledDate == null);
    default:
      throw new Error("Unknown filter: " + filter);
  }
};

const mapStateToProps = state => ({
  items: getFilteredItems(state.items, state.visibilityFilter)
});

const mapDispatchToProps = dispatch => ({});
const FilteredItemList = connect(
  mapStateToProps,
  mapDispatchToProps
)(ItemList);

export default FilteredItemList;
