import React, { ReactElement, useState } from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'
import { themes } from '../theme'
import { ItemIcons } from '../interfaces'
import {
  Container,
  HeaderBar,
  ItemListContainer,
  ListHeader,
  ListItemCount,
  HideButtonContainer,
  EditableContainer,
  FilterBar,
} from './styled/FilteredItemList'

import SortDropdown, { SortDirectionEnum, SortOption, sortOptions } from './SortDropdown'
import Button from './Button'
import ReorderableItemList from './ReorderableItemList'
import { ThemeProvider } from '../StyledComponents'
import { PAGE_SIZE } from '../consts'
import EditFilteredItemList from './EditFilteredItemList'
import Pagination from './Pagination'
import { cloneDeep, orderBy } from 'lodash'
import { subtasksVisibleVar } from '..'

const determineVisibilityRules = (
  isFilterable: boolean,
  showItemList: boolean,
  itemsLength: number,
  sortedItemsLength: number,
  completedItemsLength: number,
  showCompletedToggle: boolean,
): {
  showCompletedToggle: boolean
  showFilterBar: boolean
  showDeleteButton: boolean
  showSortButton: boolean
} => {
  return {
    // Show completed toggle if we have a completed item and we want to show the toggle
    showCompletedToggle: completedItemsLength > 0 && showCompletedToggle,
    // Show filter bar if the props isFilterable is set and we have more than one item and we haven't hidden all items
    showFilterBar: isFilterable && itemsLength > 0 && showItemList,
    // Show delete button if we have at least one deleted item
    showDeleteButton: completedItemsLength > 0 && showItemList,
    // Show sort button if we have more than one item and we're not hiding the item list and drag and drop is not enabled
    showSortButton: sortedItemsLength >= 1 && showItemList,
  }
}
const GET_THEME = gql`
  query {
    theme @client
  }
`

const GET_DATA = gql`
  query itemsByFilter($filter: String!, $componentKey: String!) {
    items: itemsByFilter(filter: $filter, componentKey: $componentKey) {
      key
      completed
      dueAt
      repeat
      label {
        key
      }
      lastUpdatedAt
      project {
        key
      }
      parent {
        key
      }
      children {
        key
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
  readOnly?: boolean
  editing?: boolean
  setEditing?: (editing: boolean) => void
}

function FilteredItemList(props: FilteredItemListProps): ReactElement {
  const [sortType, setSortType] = useState(null)
  const [sortDirection, setSortDirection] = useState(null)
  const [showCompleted, setShowCompleted] = useState(true)
  const [showItemList, setShowItemList] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteItem] = useMutation(DELETE_ITEM)
  const [bulkCreateItemOrders] = useMutation(BULK_CREATE_ITEMORDERS)
  const [deleteItemOrdersByComponent] = useMutation(DELETE_ITEMORDERS_BY_COMPONENT)

  const { loading: l, error: e, data: themeData } = useQuery(GET_THEME)
  const { loading, error, data, refetch } = useQuery(GET_DATA, {
    variables: {
      filter: props.filter ? props.filter : '',
      componentKey: props.componentKey,
    },
  })
  const theme = themes[themeData.theme]
  if (error) return null
  const allItems = data?.items

  const uncompletedItems = data?.items.filter((m) => m.completed == false)
  const completedItems = data?.items.filter((m) => m.completed == true)

  const sI = data?.items.map((i) => {
    const sortOrder = i.sortOrders.find((s) => s.componentKey == props.componentKey)
    return {
      key: i.key,
      parentKey: i?.parent ? i.parent.key : null,
      children: i?.children.map((c) => c.key),
      sortOrder: sortOrder ? sortOrder.sortOrder : null,
    }
  })
  const sortedItems = orderBy(sI, 'sortOrder', 'asc')

  const subtasksVisible = data?.subtasksVisible ? data.subtasksVisible : false

  const visibility = determineVisibilityRules(
    props.isFilterable,
    showItemList,
    allItems?.length,
    sortedItems?.length,
    completedItems?.length,
    props.showCompletedToggle,
  )

  const updateSort = (type: SortOption, direction: SortDirectionEnum) => {
    const sortedItems = showCompleted
      ? type.sort(uncompletedItems, direction)
      : type.sort(allItems, direction)
    deleteItemOrdersByComponent({
      variables: { componentKey: props.componentKey },
    })
    const sortedItemKeys = sortedItems.map((s) => s.key)
    bulkCreateItemOrders({
      variables: { itemKeys: sortedItemKeys, componentKey: props.componentKey },
    })
    refetch()
  }

  // TODO: #338 Handle when items returned is null
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <HeaderBar>
          <HideButtonContainer>
            <Button
              key={`btn-${props.componentKey}`}
              type="default"
              icon="expand"
              rotate={showItemList == true ? 1 : 0}
              onClick={() => {
                setShowItemList(!showItemList)
              }}
              tooltipText="Hide items"
            />
          </HideButtonContainer>
          <ListHeader>
            {props.listName}
            <ListItemCount>
              {sortedItems
                ? sortedItems.length == 1
                  ? '1 item'
                  : sortedItems.length + ' items'
                : '0 items'}
            </ListItemCount>
          </ListHeader>
          <FilterBar>
            {visibility.showFilterBar && (
              <>
                {visibility.showCompletedToggle && (
                  <>
                    <Button
                      height="22px"
                      width="22px"
                      iconSize="14px"
                      type="default"
                      spacing="compact"
                      icon={showCompleted ? 'hide' : 'show'}
                      onClick={() => {
                        setShowCompleted(!showCompleted)
                      }}
                      tooltipText={showCompleted ? 'Show completed items' : 'Hide completed items'}
                    ></Button>
                  </>
                )}
                {visibility.showDeleteButton && (
                  <>
                    <Button
                      spacing="compact"
                      height="22px"
                      width="22px"
                      iconSize="14px"
                      type="default"
                      icon="trashSweep"
                      tooltipText="Delete completed items"
                      onClick={() => {
                        completedItems.forEach((c) => {
                          if (c.parent?.key == null) {
                            deleteItem({ variables: { key: c.key } })
                          }
                        })
                      }}
                    ></Button>
                  </>
                )}
                <Button
                  type="default"
                  spacing="compact"
                  icon="expandAll"
                  height="22px"
                  width="22px"
                  iconSize="14px"
                  tooltipText={'Expand all subtasks'}
                  onClick={() => {
                    sortedItems.forEach((a) => {
                      if (a.children.length > 0) {
                        let newState = cloneDeep(subtasksVisible)
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
                  type="default"
                  spacing="compact"
                  icon="collapseAll"
                  height="22px"
                  width="22px"
                  iconSize="14px"
                  tooltipText={'Collapse all subtasks'}
                  onClick={() => {
                    sortedItems.forEach((a) => {
                      if (a.children.length > 0) {
                        let newState = cloneDeep(subtasksVisible)
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
                <SortDropdown
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
              </>
            )}
          </FilterBar>
        </HeaderBar>
        {props.editing ? (
          <EditableContainer>
            <EditFilteredItemList
              key={`dlg-${props.componentKey}`}
              componentKey={props.componentKey}
              onClose={() => {
                props.setEditing(false)
              }}
            />
          </EditableContainer>
        ) : showItemList ? (
          <>
            <ItemListContainer>
              <ReorderableItemList
                key={props.componentKey}
                componentKey={props.componentKey}
                hiddenIcons={props.hiddenIcons}
                inputItems={sortedItems.slice(
                  (currentPage - 1) * PAGE_SIZE,
                  currentPage * PAGE_SIZE,
                )}
                flattenSubtasks={props.flattenSubtasks}
              />
            </ItemListContainer>
            <Pagination
              itemsLength={sortedItems.length}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </>
        ) : null}
      </Container>
    </ThemeProvider>
  )
}

export default FilteredItemList
