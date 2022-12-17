/* eslint-disable react/jsx-props-no-spreading */
import { useMutation, useQuery } from '@apollo/client';
import { Flex, Text } from '@chakra-ui/layout';
import { cloneDeep, orderBy } from 'lodash';
import { ReactElement, useEffect, useState } from 'react';
import { AppState, useAppStore } from 'renderer/state';
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
import { Item } from 'main/resolvers-types';
import { PAGE_SIZE } from '../../consts';
import { ItemIcons } from '../interfaces';
import FailedFilteredItemList from './FailedFilteredItemList';
import ItemComponent from './Item';
import Pagination from './Pagination';
import { SortDirectionEnum, SortOption } from './SortDropdown';
import { isFuture, parseISO } from 'date-fns';
import { useColorMode } from '@chakra-ui/react';

type ReorderableItemListProps = {
  componentKey: string;
  filter: string;
  sortDirection: SortDirectionEnum;
  sortType: SortOption;
  expandSubtasks: boolean;
  hiddenIcons: ItemIcons[] | undefined;
  onItemsFetched: (fetchedItems: number) => void;
  hideCompletedSubtasks?: boolean;
  hideDeletedSubtasks?: boolean;
  flattenSubtasks?: boolean;
  shouldPoll?: boolean;
  showSnoozedItems?: boolean;
};

function ReorderableItemList({
  componentKey,
  filter,
  sortDirection,
  sortType,
  hideCompletedSubtasks,
  hideDeletedSubtasks,
  expandSubtasks,
  flattenSubtasks,
  shouldPoll,
  hiddenIcons,
  showSnoozedItems,
  onItemsFetched,
}: ReorderableItemListProps): ReactElement {
  const { colorMode } = useColorMode();
  const [setItemOrder] = useMutation(SET_ITEM_ORDER, {
    refetchQueries: [ITEMS_BY_FILTER],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedItems, setSortedItems] = useState<Item[] | []>([]);
  const [bulkCreateItemOrders] = useMutation(BULK_CREATE_ITEM_ORDERS);
  const [deleteItemOrdersByComponent] = useMutation(
    DELETE_ITEM_ORDERS_BY_COMPONENT
  );
  const [visibleSubtasks, setVisibleSubtasks] = useAppStore(
    (state: AppState) => [state.visibleSubtasks, state.setVisibleSubtasks]
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
          (s) => s?.componentKey === componentKey
        );
        return { ...item, sortOrder };
      });
      // TODO: This is really gnarly and should be refactored
      const sorted = orderBy(si, 'sortOrder.sortOrder', 'asc');
      const filteredItems = sorted.filter((item) => {
        if (item.snoozedUntil && isFuture(parseISO(item.snoozedUntil))) {
          // Sometimes we want to override this (e.g. show all snoozed)
          if (showSnoozedItems) {
            return true;
          }
          return false;
        }

        return true;
      });

      setSortedItems(filteredItems);

      // Update listeners
      if (onItemsFetched) {
        onItemsFetched(filteredItems.length);
      }
    }
  }, [loading, data, componentKey]);

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
    const newState = cloneDeep(visibleSubtasks);
    sortedItems.forEach((a) => {
      if (a.children && a.children?.length > 0) {
        if (newState[a.key]) {
          newState[a.key][componentKey] = expandSubtasks;
        } else {
          newState[a.key] = {
            [componentKey]: expandSubtasks,
          };
        }
      }
    });
    setVisibleSubtasks(newState);
  }, [expandSubtasks]);

  const reorderItems = (result: DropResult): void => {
    const { destination, source, draggableId } = result;

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
        sortOrder: itemAtDestination?.sortOrder?.sortOrder,
      },
    });
  };

  const pagedItems: Item[] = sortedItems?.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (error) {
    console.log(error);
    return (
      <FailedFilteredItemList
        componentKey={componentKey}
        setEditing={() => true}
      />
    );
  }

  return (
    <>
      <DragDropContext onDragEnd={(result) => reorderItems(result)}>
        <Droppable droppableId={'items'} type="ITEM">
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
                        border={'1px solid'}
                        borderColor={() => {
                          if (snapshot.isDragging) {
                            return colorMode === 'light'
                              ? 'gray.200'
                              : 'gray.900';
                          }
                          return 'transparent';
                        }}
                        borderRadius="md"
                        shadow={snapshot.isDragging ? 'lg' : 'none'}
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
                        <>
                          {item?.children?.map((child) => {
                            // Keep TS happy
                            if (!child) return <></>;

                            // We need to check if the child exists in the original input list
                            const shouldHideItem =
                              (hideCompletedSubtasks && child.completed) ||
                              (hideDeletedSubtasks && child.deleted) ||
                              flattenSubtasks;

                            if (shouldHideItem) return <></>;

                            return (
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
                            );
                          })}
                        </>
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
    </>
  );
}

export default ReorderableItemList;
