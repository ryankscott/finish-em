import { gql, useMutation, useQuery } from '@apollo/client'
import { Box, Flex, Grid, GridItem, Text } from '@chakra-ui/react'
import { cloneDeep, orderBy } from 'lodash'
import React, { ReactElement, useState } from 'react'
import { subtasksVisibleVar } from '..'
import { Item } from '../../main/generated/typescript-helpers'
import { PAGE_SIZE } from '../consts'
import { ItemIcons } from '../interfaces'
import { useTraceUpdate } from '../utils'
import Button from './Button'
import EditFilteredItemList from './EditFilteredItemList'
import { FailedFilteredItemList } from './FailedFilteredItemList'
import Pagination from './Pagination'
import ReorderableItemList from './ReorderableItemList'
import SortDropdown, { SortDirectionEnum, SortOption } from './SortDropdown'

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

const DELETE_ITEM = gql`
  mutation DeleteItem($key: String!) {
    deleteItem(input: { key: $key }) {
      key
      deleted
    }
  }
`

const determineVisibilityRules = (
  isFilterable: boolean,
  showItemList: boolean,
  itemsLength: number,
  completedItemsLength: number,
  showCompletedToggle: boolean,
): {
  showCompletedToggle: boolean
  showFilterBar: boolean
  showDeleteButton: boolean
} => {
  return {
    // Show completed toggle if we have a completed item and we want to show the toggle
    showCompletedToggle: completedItemsLength > 0 && showCompletedToggle,
    // Show filter bar if the props isFilterable is set and we have more than one item and we haven't hidden all items
    showFilterBar: isFilterable && itemsLength > 0 && showItemList,
    // Show delete button if we have at least one deleted item
    showDeleteButton: completedItemsLength > 0 && showItemList,
  }
}

const generateItems = (
  allItems: Item[],
  showCompleted: boolean,
  componentKey: string,
): { sortedItems: Item[]; completedItems: Item[] } => {
  if (!allItems?.length)
    return {
      sortedItems: [],
      completedItems: [],
    }
  const uncompletedItems = allItems.filter((m) => m.completed == false)
  const completedItems = allItems.filter((m) => m.completed == true)
  const filteredItems = showCompleted ? uncompletedItems : allItems
  const sI = filteredItems?.map((i) => {
    // Items have different sort orders per component
    const sortOrder = i.sortOrders.find((s) => s.componentKey == componentKey)
    return {
      key: i.key,
      parentKey: i?.parent ? i.parent.key : null,
      children: i?.children,
      sortOrder: sortOrder ? sortOrder.sortOrder : null,
    }
  })
  return { sortedItems: orderBy(sI, 'sortOrder', 'asc'), completedItems: completedItems }
}

export type FilteredItemListProps = {
  componentKey: string
  isFilterable?: boolean
  hiddenIcons?: ItemIcons[]
  listName?: string
  filter: string
  legacyFilter?: string
  flattenSubtasks?: boolean
  showCompletedToggle?: boolean
  initiallyExpanded?: boolean
  hideDeletedSubtasks?: boolean
  hideCompletedSubtasks?: boolean
  readOnly?: boolean
  editing?: boolean
  setEditing?: (editing: boolean) => void
}

const FilteredItemList = (props: FilteredItemListProps): ReactElement => {
  const [sortType, setSortType] = useState(null)
  const [sortDirection, setSortDirection] = useState(null)
  const [showCompleted, setShowCompleted] = useState(true)
  const [showItemList, setShowItemList] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteItem] = useMutation(DELETE_ITEM)
  const [bulkCreateItemOrders] = useMutation(BULK_CREATE_ITEMORDERS)
  const [deleteItemOrdersByComponent] = useMutation(DELETE_ITEMORDERS_BY_COMPONENT)
  useTraceUpdate(props)

  const { loading, error, data, refetch } = useQuery(GET_DATA, {
    variables: {
      filter: props.filter ? props.filter : '',
      componentKey: props.componentKey,
    },
  })

  if (error) {
    console.log(error)
    return (
      <FailedFilteredItemList componentKey={props.componentKey} setEditing={props.setEditing} />
    )
  }

  const { sortedItems, completedItems } = generateItems(
    data?.items,
    showCompleted,
    props.componentKey,
  )

  const { showCompletedToggle, showFilterBar, showDeleteButton } = determineVisibilityRules(
    props.isFilterable,
    showItemList,
    data?.items?.length,
    completedItems?.length,
    props.showCompletedToggle,
  )

  const updateSort = (type: SortOption, direction: SortDirectionEnum) => {
    const sorted = type.sort(sortedItems, direction)

    // Bulk update the sort in the backend, by deleting it all and then inserting it
    deleteItemOrdersByComponent({
      variables: { componentKey: props.componentKey },
    })

    const sortedItemKeys = sorted.map((s) => s.key)
    bulkCreateItemOrders({
      variables: { itemKeys: sortedItemKeys, componentKey: props.componentKey },
    })
    refetch()
  }

  console.log('re-rendering filtered itemlist')
  // TODO: #338 Handle when items returned is null
  return (
    <Box m={0} p={0} w={'100%'} borderRadius={5} border="1px solid" borderColor="gray.200">
      <Grid
        position={'relative'}
        alignItems={'center'}
        py={4}
        px={2}
        mt={0}
        gridGap={1}
        borderRadius={0}
        borderTopRadius={5}
        gridTemplateRows={'40px'}
        gridTemplateColumns={'30px auto auto'}
        borderBottom={'1px solid'}
        borderColor={'gray.200'}
      >
        <GridItem colSpan={1}>
          <Button
            key={`btn-${props.componentKey}`}
            variant="default"
            size="sm"
            icon={showItemList == true ? 'collapse' : 'expand'}
            onClick={() => {
              setShowItemList(!showItemList)
            }}
            tooltipText="Hide items"
          />
        </GridItem>
        <GridItem colSpan={1}>
          <Flex direction={'row'} py={1} px={0} my={0} mx={2} alignItems={'baseline'}>
            <Text fontSize="lg">{props.listName}</Text>
            <Text fontSize="sm" py={0} px={2} minW={'80px'} color={'gray.500'}>
              {sortedItems
                ? sortedItems.length == 1
                  ? '1 item'
                  : sortedItems.length + ' items'
                : '0 items'}
            </Text>
          </Flex>
        </GridItem>
        <GridItem colSpan={1}>
          <Flex
            position={'relative'}
            direction={'row'}
            justifyContent={'flex-end'}
            alignItems={'center'}
          >
            {showFilterBar && (
              <Flex justifyContent={'space-around'} alignItems={'baseline'}>
                {showCompletedToggle && (
                  <Button
                    size="sm"
                    iconSize="14px"
                    variant="default"
                    icon={showCompleted ? 'hide' : 'show'}
                    onClick={() => {
                      setShowCompleted(!showCompleted)
                    }}
                    tooltipText={showCompleted ? 'Show completed items' : 'Hide completed items'}
                  />
                )}
                {showDeleteButton && (
                  <Button
                    size="sm"
                    iconSize="14px"
                    variant="default"
                    icon="trashSweep"
                    tooltipText="Delete completed items"
                    onClick={() => {
                      completedItems.forEach((c) => {
                        if (c.parent?.key == null) {
                          deleteItem({ variables: { key: c.key } })
                        }
                      })
                    }}
                  />
                )}
                <Button
                  variant="default"
                  size="sm"
                  icon="expandAll"
                  iconSize="14px"
                  tooltipText={'Expand all subtasks'}
                  onClick={() => {
                    sortedItems.forEach((a) => {
                      if (a.children.length > 0) {
                        let newState = cloneDeep(data?.subtasksVisible)
                        if (newState[a.key]) {
                          newState[a.key][props.componentKey] = true
                        } else {
                          newState[a.key] = {
                            [props.componentKey]: true,
                          }
                        }
                        subtasksVisibleVar(newState)
                      }
                    })
                  }}
                />
                <Button
                  size="sm"
                  variant="default"
                  icon="collapseAll"
                  iconSize="14px"
                  tooltipText={'Collapse all subtasks'}
                  onClick={() => {
                    sortedItems.forEach((a) => {
                      if (a.children.length > 0) {
                        let newState = cloneDeep(data?.subtasksVisible)
                        if (newState[a.key]) {
                          newState[a.key][props.componentKey] = false
                        } else {
                          newState[a.key] = {
                            [props.componentKey]: false,
                          }
                        }
                        subtasksVisibleVar(newState)
                      }
                    })
                  }}
                />
                <Box w={'145px'}>
                  <SortDropdown
                    defaultText="Due"
                    sortType={sortType}
                    sortDirection={sortDirection}
                    onSetSortDirection={(d) => {
                      setSortDirection(d)
                      updateSort(sortType, d)
                    }}
                    onSetSortType={(t) => {
                      setSortType(t)
                      updateSort(t, sortDirection)
                    }}
                  />
                </Box>
              </Flex>
            )}
          </Flex>
        </GridItem>
      </Grid>
      {props.editing ? (
        <Box>
          <EditFilteredItemList
            key={`dlg-${props.componentKey}`}
            componentKey={props.componentKey}
            onClose={() => {
              props.setEditing(false)
            }}
          />
        </Box>
      ) : showItemList ? (
        <>
          <Flex w={'100%'} transition={'0.2s ease-in-out'} py={0} px={3}>
            <ReorderableItemList
              key={props.componentKey}
              hideDeletedSubtasks={props.hideDeletedSubtasks}
              hideCompletedSubtasks={props.hideCompletedSubtasks}
              componentKey={props.componentKey}
              hiddenIcons={props.hiddenIcons}
              inputItems={sortedItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)}
              flattenSubtasks={props.flattenSubtasks}
            />
          </Flex>
          <Pagination
            itemsLength={sortedItems.length}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </>
      ) : null}
    </Box>
  )
}

export default FilteredItemList
