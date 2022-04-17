import { useMutation, useQuery } from '@apollo/client';
import { Box, Flex, Text } from '@chakra-ui/layout';
import { cloneDeep, orderBy } from 'lodash';
import { ReactElement, useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import {
  BULK_CREATE_ITEM_ORDERS,
  DELETE_ITEM_ORDERS_BY_COMPONENT,
  ITEMS_BY_FILTER,
  SET_ITEM_ORDER,
} from 'renderer/queries';
import { v4 as uuidv4 } from 'uuid';
import { subtasksVisibleVar } from '../cache';
import { Item } from '../../main/generated/typescript-helpers';
import { PAGE_SIZE } from '../../consts';
import { ItemIcons } from '../interfaces/item';
import FailedFilteredItemList from './FailedFilteredItemList';
import ItemComponent from './Item';
import Pagination from './Pagination';
import { SortDirectionEnum, SortOption } from './SortDropdown';

type ReorderableItemListProps = {
  componentKey: string;
  filter: string;
  sortDirection: SortDirectionEnum;
  sortType: SortOption;
  showCompleted: boolean;
  expandSubtasks: boolean;
  hiddenIcons: ItemIcons[] | undefined;
  onItemsFetched: (
    fetchedItems: [filteredItems: number, filteredButCompletedItems: number]
  ) => void;
  hideCompletedSubtasks?: boolean;
  hideDeletedSubtasks?: boolean;
  flattenSubtasks?: boolean;
  shouldPoll?: boolean;
};

function ReorderableItemList({
  componentKey,
  filter,
  sortDirection,
  sortType,
  showCompleted,
  hideCompletedSubtasks,
  hideDeletedSubtasks,
  expandSubtasks,
  flattenSubtasks,
  shouldPoll,
  hiddenIcons,
  onItemsFetched,
}: ReorderableItemListProps): ReactElement {
  const [setItemOrder] = useMutation(SET_ITEM_ORDER);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedItems, setSortedItems] = useState<Item[] | []>([]);
  const [bulkCreateItemOrders] = useMutation(BULK_CREATE_ITEM_ORDERS);
  const [deleteItemOrdersByComponent] = useMutation(
    DELETE_ITEM_ORDERS_BY_COMPONENT
  );

  const { loading, error, data } = useQuery(ITEMS_BY_FILTER, {
    variables: {
      filter: filter ?? '',
      componentKey,
    },
    pollInterval: shouldPoll ? 5000 : 0,
  });

  useEffect(() => {
    if (loading === false && data) {
      const si = data?.items?.map((item: Item) => {
        // Items have different sort orders per component
        const sortOrder = item?.sortOrders?.find(
          (s) => s.componentKey === componentKey
        );
        return { ...item, sortOrder };
      });

      const sorted = orderBy(si, 'sortOrder.sortOrder', 'asc');
      const uncompletedItems = sorted.filter((m) => m.completed === false);
      const filteredItems = showCompleted ? uncompletedItems : sorted;
      setSortedItems(filteredItems);

      // Update listeners
      if (onItemsFetched) {
        onItemsFetched([
          filteredItems.length,
          sorted.filter((m) => m.completed).length,
        ]);
      }
    }
  }, [loading, data, showCompleted, componentKey]);

  useEffect(() => {
    if (!sortedItems.length) return;
    const sorted = sortType.sort(sortedItems, sortDirection);

    // Persist the sort order
    deleteItemOrdersByComponent({
      variables: { componentKey },
    });
    const sortedItemKeys = sorted.map((s) => s.key);
    bulkCreateItemOrders({
      variables: { itemKeys: sortedItemKeys, componentKey },
    });

    // Update the state locally
    setSortedItems(sorted);
  }, [sortDirection, sortType]);

  useEffect(() => {
    if (!sortedItems.length) return;

    // Update storage to expand subtasks if that's what's being passed to the component
    const newState = cloneDeep(data?.subtasksVisible);
    sortedItems.forEach((a) => {
      if (a?.children?.length > 0) {
        if (newState[a.key]) {
          newState[a.key][componentKey] = expandSubtasks;
        } else {
          newState[a.key] = {
            [componentKey]: expandSubtasks,
          };
        }
      }
    });
    subtasksVisibleVar(newState);
  }, [expandSubtasks]);

  const reorderItems = (result: DropResult): void => {
    const { destination, source, draggableId, type } = result;
    //  Trying to detect drops in non-valid areas
    if (!destination) return;

    // Do nothing if it was a drop to the same place
    if (destination.index === source.index) return;

    const itemAtDestination = sortedItems[destination.index];
    const itemAtSource = sortedItems[source.index];

    // Sync update
    const newSortedItems = sortedItems;
    newSortedItems.splice(source.index, 1);
    newSortedItems.splice(destination.index, 0, itemAtSource);
    setSortedItems(newSortedItems);

    // Async update
    setItemOrder({
      variables: {
        itemKey: draggableId,
        componentKey,
        sortOrder: itemAtDestination.sortOrder.sortOrder,
      },
    });
  };

  const pagedItems: Item[] = sortedItems?.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  /* TODO: Introduce the following shortcuts:
	- Scheduled At
	- Due At
	- Create subtask
	- Convert to subtask
	- Repeat
	- Add Project
	- Add Area
	- Edit description
 */

  if (error) {
    return (
      <FailedFilteredItemList
        componentKey={componentKey}
        setEditing={() => true}
      />
    );
  }

  return (
    <Box w="100%" my={4} mx={0} zIndex={0}>
      <DragDropContext onDragEnd={(result) => reorderItems(result)}>
        <Droppable droppableId={uuidv4()} type="ITEM">
          {(provided, snapshot) => (
            <Flex
              zIndex={0}
              direction="column"
              justifyContent="center"
              borderRadius={3}
              w="100%"
              padding={snapshot.isDraggingOver ? '20px 5px' : '5px'}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {pagedItems?.map((item: Item, index): ReactElement => {
                if (item?.parent) {
                  // Find if the parent already exists in this list
                  const parentExistsInList = sortedItems?.find(
                    (z) => z.key === item.parent?.key
                  );
                  // If it does and we don't want to flattenSubtasks then return
                  if (parentExistsInList && !flattenSubtasks) {
                    return <></>;
                  }
                }
                return (
                  <Draggable
                    key={item.key}
                    draggableId={item.key}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Flex
                        position="relative"
                        flexDirection="column"
                        height="auto"
                        userSelect="none"
                        p={0}
                        m={0}
                        border="none"
                        borderRadius="md"
                        shadow={snapshot.isDragging ? 'base' : 'none'}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        key={`container-${item.key}`}
                      >
                        <ItemComponent
                          compact={false}
                          itemKey={item.key}
                          key={item.key}
                          componentKey={componentKey}
                          shouldIndent={false}
                          hiddenIcons={hiddenIcons}
                          hideCollapseIcon={flattenSubtasks}
                        />
                        <Box
                          display={
                            item.children && item?.children.length > 0
                              ? 'initial'
                              : 'none'
                          }
                        >
                          {item.children.map((child) => {
                            // Keep TS happy
                            if (!child) return <></>;
                            // We need to check if the child exists in the original input list
                            const shouldHideItem =
                              (hideCompletedSubtasks && child.completed) ||
                              (hideDeletedSubtasks && child.deleted) ||
                              flattenSubtasks;

                            return (
                              !shouldHideItem && (
                                <ItemComponent
                                  compact={false}
                                  itemKey={child.key}
                                  key={child.key}
                                  componentKey={componentKey}
                                  shouldIndent
                                  hideCollapseIcon={flattenSubtasks}
                                  hiddenIcons={
                                    hiddenIcons
                                      ? [...hiddenIcons, ItemIcons.Subtask]
                                      : [ItemIcons.Subtask]
                                  }
                                />
                              )
                            );
                          })}
                        </Box>
                      </Flex>
                    )}
                  </Draggable>
                );
              })}

              {sortedItems.length === 0 && (
                <Text color="gray.400" fontSize="sm" py={4} px={0} pl={4}>
                  No items
                </Text>
              )}
              {provided.placeholder}
            </Flex>
          )}
        </Droppable>
      </DragDropContext>
      <Pagination
        itemsLength={sortedItems.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </Box>
  );
}

export default ReorderableItemList;
