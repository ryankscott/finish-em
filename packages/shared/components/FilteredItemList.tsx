import {
  IconButton,
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  useColorMode,
  Icon,
  Tooltip,
} from "@chakra-ui/react";
import { ReactElement, useState } from "react";
import { orderBy } from "lodash";
import { Icons } from "../assets/icons";
import { INBOX_COMPONENT_KEY } from "../consts";
import { ItemIcons } from "../interfaces";
import EditFilteredItemList from "./EditFilteredItemList";
import ReorderableItemList from "./ReorderableItemList";
import SortDropdown, { SortDirectionEnum } from "./SortDropdown";
import { AppState, useBoundStore } from "../state";
import { Item } from "../resolvers-types";

const determineVisibilityRules = (
  isFilterable: boolean,
  showItemList: boolean,
  itemsLength: number
): {
  showFilterBar: boolean;

  showSortButton: boolean;
} => {
  return {
    // Show filter bar if the props isFilterable is set and we have more than one item and we haven't hidden all items
    showFilterBar: isFilterable && itemsLength > 0 && showItemList,
    // Show sort button if we have more than one item and we're not hiding the item list and drag and drop is not enabled
    showSortButton: itemsLength >= 1 && showItemList,
  };
};

export type FilteredItemListProps = {
  componentKey: string;
  filter: string;
  isFilterable?: boolean;
  hiddenIcons?: ItemIcons[];
  listName?: string;
  flattenSubtasks?: boolean;
  showCompletedToggle?: boolean;
  hideDeletedSubtasks?: boolean;
  hideCompletedSubtasks?: boolean;
  shouldPoll?: boolean;
  readOnly?: boolean;
  editing?: boolean;
  showSnoozedItems?: boolean;
  setEditing?: (editing: boolean) => void;
};

const determineItemListLengthString = (filteredItems: number): string => {
  if (!filteredItems) {
    return "0 items";
  }
  return `${filteredItems}  ${filteredItems > 0 ? "items" : "item"}
  `;
};

const FilteredItemList = ({
  componentKey,
  isFilterable,
  hiddenIcons,
  listName,
  filter,
  flattenSubtasks,
  hideDeletedSubtasks,
  hideCompletedSubtasks,
  showSnoozedItems,
  shouldPoll,
  readOnly,
  editing,
  setEditing,
}: FilteredItemListProps): ReactElement => {
  const { colorMode } = useColorMode();
  const [sortType, setSortType] = useState({
    label: "Due",
    sort: (items: Item[], direction: SortDirectionEnum) =>
      orderBy(items, [(i) => i.dueAt], direction),
  });
  const [sortDirection, setSortDirection] = useState(
    SortDirectionEnum.Ascending
  );
  const [showItemList, setShowItemList] = useState(true);
  const [itemsLength, setItemsLength] = useState<number>(0);
  const [setSubtaskVisibilityForComponent] = useBoundStore(
    (state: AppState) => [state.setSubtaskVisibilityForComponent]
  );

  const visibility = determineVisibilityRules(
    isFilterable ?? true,
    showItemList,
    itemsLength ?? 0
  );

  return (
    <Flex
      direction="column"
      m={0}
      p={0}
      w="100%"
      borderRadius="md"
      border="1px solid"
      borderColor={"chakra-border-color"}
    >
      <Grid
        position="relative"
        alignItems="center"
        py={4}
        px={2}
        mt={0}
        gridGap={1}
        borderRadius="md"
        borderBottomRadius={showItemList ? "none" : "md"}
        gridTemplateRows="40px"
        gridTemplateColumns="30px auto auto"
        borderBottom={showItemList ? "1px solid" : "none"}
        bg={colorMode === "light" ? "gray.50" : "gray.800"}
        borderColor={"chakra-border-color"}
      >
        <GridItem colSpan={1} borderRadius="md">
          <Tooltip label="Hide items">
            <Box>
              <IconButton
                aria-label="collapse or expand"
                key={`btn-${componentKey}`}
                variant="default"
                size="sm"
                icon={
                  <Icon
                    as={showItemList === true ? Icons.collapse : Icons.expand}
                    w={4}
                    h={4}
                  />
                }
                onClick={() => {
                  setShowItemList(!showItemList);
                }}
              />
            </Box>
          </Tooltip>
        </GridItem>
        <GridItem colSpan={1}>
          <Flex
            direction={["column", "column", "row", "row"]}
            py={1}
            px={0}
            my={0}
            alignItems="baseline"
          >
            <Text fontSize="lg" pr={2}>
              {listName}
            </Text>
            <Text fontSize="sm" py={0} w="60px" color="gray.500">
              {determineItemListLengthString(itemsLength)}
            </Text>
          </Flex>
        </GridItem>
        <GridItem colSpan={1}>
          <Flex
            position="relative"
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
          >
            {visibility.showFilterBar && (
              <>
                <Tooltip label="Expand all subtasks">
                  <Box>
                    <IconButton
                      size="sm"
                      aria-label="expand all"
                      variant="default"
                      icon={<Icon w={3} h={3} as={Icons.expandAll} />}
                      onClick={() => {
                        setSubtaskVisibilityForComponent(componentKey, true);
                      }}
                    />
                  </Box>
                </Tooltip>
                <Tooltip label="Collapse all subtasks">
                  <Box>
                    <IconButton
                      size="sm"
                      aria-label="collapse all"
                      variant="default"
                      icon={<Icon w={3} h={3} as={Icons.collapseAll} />}
                      onClick={() => {
                        setSubtaskVisibilityForComponent(componentKey, false);
                      }}
                    />
                  </Box>
                </Tooltip>
                <Box minW={["20px", "20px", "120px", "120px"]}>
                  <SortDropdown
                    defaultText="Due"
                    sortType={sortType}
                    sortDirection={sortDirection}
                    onSetSortDirection={(d) => {
                      setSortDirection(d);
                    }}
                    onSetSortType={(t) => {
                      setSortType(t);
                    }}
                  />
                </Box>
              </>
            )}
          </Flex>
        </GridItem>
      </Grid>
      {editing && !readOnly && componentKey !== INBOX_COMPONENT_KEY ? (
        <EditFilteredItemList
          key={`dlg-${componentKey}`}
          componentKey={componentKey}
          onClose={() => {
            if (setEditing) {
              setEditing(false);
            }
          }}
        />
      ) : (
        showItemList && (
          <ReorderableItemList
            onItemsFetched={(itemLength) => {
              setItemsLength(itemLength);
            }}
            filter={filter}
            key={componentKey}
            showSnoozedItems={showSnoozedItems}
            hideDeletedSubtasks={hideDeletedSubtasks}
            flattenSubtasks={flattenSubtasks ?? false}
            hideCompletedSubtasks={hideCompletedSubtasks}
            componentKey={componentKey}
            hiddenIcons={hiddenIcons}
            sortDirection={sortDirection}
            sortType={sortType}
            shouldPoll={shouldPoll}
          />
        )
      )}
    </Flex>
  );
};

export default FilteredItemList;
