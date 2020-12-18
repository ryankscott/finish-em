import React, { ReactElement, useState } from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'
import ItemList from './ItemList'
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
  ErrorContainer,
} from './styled/FilteredItemList'

import SortDropdown, { SortDirectionEnum, sortOptions } from './SortDropdown'
import Button from './Button'
import ReorderableItemList from './ReorderableItemList'
import { ThemeProvider } from '../StyledComponents'
import { PAGE_SIZE } from '../consts'
import EditFilteredItemList from './EditFilteredItemList'
import Pagination from './Pagination'
import { cloneDeep, transform } from 'lodash'
import { subtasksVisibleVar } from '..'
import { toast } from 'react-toastify'

const determineVisibilityRules = (
  isFilterable: boolean,
  showItemList: boolean,
  itemsLength: number,
  sortedItemsLength: number,
  completedItemsLength: number,
  dragAndDropEnabled: boolean,
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
    showSortButton: sortedItemsLength >= 1 && showItemList && !dragAndDropEnabled,
  }
}

const GET_DATA = gql`
  query itemsByFilter($filter: String!) {
    items: itemsByFilter(filter: $filter) {
      key
      text
      completed
      deleted
      dueAt
      scheduledAt
      lastUpdatedAt
      createdAt
      reminders {
        key
        remindAt
      }
      area {
        key
        name
      }
      project {
        key
        name
      }
      parent {
        key
      }
      children {
        key
        project {
          key
          name
        }
      }
      sortOrder {
        sortOrder
      }
    }
    dragAndDrop: featureByName(name: "dragAndDrop") {
      key
      enabled
    }
    subtasksVisible @client
  }
`

const GET_THEME = gql`
  query {
    theme @client
  }
`

const DELETE_COMPONENT = gql`
  mutation DeleteComponent($key: String!) {
    deleteComponent(input: { key: $key }) {
      key
    }
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
}

function FilteredItemList(props: FilteredItemListProps): ReactElement {
  const [sortType, setSortType] = useState(sortOptions.DUE)
  const [sortDirection, setSortDirection] = useState(SortDirectionEnum.Ascending)
  const [showCompleted, setShowCompleted] = useState(true)
  const [showItemList, setShowItemList] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [isEditing, setIsEditing] = useState(false)
  const [deleteItem] = useMutation(DELETE_ITEM)
  const [deleteComponent] = useMutation(DELETE_COMPONENT, {
    update(cache, { data: { deleteComponent } }) {
      cache.evict({ id: deleteComponent })
    },
  })

  const { loading: loadingTheme, error: errorTheme, data: dataTheme } = useQuery(GET_THEME)
  if (loadingTheme) return null
  if (errorTheme) return null
  const theme = themes[dataTheme.theme]

  // TODO: I shouldn't really use polling here, but can't work out how else to refetch the data
  const { loading, error, data } = useQuery(GET_DATA, {
    variables: {
      filter: props.filter ? props.filter : '',
    },
    //pollInterval: 2000,
  })

  if (loading) return null
  if (error) {
    console.log(error)
    toast.error('Component failed to load - please reconfigure', {
      autoClose: 5000,
    })
    return (
      <ThemeProvider theme={theme}>
        <ErrorContainer>
          <EditableContainer>
            <EditFilteredItemList
              key={`dlg-${props.componentKey}`}
              componentKey={props.componentKey}
              onClose={() => {
                setIsEditing(false)
              }}
            />
          </EditableContainer>
        </ErrorContainer>
      </ThemeProvider>
    )
  }

  const allItems = data.items
  const uncompletedItems = data.items.filter((m) => m.completed == false)
  const completedItems = data.items.filter((m) => m.completed == true)
  const sortedItems = showCompleted
    ? sortType.sort(uncompletedItems, sortDirection)
    : sortType.sort(allItems, sortDirection)

  const visibility = determineVisibilityRules(
    props.isFilterable,
    showItemList,
    allItems.length,
    sortedItems.length,
    completedItems.length,
    data.dragAndDrop.enabled,
    props.showCompletedToggle,
  )
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
              {sortedItems.length == 1 ? '1 item' : sortedItems.length + ' items'}
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
                        let newState = cloneDeep(data.subtasksVisible)
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
                        let newState = cloneDeep(data.subtasksVisible)
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
                {visibility.showSortButton && (
                  <SortDropdown
                    sortDirection={sortDirection}
                    onSetSortDirection={(d) => setSortDirection(d)}
                    onSetSortType={(t) => {
                      setSortType(t)
                    }}
                  ></SortDropdown>
                )}
              </>
            )}
            {!props.readOnly && (
              <>
                <Button
                  type="default"
                  icon="edit"
                  tooltipText="Edit component"
                  onClick={() => {
                    setIsEditing(true)
                  }}
                ></Button>
                <Button
                  type="default"
                  icon="trash"
                  tooltipText="Delete component"
                  onClick={() => deleteComponent({ variables: { key: props.componentKey } })}
                ></Button>
              </>
            )}
          </FilterBar>
        </HeaderBar>
        {isEditing ? (
          <EditableContainer>
            <EditFilteredItemList
              key={`dlg-${props.componentKey}`}
              componentKey={props.componentKey}
              onClose={() => {
                setIsEditing(false)
              }}
            />
          </EditableContainer>
        ) : showItemList ? (
          data.dragAndDropEnabled ? (
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
          ) : (
            <>
              <ItemListContainer>
                <ItemList
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
          )
        ) : null}
      </Container>
    </ThemeProvider>
  )
}

export default FilteredItemList
