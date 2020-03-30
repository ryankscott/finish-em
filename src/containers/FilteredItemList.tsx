import React, { Component } from "react";
import { connect } from "react-redux";
import ItemList from "../components/ItemList";
import {
  endOfDay,
  isSameDay,
  isAfter,
  isPast,
  parseISO,
  isValid
} from "date-fns";
import { getTasksAndSubtasks } from "../utils";
import { selectStyles } from "../theme";
import Select from "react-select";
import styled from "styled-components";
import { Header1, Paragraph } from "../components/Typography";
import { ItemType } from "../interfaces";
import { Uuid } from "@typed/uuid";

/*
If compareFunction(a, b) returns less than 0, sort a to an index lower than b (i.e. a comes first).
If compareFunction(a, b) returns greater than 0, sort b to an index lower than a (i.e. b comes first).
If compareFunction(a, b) returns 0, leave a and b unchanged with respect to each other, but sorted with respect to all different elements. Note: the ECMAscript standard does not guarantee this behavior, thus, not all browsers (e.g. Mozilla versions dating back to at least 2003) respect this.
compareFunction(a, b) must always return the same value when given a specific pair of elements a and b as its two arguments. If inconsistent results are returned, then the sort order is undefined.
*/

const comparators = {
  STATUS: (a: ItemType, b: ItemType) => {
    if (a.completed == true && b.completed == false) {
      return 1;
    } else if (a.completed == false && b.completed == true) {
      return -1;
    }
    return 0;
  },
  DUE_DESC: (a: ItemType, b: ItemType) => {
    const dueDateA = parseISO(a.dueDate);
    const dueDateB = parseISO(b.dueDate);
    if (!isValid(dueDateA)) {
      return 1;
    } else if (!isValid(dueDateB)) {
      return -1;
    } else if (isAfter(dueDateA, dueDateB)) {
      return 1;
    } else if (isAfter(dueDateB, dueDateA)) {
      return -1;
    }
    return 0;
  },
  DUE_ASC: (a: ItemType, b: ItemType) => {
    const dueDateA = parseISO(a.dueDate);
    const dueDateB = parseISO(b.dueDate);
    if (!isValid(dueDateA)) {
      return 1;
    } else if (!isValid(dueDateB)) {
      return -1;
    } else if (isAfter(dueDateA, dueDateB)) {
      return -1;
    } else if (isAfter(dueDateB, dueDateA)) {
      return 1;
    }
    return 0;
  },
  SCHEDULED_DESC: (a: ItemType, b: ItemType) => {
    const scheduledDateA = parseISO(a.scheduledDate);
    const scheduledDateB = parseISO(b.scheduledDate);
    if (!isValid(scheduledDateA)) {
      return 1;
    } else if (!isValid(scheduledDateB)) {
      return -1;
    } else if (isAfter(scheduledDateA, scheduledDateB)) {
      return 1;
    } else if (isAfter(scheduledDateB, scheduledDateA)) {
      return -1;
    }
    return 0;
  },
  SCHEDULED_ASC: (a: ItemType, b: ItemType) => {
    const scheduledDateA = parseISO(a.scheduledDate);
    const scheduledDateB = parseISO(b.scheduledDate);
    if (!isValid(scheduledDateA)) {
      return 1;
    } else if (!isValid(scheduledDateB)) {
      return -1;
    } else if (isAfter(scheduledDateA, scheduledDateB)) {
      return -1;
    } else if (isAfter(scheduledDateB, scheduledDateA)) {
      return 1;
    }
    return 0;
  }
};

const sortItems = (
  items: ItemType[],
  criteria: SortCriteriaEnum
): ItemType[] => {
  switch (criteria) {
    case "STATUS":
      return items.sort(comparators.STATUS);
    case "DUE_ASC":
      return items.sort(comparators.DUE_ASC);
    case "DUE_DESC":
      return items.sort(comparators.DUE_DESC);
    case "SCHEDULED_ASC":
      return items.sort(comparators.SCHEDULED_ASC);
    case "SCHEDULED_DESC":
      return items.sort(comparators.SCHEDULED_DESC);
    default:
      return items;
  }
};

const filterItems = (
  items: ItemType[],
  filter: FilterEnum,
  params?: FilterParamsType
): ItemType[] => {
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
        i =>
          isSameDay(parseISO(i.dueDate), params.dueDate) && i.deleted == false
      );
    case "SHOW_SCHEDULED_ON_DAY":
      return getTasksAndSubtasks(
        items,
        i =>
          isSameDay(parseISO(i.scheduledDate), params.scheduledDate) &&
          i.deleted == false
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
      return getTasksAndSubtasks(items, i => {
        return (
          isPast(endOfDay(parseISO(i.scheduledDate))) ||
          (isPast(endOfDay(parseISO(i.dueDate))) && i.deleted == false)
        );
      });
    default:
      throw new Error("Unknown filter: " + filter);
  }
};

const hideCompletedItems = (items: ItemType[], hide: boolean): ItemType[] => {
  if (hide) {
    return items.filter(i => i.completed == false);
  } else return items;
};

const getFilteredItems = (
  items: ItemType[],
  hideCompleted: boolean,
  sortCriteria: SortCriteriaEnum,
  filterCriteria: FilterEnum,
  filterParams: FilterParamsType
): {
  numberOfCompletedItems: number;
  sortedItems: ItemType[];
} => {
  const filteredItems = filterItems(items, filterCriteria, filterParams);
  const uncompletedItems = hideCompletedItems(filteredItems, true);
  const numberOfCompletedItems = filteredItems.length - uncompletedItems.length;
  const sortedItems = hideCompleted
    ? sortItems(uncompletedItems, sortCriteria)
    : sortItems(filteredItems, sortCriteria);
  return {
    numberOfCompletedItems: numberOfCompletedItems,
    sortedItems: sortedItems
  };
};

const options = [
  { value: "DUE_DESC", label: "Due ⬇️" },
  { value: "DUE_ASC", label: "Due️ ⬆️" },
  { value: "SCHEDULED_ASC", label: "Scheduled ⬆️️" },
  { value: "SCHEDULED_DESC", label: "Scheduled ⬇️" },
  { value: "STATUS", label: "Status ✅" }
];

const CompletedText = styled(Paragraph)`
  text-decoration: pointer;
`;

const SortSelect = styled(Select)`
  width: 110px;
  caret-color: transparent;
  padding: 2px;
  position: absolute;
`;

const HeaderBar = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: 45px 35px;
  grid-template-areas:
    "name name name . . . . . . ."
    "hide hide hide . . . . sort sort sort";
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 10px;
`;

interface SortContainerProps {
  visible: boolean;
}
const SortContainer = styled.div<SortContainerProps>`
  display: ${props => (props.visible ? "flex" : "none")};
  justify-content: flex-end;
  grid-area: sort;
  position: relative;
  width: 100%;
  height: 100%;
`;

interface CompletedContainerProps {
  visible: boolean;
}
const CompletedContainer = styled.div<CompletedContainerProps>`
  grid-area: hide;
  display: ${props => (props.visible ? "flex" : "none")};
  flex-direction: row;
  justify-content: flex-start;
  margin: 2px;
  cursor: pointer;
`;

const ListName = styled.div`
  grid-area: name;
`;

const Container = styled.div`
  margin: 10px 0px;
  z-index: 1;
`;

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

interface FilterParamsType {
  dueDate?: Date;
  scheduledDate?: Date;
  projectId?: Uuid;
  type?: "TODO" | "NOTE";
}

interface FilteredItemListState {
  sortCriteria: SortCriteriaEnum;
  hideCompleted: boolean;
}

interface FilteredItemListProps {
  items: ItemType[];
  noIndentation: boolean;
  showSubtasks: boolean;
  showProject: boolean;
  showFilterBar: boolean;
  hideCompletedItems: boolean;
  listName: string;
  filter: FilterEnum;
  filterParams: FilterParamsType;
}

class FilteredItemList extends Component<
  FilteredItemListProps,
  FilteredItemListState
> {
  constructor(props) {
    super(props);
    this.state = {
      sortCriteria: SortCriteriaEnum.DueDesc,
      hideCompleted: false || this.props.hideCompletedItems
    };
  }
  // TODO: Add sort and filtering back
  render() {
    const filteredItems = getFilteredItems(
      this.props.items,
      this.state.hideCompleted,
      this.state.sortCriteria,
      this.props.filter,
      this.props.filterParams
    );
    const completedItems = filteredItems.numberOfCompletedItems;
    return (
      <Container>
        <HeaderBar>
          <ListName>
            <Header1>{this.props.listName}</Header1>
          </ListName>
          <CompletedContainer
            visible={
              completedItems > 0 &&
              this.props.showFilterBar &&
              !this.props.hideCompletedItems
            }
            onClick={() =>
              this.setState({ hideCompleted: !this.state.hideCompleted })
            }
          >
            <CompletedText>
              {(this.state.hideCompleted ? "Show " : "Hide ") +
                completedItems.toString() +
                " completed"}
            </CompletedText>
          </CompletedContainer>
          <SortContainer
            visible={
              filteredItems.sortedItems.length > 0 && this.props.showFilterBar
            }
          >
            <SortSelect
              options={options}
              defaultValue={options[0]}
              autoFocus={true}
              placeholder={"Sort by:"}
              styles={selectStyles}
              onChange={e => {
                this.setState({ sortCriteria: e.value });
              }}
            />
          </SortContainer>
        </HeaderBar>
        <ItemList
          showProject={this.props.showProject}
          noIndentation={this.props.noIndentation}
          showSubtasks={this.props.showSubtasks}
          items={filteredItems.sortedItems}
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
