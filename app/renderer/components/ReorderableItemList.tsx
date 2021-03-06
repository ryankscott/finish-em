import { gql, useMutation, useQuery } from '@apollo/client'
import { Box, Flex, Text } from '@chakra-ui/layout'
import { cloneDeep, orderBy } from 'lodash'
import React, { ReactElement, useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { v4 as uuidv4 } from 'uuid'
import { subtasksVisibleVar } from '..'
import { Item } from '../../main/generated/typescript-helpers'
import { PAGE_SIZE } from '../consts'
import { ItemIcons } from '../interfaces/item'
import { FailedFilteredItemList } from './FailedFilteredItemList'
import ItemComponent from './Item'
import Pagination from './Pagination'
import { SortDirectionEnum, SortOption } from './SortDropdown'

const GET_DATA = gql`
  query itemsByFilter($filter: String!, $componentKey: String!) {
    items: itemsByFilter(filter: $filter, componentKey: $componentKey) {
      key
      completed
      dueAt
      scheduledAt
      createdAt
      repeat
      label {
        key
      }
      lastUpdatedAt
      project {
        name
        key
      }
      parent {
        key
      }
      children {
        key
        deleted
        completed
      }
      completed
      sortOrders {
        componentKey
        sortOrder
      }
    }
    subtasksVisible @client
  }
`

const SET_ITEM_ORDER = gql`
  mutation SetItemOrder($itemKey: String!, $componentKey: String!, $sortOrder: Int!) {
    setItemOrder(input: { itemKey: $itemKey, componentKey: $componentKey, sortOrder: $sortOrder })
  }
`
const DELETE_ITEMORDERS_BY_COMPONENT = gql`
  mutation DeleteItemOrdersByComponent($componentKey: String!) {
    deleteItemOrdersByComponent(input: { componentKey: $componentKey })
  }
`
const BULK_CREATE_ITEMORDERS = gql`
  mutation BulkCreateItemOrders($itemKeys: [String]!, $componentKey: String!) {
    bulkCreateItemOrders(input: { itemKeys: $itemKeys, componentKey: $componentKey })
  }
`

type ReorderableItemListProps = {
  componentKey: string
  filter: string
  sortDirection: SortDirectionEnum
  sortType: SortOption
  showCompleted: boolean
  hideCompletedSubtasks?: boolean
  hideDeletedSubtasks?: boolean
  expandSubtasks: boolean
  flattenSubtasks?: boolean
  hiddenIcons: ItemIcons[]
  onItemsFetched: ([]) => void
}

function ReorderableItemList(props: ReorderableItemListProps): ReactElement {
  const [setItemOrder] = useMutation(SET_ITEM_ORDER)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortedItems, setSortedItems] = useState<Item[] | []>([])
  const [bulkCreateItemOrders] = useMutation(BULK_CREATE_ITEMORDERS)
  const [deleteItemOrdersByComponent] = useMutation(DELETE_ITEMORDERS_BY_COMPONENT)

  const { loading, error, data } = useQuery(GET_DATA, {
    variables: {
      filter: props.filter ? props.filter : '',
      componentKey: props.componentKey,
    },
  })
  if (error) {
    return <FailedFilteredItemList componentKey={props.componentKey} setEditing={() => true} />
  }

  useEffect(() => {
    if (loading == false && data) {
      const sI = data?.items?.map((i) => {
        // Items have different sort orders per component
        const sortOrder = i.sortOrders.find((s) => s.componentKey == props.componentKey)
        return { ...i, sortOrder }
      })
      const sorted = orderBy(sI, 'sortOrder.sortOrder', 'asc')
      const uncompletedItems = sorted.filter((m) => m.completed == false)
      const filteredItems = props.showCompleted ? uncompletedItems : sorted
      setSortedItems(filteredItems)

      // Update listeners
      if (props?.onItemsFetched) {
        props.onItemsFetched([
          data?.items.length,
          data?.items.filter((d) => d.completed == true).length,
        ])
      }
    }
  }, [loading, data, props.showCompleted])

  useEffect(() => {
    if (!sortedItems.length) return
    const sorted = props.sortType.sort(sortedItems, props.sortDirection)
    // Async update
    deleteItemOrdersByComponent({
      variables: { componentKey: props.componentKey },
    })

    const sortedItemKeys = sorted.map((s) => s.key)
    bulkCreateItemOrders({
      variables: { itemKeys: sortedItemKeys, componentKey: props.componentKey },
    })

    // Sync Update
    setSortedItems(sorted)
  }, [props.sortDirection, props.sortType])

  useEffect(() => {
    if (!sortedItems.length) return
    let newState = cloneDeep(data?.subtasksVisible)
    sortedItems.forEach((a) => {
      if (a.children.length > 0) {
        if (newState[a.key]) {
          newState[a.key][props.componentKey] = props.expandSubtasks
        } else {
          newState[a.key] = {
            [props.componentKey]: props.expandSubtasks,
          }
        }
      }
    })
    subtasksVisibleVar(newState)
  }, [props.expandSubtasks])

  const reorderItems = (result: DropResult): void => {
    const { destination, source, draggableId, type } = result
    //  Trying to detect drops in non-valid areas
    if (!destination) return

    // Do nothing if it was a drop to the same place
    if (destination.index == source.index) return

    const itemAtDestination = sortedItems[destination.index]
    const itemAtSource = sortedItems[source.index]

    // Sync update
    const newSortedItems = sortedItems
    newSortedItems.splice(source.index, 1)
    newSortedItems.splice(destination.index, 0, itemAtSource)
    setSortedItems(newSortedItems)

    // Async update
    setItemOrder({
      variables: {
        itemKey: draggableId,
        componentKey: props.componentKey,
        sortOrder: itemAtDestination.sortOrder.sortOrder,
      },
    })
  }

  const pagedItems: Item[] = sortedItems?.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

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
  return (
    <Box w={'100%'} my={4} mx={0} zIndex={0}>
      <DragDropContext onDragEnd={(result) => reorderItems(result)}>
        <Droppable droppableId={uuidv4()} type="ITEM">
          {(provided, snapshot) => (
            <Flex
              zIndex={0}
              direction={'column'}
              justifyContent={'center'}
              borderRadius={3}
              w={'100%'}
              padding={snapshot.isDraggingOver ? '20px 5px' : '5px'}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {pagedItems?.map((item: Item, index) => {
                if (item.parent?.key != null) {
                  // Find if the parent already exists in this list
                  const parentExistsInList = sortedItems?.find((z) => z.key == item.parent.key)
                  // If it does and we don't want to flattenSubtasks then return
                  if (parentExistsInList && !props.flattenSubtasks) {
                    return
                  }
                }
                return (
                  <Draggable key={item.key} draggableId={item.key} index={index}>
                    {(provided, snapshot) => (
                      <Flex
                        position={'relative'}
                        flexDirection={'column'}
                        height={'auto'}
                        userSelect={'none'}
                        p={0}
                        m={0}
                        border={'none'}
                        borderRadius={4}
                        shadow={snapshot.isDragging ? 'base' : null}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        key={'container-' + item.key}
                      >
                        <ItemComponent
                          compact={false}
                          itemKey={item.key}
                          key={item.key}
                          componentKey={props.componentKey}
                          shouldIndent={false}
                          hiddenIcons={props.hiddenIcons}
                          hideCollapseIcon={props.flattenSubtasks}
                        />
                        {item?.children.length > 0 && (
                          <Box>
                            {item.children.map((child) => {
                              // We need to check if the child exists in the original input list
                              const shouldHideItem =
                                (props.hideCompletedSubtasks && child.completed) ||
                                (props.hideDeletedSubtasks && child.deleted) ||
                                props.flattenSubtasks

                              return (
                                !shouldHideItem && (
                                  <ItemComponent
                                    compact={false}
                                    itemKey={child.key}
                                    key={child.key}
                                    componentKey={props.componentKey}
                                    shouldIndent={true}
                                    hideCollapseIcon={props.flattenSubtasks}
                                    hiddenIcons={
                                      props.hiddenIcons
                                        ? [...props.hiddenIcons, ItemIcons.Subtask]
                                        : [ItemIcons.Subtask]
                                    }
                                  />
                                )
                              )
                            })}
                          </Box>
                        )}
                      </Flex>
                    )}
                  </Draggable>
                )
              })}

              {data?.items?.length == 0 && (
                <Text color={'gray.400'} fontSize={'sm'} py={4} px={0} pl={4}>
                  No items
                </Text>
              )}
              {provided.placeholder}
            </Flex>
          )}
        </Droppable>
      </DragDropContext>
      <Pagination
        itemsLength={data?.items?.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </Box>
  )
}

export default ReorderableItemList
