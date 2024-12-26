import { useMutation, useQuery } from "@apollo/client";
import { Flex, Text } from "@chakra-ui/react";
import { orderBy } from "lodash";
import React, { ReactElement, useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  BULK_CREATE_ITEM_ORDERS,
  DELETE_ITEM_ORDERS_BY_COMPONENT,
  ITEMS_BY_FILTER,
  SET_ITEM_ORDER,
} from "../queries";
import { Item } from "../../main/resolvers-types";
import { PAGE_SIZE } from "../../consts";
import { ItemIcons } from "../interfaces";
import FailedFilteredItemList from "./FailedFilteredItemList";
import Pagination from "./Pagination";
import { SortDirectionEnum, SortOption } from "./SortDropdown";
import { isFuture, parseISO } from "date-fns";
import { useColorMode } from "@chakra-ui/react";
import { AppState, useBoundStore } from "../state";
import SortableItem from "./SortableItem";

type ReorderableItemListProps = {
  componentKey: string;
  filter: string;
  sortDirection: SortDirectionEnum;
  sortType: SortOption;
  hiddenIcons: ItemIcons[] | undefined;
  flattenSubtasks: boolean;
  onItemsFetched: (fetchedItems: number) => void;
  hideCompletedSubtasks?: boolean;
  hideDeletedSubtasks?: boolean;
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
  shouldPoll,
  flattenSubtasks,
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
    DELETE_ITEM_ORDERS_BY_COMPONENT,
  );

  const [createSubtaskVisibilityIfDoesntExist] = useBoundStore(
    (state: AppState) => [state.createSubtaskVisibilityIfDoesntExist],
  );

  const { loading, error, data } = useQuery(ITEMS_BY_FILTER, {
    variables: {
      filter: filter ?? "",
      componentKey,
    },
    pollInterval: shouldPoll ? 5000 : 0,
  });

  useEffect(() => {
    if (loading === false && data) {
      const si = data?.items?.map((item: Item) => {
        createSubtaskVisibilityIfDoesntExist(item.key, componentKey);
        const sortOrder = item?.sortOrders?.find(
          (s) => s?.componentKey === componentKey,
        );
        return { ...item, sortOrder };
      });

      const sorted = orderBy(si, "sortOrder.sortOrder", "asc");

      const filteredItems = sorted.filter((item) => {
        const isSnoozed =
          item.snoozedUntil && isFuture(parseISO(item.snoozedUntil));

        return !isSnoozed || showSnoozedItems;
      });

      setSortedItems(filteredItems);

      if (onItemsFetched) {
        onItemsFetched(filteredItems.length);
      }
    }
  }, [loading, data, componentKey]);

  useEffect(() => {
    if (!sortedItems.length) return;
    const sorted = sortType.sort(sortedItems, sortDirection);

    deleteItemOrdersByComponent({
      variables: { componentKey },
    });

    const sortedItemKeys = sorted.map((s) => s.key);
    bulkCreateItemOrders({
      variables: { itemKeys: sortedItemKeys, componentKey },
    });

    setSortedItems(sorted);
  }, [sortDirection, sortType]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const reorderItems = (event: any): void => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sortedItems.findIndex((item) => item.key === active.id);
    const newIndex = sortedItems.findIndex((item) => item.key === over.id);

    const newSortedItems = arrayMove(sortedItems, oldIndex, newIndex);
    setSortedItems(newSortedItems);

    setItemOrder({
      variables: {
        itemKey: active.id,
        componentKey,
        sortOrder: newSortedItems[newIndex]?.sortOrder?.sortOrder,
      },
    });
  };

  const pagedItems: Item[] = sortedItems?.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={reorderItems}
      >
        <SortableContext
          items={pagedItems.map((item) => item.key)}
          strategy={verticalListSortingStrategy}
        >
          <Flex
            zIndex={0}
            direction="column"
            justifyContent="center"
            borderRadius={3}
            w="100%"
            padding="5px"
            onClick={() => console.log("click on sortable item")}
          >
            {pagedItems?.map((item: Item): ReactElement => {
              if (item?.parent) {
                const parentExistsInList = sortedItems?.find(
                  (z) => z.key === item.parent?.key,
                );
                if (parentExistsInList && !flattenSubtasks) {
                  return <></>;
                }
              }
              return (
                <SortableItem
                  key={item.key}
                  id={item.key}
                  item={item}
                  componentKey={componentKey}
                  flattenSubtasks={flattenSubtasks}
                  hiddenIcons={hiddenIcons}
                  hideCompletedSubtasks={hideCompletedSubtasks}
                  hideDeletedSubtasks={hideDeletedSubtasks}
                />
              );
            })}

            {sortedItems.length === 0 && (
              <Text color="gray.400" fontSize="sm" py={4} px={0} pl={4}>
                No items
              </Text>
            )}
          </Flex>
        </SortableContext>
      </DndContext>
      <Pagination
        itemsLength={sortedItems.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
}

export default ReorderableItemList;
