import React, { ReactElement, useState, useEffect } from 'react'
import ItemList from './ItemList'
import { themes } from '../theme'
import { ItemType, FeatureType, Item, RenderingStrategy } from '../interfaces'
import {
  Container,
  HeaderBar,
  ItemListContainer,
  ListHeader,
  ListItemCount,
  HideButtonContainer,
  FilterBar,
} from './styled/FilteredItemList'
import { connect } from 'react-redux'

import SortDropdown, { SortDirectionEnum, sortOptions } from './SortDropdown'
import Button from './Button'
import Tooltip from './Tooltip'
import { deleteItem } from '../actions/item'
import { getFilteredItems } from '../selectors/item'
import ReorderableItemList from './ReorderableItemList'
import { ItemIcons } from '../interfaces/item'
import { hideSubtasks, showSubtasks, deleteComponent } from '../actions'
import { ThemeProvider } from '../StyledComponents'
import { PAGE_SIZE } from '../consts'
import FilteredItemDialog from './FilteredItemDialog'
import MoreDropdown from './MoreDropdown'
import Pagination from './Pagination'

const determineVisibilityRules = (
  isFilterable: boolean,
  hideItemList: boolean,
  itemsLength: number,
  sortedItemsLength: number,
  completedItemsLength: number,
  dragAndDropEnabled: boolean,
  hideCompletedToggle: boolean,
): {
  showCompletedToggle: boolean
  showFilterBar: boolean
  showDeleteButton: boolean
  showSortButton: boolean
} => {
  // Show completed toggle if we have a completed item and it hasn't been disabled
  const showCompletedToggle = completedItemsLength > 0 && !hideCompletedToggle
  // Show filter bar if the props isFilterable is set and we have more than one item and we haven't hidden all items
  const showFilterBar = isFilterable && itemsLength > 0 && !hideItemList
  // Show delete button if we have at least one deleted item
  const showDeleteButton = completedItemsLength > 0 && !hideItemList
  // Show sort button if we have more than one item and we're not hiding the item list and drag and drop is not enabled
  const showSortButton = sortedItemsLength >= 1 && !hideItemList && !dragAndDropEnabled
  return {
    showCompletedToggle,
    showFilterBar,
    showDeleteButton,
    showSortButton,
  }
}

interface StateProps {
  items: Item
  features: FeatureType
  theme: string
}

interface DispatchProps {
  deleteCompletedItems: (completedItems: ItemType[]) => void
  hideAllSubtasks: (parentItems: ItemType[], componentId: string) => void
  showAllSubtasks: (parentItems: ItemType[], componentId: string) => void
  deleteComponent: (componentId: string) => void
}

export interface OwnProps {
  id: string
  filter: string
  hideIcons: ItemIcons[]
  isFilterable?: boolean
  listName?: string
  renderingStrategy?: RenderingStrategy
  defaultSortOrder?: SortCriteriaEnum
  noIndentOnSubtasks?: boolean
  hideCompletedToggle?: boolean
  readOnly?: boolean
}
export type FilteredItemListProps = StateProps & DispatchProps & OwnProps

function FilteredItemList(props: FilteredItemListProps): ReactElement {
  const [sortType, setSortType] = useState(sortOptions.DUE)
  const [sortDirection, setSortDirection] = useState(SortDirectionEnum.Ascending)
  const [hideCompleted, setHideCompleted] = useState(false)
  const [hideItemList, setHideItemList] = useState(Object.keys(props.items).length == 0)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const theme = themes[props.theme]
  // TODO: Unsure if this should be done in state
  const allItems = Object.values(props.items)
  const uncompletedItems = Object.values(props.items).filter((m) => m.completed == false)
  const completedItems = Object.values(props.items).filter((m) => m.completed == true)
  const sortedItems = hideCompleted
    ? sortType.sort(uncompletedItems, sortDirection)
    : sortType.sort(allItems, sortDirection)

  useEffect(() => {
    setHideItemList(Object.keys(props.items).length == 0)
  }, [props.items])

  const visibility = determineVisibilityRules(
    props.isFilterable,
    hideItemList,
    allItems.length,
    sortedItems.length,
    completedItems.length,
    props.features.dragAndDrop,
    props.hideCompletedToggle,
  )

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <HeaderBar>
          <HideButtonContainer>
            <Button
              dataFor="hide-itemlist-button"
              key={`btn-${props.id}`}
              type="default"
              icon="expand"
              rotate={hideItemList == true ? 0 : 1}
              onClick={() => {
                setHideItemList(!hideItemList)
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
                      icon={hideCompleted ? 'show' : 'hide'}
                      onClick={() => {
                        setHideCompleted(!hideCompleted)
                      }}
                    ></Button>
                    <Tooltip
                      id="complete-button"
                      text={hideCompleted ? 'Show completed items' : 'Hide completed items'}
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
                        props.deleteCompletedItems(completedItems)
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
                  onClick={() => props.showAllSubtasks(sortedItems, props.id)}
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
                  onClick={() => props.hideAllSubtasks(sortedItems, props.id)}
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
                    onClick: () => props.deleteComponent(props.id),
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
              key={`dlg-${props.id}`}
              componentId={props.id}
              listName={props.listName}
              filter={props.filter}
              isFilterable={props.isFilterable}
              onClose={() => setShowEditDialog(false)}
              showSubtasks={props.renderingStrategy == RenderingStrategy.All ? true : false}
            />
          )}
        </HeaderBar>
        {!hideItemList && (
          <ItemListContainer>
            {props.features.dragAndDrop ? (
              <ReorderableItemList
                componentId={props.id}
                hideIcons={props.hideIcons}
                inputItems={sortedItems.slice(
                  (currentPage - 1) * PAGE_SIZE,
                  currentPage * PAGE_SIZE,
                )}
                renderingStrategy={props.renderingStrategy}
              />
            ) : (
              <ItemList
                componentId={props.id}
                hideIcons={props.hideIcons}
                inputItems={sortedItems.slice(
                  (currentPage - 1) * PAGE_SIZE,
                  currentPage * PAGE_SIZE,
                )}
                renderingStrategy={props.renderingStrategy}
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

const mapStateToProps = (state, props): StateProps => {
  return {
    items: getFilteredItems(state, props),
    features: state.features,
    theme: state.ui.theme,
  }
}
const mapDispatchToProps = (dispatch): DispatchProps => ({
  hideAllSubtasks: (allItems: ItemType[], componentId: string) => {
    allItems.forEach((a) => {
      if (a.children.length > 0) {
        dispatch(hideSubtasks(a.id, componentId))
      }
    })
  },
  showAllSubtasks: (allItems: ItemType[], componentId: string) => {
    allItems.forEach((a) => {
      if (a.children.length > 0) {
        dispatch(showSubtasks(a.id, componentId))
      }
    })
  },

  // TODO: Move this to the reducer and create a new action
  deleteCompletedItems: (completedItems: ItemType[]) => {
    completedItems.forEach((c) => {
      if (c.parentId == null) {
        dispatch(deleteItem(c.id))
      }
    })
  },
  deleteComponent: (componentId: string) => {
    dispatch(deleteComponent(componentId))
  },
})
export default connect(mapStateToProps, mapDispatchToProps)(FilteredItemList)
