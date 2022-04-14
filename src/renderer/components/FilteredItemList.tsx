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
} from '@chakra-ui/react';
import { ReactElement, useState } from 'react';
import { orderBy } from 'lodash';
import { Icons } from 'renderer/assets/icons';
import { Item } from '../../main/generated/typescript-helpers';
import { ItemIcons } from '../interfaces/item';
import EditFilteredItemList from './EditFilteredItemList';
import ReorderableItemList from './ReorderableItemList';
import SortDropdown, { SortDirectionEnum } from './SortDropdown';

const determineVisibilityRules = (
  isFilterable: boolean,
  showItemList: boolean,
  itemsLength: number,
  completedItemsLength: number,
  showCompletedToggle: boolean
): {
  showCompletedToggle: boolean;
  showFilterBar: boolean;
  showDeleteButton: boolean;
  showSortButton: boolean;
} => {
  return {
    // Show completed toggle if we have a completed item and we want to show the toggle
    showCompletedToggle: completedItemsLength > 0 && showCompletedToggle,
    // Show filter bar if the props isFilterable is set and we have more than one item and we haven't hidden all items
    showFilterBar: isFilterable && itemsLength > 0 && showItemList,
    // Show delete button if we have at least one deleted item
    showDeleteButton: completedItemsLength > 0 && showItemList,
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
  setEditing?: (editing: boolean) => void;
};

type ListItemLength = [filteredItems: number, filteredButCompleted: number];

const determineItemListLengthString = (
  itemsLength: ListItemLength | undefined
): string => {
  if (!itemsLength) {
    return '0 items';
  }
  const filteredItems = itemsLength?.[0];
  return `${filteredItems}  ${filteredItems > 0 ? 'items' : 'item'}
  `;
};

const FilteredItemList = ({
  componentKey,
  isFilterable,
  hiddenIcons,
  listName,
  filter,
  flattenSubtasks,
  showCompletedToggle,
  hideDeletedSubtasks,
  hideCompletedSubtasks,
  shouldPoll,
  readOnly,
  editing,
  setEditing,
}: FilteredItemListProps): ReactElement => {
  const { colorMode } = useColorMode();
  const [sortType, setSortType] = useState({
    label: 'Due',
    sort: (items: Item[], direction: SortDirectionEnum) =>
      orderBy(items, [(i) => new Date(i.dueAt)], direction),
  });
  const [sortDirection, setSortDirection] = useState(
    SortDirectionEnum.Ascending
  );
  const [showCompleted, setShowCompleted] = useState(true);
  const [showItemList, setShowItemList] = useState(true);
  const [itemsLength, setItemsLength] = useState<ListItemLength>();
  const [expandSubtasks, setExpandSubtasks] = useState(true);

  const visibility = determineVisibilityRules(
    isFilterable ?? true,
    showItemList,
    itemsLength?.[0],
    itemsLength?.[1],
    showCompletedToggle ?? true
  );

  return (
    <Box
      m={0}
      p={0}
      w="100%"
      borderRadius="md"
      border="1px solid"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
    >
      <Grid
        position="relative"
        alignItems="center"
        py={4}
        px={2}
        mt={0}
        gridGap={1}
        borderRadius={0}
        borderTopRadius={5}
        gridTemplateRows="40px"
        gridTemplateColumns="30px auto auto"
        borderBottom="1px solid"
        bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
      >
        <GridItem colSpan={1}>
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
            direction="row"
            py={1}
            px={0}
            my={0}
            mx={2}
            alignItems="baseline"
          >
            <Text fontSize="lg" isTruncated>
              {listName}
            </Text>
            <Text fontSize="sm" py={0} px={2} minW="80px" color="gray.500">
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
                {visibility.showCompletedToggle && (
                  <Tooltip
                    label={
                      showCompleted
                        ? 'Show completed items'
                        : 'Hide completed items'
                    }
                  >
                    <Box>
                      <IconButton
                        aria-label="toggle completed"
                        size="sm"
                        variant="default"
                        icon={
                          <Icon
                            w={3}
                            h={3}
                            as={showCompleted ? Icons.hide : Icons.show}
                          />
                        }
                        onClick={() => {
                          setShowCompleted(!showCompleted);
                        }}
                      />
                    </Box>
                  </Tooltip>
                )}
                {visibility.showDeleteButton && (
                  <Tooltip label="Delete completed items">
                    <Box>
                      <IconButton
                        size="sm"
                        aria-label="delete completed"
                        variant="default"
                        icon={<Icon w={3} h={3} as={Icons.trashSweep} />}
                        onClick={() => {
                          /* completedItems.forEach((c) => {
                          if (c.parent?.key === null) {
                            deleteItem({ variables: { key: c.key } })
                          }
                        }) */
                        }}
                      />
                    </Box>
                  </Tooltip>
                )}
                <Tooltip label="Expand all subtasks">
                  <Box>
                    <IconButton
                      size="sm"
                      aria-label="expand all"
                      variant="default"
                      icon={<Icon w={3} h={3} as={Icons.expandAll} />}
                      onClick={() => {
                        setExpandSubtasks(true);
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
                        setExpandSubtasks(false);
                      }}
                    />
                  </Box>
                </Tooltip>
                <Box w="145px">
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
      {editing ? (
        <Box>
          <EditFilteredItemList
            key={`dlg-${componentKey}`}
            componentKey={componentKey}
            onClose={() => {
              if (setEditing) {
                setEditing(false);
              }
            }}
          />
        </Box>
      ) : (
        showItemList && (
          <Flex
            bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
            w="100%"
            transition="0.2s ease-in-out"
            py={0}
            px={0}
            borderRadius="md"
          >
            <ReorderableItemList
              expandSubtasks={expandSubtasks}
              onItemsFetched={(itemLengths) => {
                setItemsLength(itemLengths);
              }}
              filter={filter}
              key={componentKey}
              hideDeletedSubtasks={hideDeletedSubtasks}
              hideCompletedSubtasks={hideCompletedSubtasks}
              componentKey={componentKey}
              hiddenIcons={hiddenIcons}
              sortDirection={sortDirection}
              sortType={sortType}
              flattenSubtasks={flattenSubtasks}
              showCompleted={showCompleted}
              shouldPoll={shouldPoll}
            />
          </Flex>
        )
      )}
    </Box>
  );
};

export default FilteredItemList;
