import React, { ReactElement, useState, useEffect } from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'
import ItemList from './ItemList'
import { themes } from '../theme'
import { ItemIcons, ItemType } from '../interfaces'
import {
  Container,
  HeaderBar,
  ItemListContainer,
  ListHeader,
  ListItemCount,
  HideButtonContainer,
  FilterBar,
} from './styled/FilteredItemList'

import SortDropdown, { SortDirectionEnum, sortOptions } from './SortDropdown'
import Button from './Button'
import Tooltip from './Tooltip'
import ReorderableItemList from './ReorderableItemList'
import { ThemeProvider } from '../StyledComponents'
import { PAGE_SIZE } from '../consts'
import FilteredItemDialog from './FilteredItemDialog'
import MoreDropdown from './MoreDropdown'
import Pagination from './Pagination'
import { cloneDeep, get, set } from 'lodash'
import { subtasksVisibleVar } from '..'

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
      completed
      deleted
      parent {
        key
      }
      children {
        key
      }
      sortOrder {
        sortOrder
      }
    }
    dragAndDrop: featureByName(name: "dragAndDrop") {
      key
      enabled
    }
    theme @client
    subtasksVisible @client
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
  isFilterable: boolean
  hiddenIcons: ItemIcons[]
  listName: string
  filter: string
  legacyFilter: string
  flattenSubtasks: boolean
  showCompletedToggle: boolean
  initiallyExpanded: boolean
  readOnly: boolean
}

function FilteredItemList(props: FilteredItemListProps): ReactElement {
  const [sortType, setSortType] = useState(sortOptions.DUE)
  const [sortDirection, setSortDirection] = useState(SortDirectionEnum.Ascending)
  const [showCompleted, setShowCompleted] = useState(false)
  const [showItemList, setShowItemList] = useState(true)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteItem] = useMutation(DELETE_ITEM)
  const [deleteComponent] = useMutation(DELETE_COMPONENT, {
    update(cache, { data: { deleteComponent } }) {
      cache.evict({ key: deleteComponent })
    },
  })
  const { loading, error, data } = useQuery(GET_DATA, {
    variables: {
      filter: props.filter ? props.filter : '',
    },
  })

  // TODO: Work out how to do this with apollo
  //  useEffect(() => {
  //    setShowItemList(props.initiallyExpanded ? props.initiallyExpanded : data?.items.length > 0)
  //  }, [data?.items])

  if (loading) return null
  if (error) return null

  const theme = themes[data.theme]

  // TODO: Unsure if this should be done in state
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
              dataFor="hide-itemlist-button"
              key={`btn-${props.componentKey}`}
              type="default"
              icon="expand"
              rotate={showItemList == true ? 1 : 0}
              onClick={() => {
                setShowItemList(!showItemList)
              }}
            />
            <Tooltip id="hide-itemlist-button" text={'Hide items'} />
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
                      dataFor="complete-button"
                      height="22px"
                      width="22px"
                      iconSize="14px"
                      type="default"
                      spacing="compact"
                      icon={showCompleted ? 'hide' : 'show'}
                      onClick={() => {
                        setShowCompleted(!showCompleted)
                      }}
                    ></Button>
                    <Tooltip
                      id="complete-button"
                      text={showCompleted ? 'Hide completed items' : 'Show completed items'}
                    />
                  </>
                )}
                {visibility.showDeleteButton && (
                  <>
                    <Button
                      dataFor="trash-button"
                      spacing="compact"
                      height="22px"
                      width="22px"
                      iconSize="14px"
                      type="default"
                      icon="trashSweep"
                      onClick={() => {
                        completedItems.forEach((c) => {
                          if (c.parent?.key == null) {
                            deleteItem({ variables: { key: c.key } })
                          }
                        })
                      }}
                    ></Button>
                    <Tooltip id="trash-button" text={'Delete completed items'} />
                  </>
                )}
                <Button
                  dataFor={'expand-all-button'}
                  type="default"
                  spacing="compact"
                  icon="expandAll"
                  height="22px"
                  width="22px"
                  iconSize="14px"
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
                <Tooltip id="expand-all-button" text={'Expand all subtasks'} />
                <Button
                  dataFor={'collapse-all-button'}
                  type="default"
                  spacing="compact"
                  icon="collapseAll"
                  height="22px"
                  width="22px"
                  iconSize="14px"
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
                <Tooltip id="collapse-all-button" text={'Collapse all subtasks'} />
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
          </FilterBar>
          <div style={{ gridArea: 'more' }}>
            {!props.readOnly && (
              <MoreDropdown
                options={[
                  {
                    icon: 'trash',
                    label: 'Delete Component',
                    onClick: () => deleteComponent({ variables: { key: props.componentKey } }),
                  },
                  {
                    icon: 'edit',
                    label: 'Edit Component',
                    onClick: () => setShowEditDialog(true),
                  },
                ]}
              />
            )}
          </div>
          {showEditDialog && (
            <FilteredItemDialog
              key={`dlg-${props.componentKey}`}
              componentKey={props.componentKey}
              onClose={() => {
                setShowEditDialog(false)
              }}
            />
          )}
        </HeaderBar>
        {showItemList && (
          <ItemListContainer>
            {data.dragAndDrop.enabled ? (
              <ReorderableItemList
                componentKey={props.componentKey}
                hiddenIcons={props.hiddenIcons}
                inputItems={sortedItems.slice(
                  (currentPage - 1) * PAGE_SIZE,
                  currentPage * PAGE_SIZE,
                )}
                flattenSubtasks={props.flattenSubtasks}
              />
            ) : (
              <ItemList
                componentKey={props.componentKey}
                hiddenIcons={props.hiddenIcons}
                inputItems={sortedItems.slice(
                  (currentPage - 1) * PAGE_SIZE,
                  currentPage * PAGE_SIZE,
                )}
                flattenSubtasks={props.flattenSubtasks}
              />
            )}
          </ItemListContainer>
        )}
        <Pagination
          itemsLength={sortedItems.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </Container>
    </ThemeProvider>
  )
}

export default FilteredItemList
