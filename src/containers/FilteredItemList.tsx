import React, { Component } from "react";
import { connect } from "react-redux";
import ItemList from "../components/ItemList";
import { endOfDay, isSameDay, isAfter, isPast } from "date-fns";
import { getTasksAndSubtasks } from "../utils";
import { selectStyles } from "../theme";
import Select from "react-select";
import styled from "styled-components";
import { Header1 } from "../components/Typography";
import { ItemType } from "../interfaces";
import { sortIcon } from "../assets/icons";

const comparators = {
  STATUS: (a, b) => {
    if (a.completed == true && b.completed == false) {
      return 1;
    } else if (a.completed == false && b.completed == true) {
      return -1;
    }
    return 0;
  },
  DUE_DESC: (a, b) => {
    if (a.dueDate == null) {
      return 1;
    } else if (isAfter(a.dueDate, b.dueDate)) {
      return 1;
    } else if (isAfter(b.dueDate, a.dueDate)) {
      return -1;
    }
    return 0;
  },
  DUE_ASC: (a, b) => {
    if (a.dueDate == null) {
      return -1;
    } else if (isAfter(a.dueDate, b.dueDate)) {
      return -1;
    } else if (isAfter(b.dueDate, a.dueDate)) {
      return 1;
    }
    return 0;
  },
  SCHEDULED_DESC: (a, b) => {
    if (a.scheduledDate == null) {
      return 1;
    } else if (isAfter(a.scheduledDate, b.scheduledDate)) {
      return 1;
    } else if (isAfter(b.scheduledDate, a.scheduledDate)) {
      return -1;
    }
    return 0;
  },
  SCHEDULED_ASC: (a, b) => {
    if (a.scheduledDate == null) {
      return -1;
    } else if (isAfter(a.scheduledDate, b.scheduledDate)) {
      return -1;
    } else if (isAfter(b.scheduledDate, a.scheduledDate)) {
      return 1;
    }
    return 0;
  }
};

const sortItems = (items, criteria) => {
  switch (criteria) {
    case "STATUS":
      return items.sort(comparators.STATUS);
    case "DUE_ASC":
      return items.sort(comparators.DUE_ASC);
    case "DUE_DESC":
      return items.sort(comparators.DUE_ASC);
    case "SCHEDULED_ASC":
      return items.sort(comparators.SCHEDULED_ASC);
    case "SCHEDULED_DESC":
      return items.sort(comparators.SCHEDULED_DESC);
    default:
      return items;
  }
};

const filterItems = (items: Array<any>, filter: FilterEnum, params: Object) => {
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
    case "SHOW_DUE_ON_DAY":
      return getTasksAndSubtasks(
        items,
        i => isSameDay(i.dueDate, params.dueDate) && i.deleted == false
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

const options = [
  { value: "DUE_ASC", label: "Due️ ⬆️" },
  { value: "DUE_DESC", label: "Due ⬇️" },
  { value: "SCHEDULED_ASC", label: "Scheduled ⬆️️" },
  { value: "SCHEDULED_DESC", label: "Scheduled ⬇️" },
  { value: "STATUS", label: "Status ✅" }
];

const SortSelect = styled(Select)`
  width: 110px;
  caret-color: transparent;
  padding: 2px;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 20px;
`;
const SortContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Container = styled.div`
  margin: 10px 0px;
`;

interface FilteredItemListProps {
  items: ItemType[];
  params: Object;
  noIndentation: boolean;
  showSubtasks: boolean;
  showProject: boolean;
  listName: string;
  hideCompleted: boolean;
  filter: FilterEnum;
}

enum FilterEnum {
  ShowAll = "SHOW_ALL",
  ShowDeleted = "SHOW_DELETED",
  ShowInbox = "SHOW_INBOX",
  ShowCompleted = "SHOW_COMPLETED",
  ShowScheduled = "SHOW_SCHEDULED",
  ShowScheduledOnDay = "SHOW_SCHEDULED_ON_DAY",
  ShowDueOnDay = "SHOW_DUE_ON_DAY",
  ShowNotScheduled = "SHOW_NOT_SCHEDULED",
  ShowFromProjectByType = "SHOW_FROM_PROJECT_BY_TYPE",
  ShowOverdue = "SHOW_OVERDUE"
}

enum SortCriteriaEnum {
  Status = "STATUS",
  DueAsc = "DUE_ASC",
  DueDesc = "DUE_DESC",
  ScheduledAsc = "SCHEDULED_ASC",
  ScheduledDesc = "SCHEDULED_DESC"
}

interface FilteredItemListState {
  filteredItems: ItemType[];
  sortCriteria: SortCriteriaEnum;
}

class FilteredItemList extends Component<
  FilteredItemListProps,
  FilteredItemListState
> {
  constructor(props) {
    super(props);
    this.state = {
      filteredItems: filterItems(
        this.props.items,
        this.props.filter,
        this.props.params
      ),
      sortCriteria: SortCriteriaEnum.DueDesc
    };
  }
  // TODO: Add sort icon
  render() {
    return (
      <Container>
        <HeaderContainer>
          <Header1>{this.props.listName}</Header1>
          <SortContainer>
            <SortSelect
              options={options}
              autoFocus={true}
              placeholder={"Sort by:"}
              styles={selectStyles}
              onChange={e => {
                this.setState({ sortCriteria: e.value });
              }}
            />
          </SortContainer>
        </HeaderContainer>
        <ItemList
          noIndentation={this.props.noIndentation}
          showSubtasks={this.props.showSubtasks}
          items={sortItems(this.props.items, this.state.sortCriteria)}
          showProject={this.props.showProject}
        />
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  items: state.items
});
const mapDispatchToProps = dispatch => ({});
export default connect(mapStateToProps, mapDispatchToProps)(FilteredItemList);
