import React, { ReactElement, useState, useEffect } from 'react'
import ItemList from '../components/ItemList'
import { orderBy } from 'lodash'
import { themes, selectStyles } from '../theme'
import { ItemType, FeatureType, Item, RenderingStrategy } from '../interfaces'
import {
    Container,
    HeaderBar,
    SortContainer,
    SortSelect,
    ItemListContainer,
    ListHeader,
    ListItemCount,
    HideButtonContainer,
    FilterBar,
} from '../components/styled/FilteredItemList'
import { connect } from 'react-redux'
import Button from '../components/Button'
import Tooltip from '../components/Tooltip'
import { deleteItem } from '../actions/item'
import { getFilteredItems } from '../selectors/item'
import { components } from 'react-select'
import ReorderableItemList from '../components/ReorderableItemList'
import { ItemIcons } from '../interfaces/item'
import { hideSubtasks, showSubtasks, deleteComponent } from '../actions'
import { Uuid } from '@typed/uuid'
import { Icons } from '../assets/icons'
import { ThemeProvider } from '../StyledComponents'
import FilteredItemDialog from '../components/FilteredItemDialog'
import MoreDropdown from '../components/MoreDropdown'

const PAGE_SIZE = 25

const DropdownIndicator = (props): ReactElement => {
    return (
        <components.DropdownIndicator {...props}>
            {Icons['collapse']()}
        </components.DropdownIndicator>
    )
}

const sortItems = (
    items: ItemType[],
    criteria: SortCriteriaEnum,
    direction: SortDirectionEnum,
): ItemType[] => {
    switch (criteria) {
        case 'STATUS':
            return orderBy(items, [(i) => i.completed], direction)
        case 'DUE':
            return orderBy(items, [(i) => new Date(i.dueDate)], direction)
        case 'SCHEDULED':
            return orderBy(items, [(i) => new Date(i.scheduledDate)], direction)
        case 'LABEL':
            return orderBy(items, [(i) => i.labelId], direction)
        case 'CREATED':
            return orderBy(items, [(i) => new Date(i.createdAt)], direction)
        case 'UPDATED':
            return orderBy(items, [(i) => new Date(i.lastUpdatedAt)], direction)
        default:
            return items
    }
}

const sortOptions = [
    { value: 'DUE', label: 'Due' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'STATUS', label: 'Completed' },
    { value: 'LABEL', label: 'Label' },
    { value: 'CREATED', label: 'Created' },
    { value: 'UPDATED', label: 'Updated' },
]

export enum SortCriteriaEnum {
    Status = 'STATUS',
    Due = 'DUE',
    Scheduled = 'SCHEDULED',
    Label = 'LABEL',
    Created = 'CREATED',
    Updated = 'UPDATED',
}

export enum SortDirectionEnum {
    Ascending = 'asc',
    Descending = 'desc',
}

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
    hideAllSubtasks: (parentItems: ItemType[], componentId: Uuid) => void
    showAllSubtasks: (parentItems: ItemType[], componentId: Uuid) => void
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
    const [sortCriteria, setSortCriteria] = useState(SortCriteriaEnum.Due)
    const [sortDirection, setSortDirection] = useState(SortDirectionEnum.Ascending)
    const [hideCompleted, setHideCompleted] = useState(false)
    const [hideItemList, setHideItemList] = useState(Object.keys(props.items).length == 0)
    const [showEditDialog, setShowEditDialog] = useState(false)

    const theme = themes[props.theme]
    // TODO: Unsure if this should be done in state
    const allItems = Object.values(props.items)
    const uncompletedItems = Object.values(props.items).filter((m) => m.completed == false)
    const completedItems = Object.values(props.items).filter((m) => m.completed == true)
    const sortedItems = hideCompleted
        ? sortItems(uncompletedItems, sortCriteria, sortDirection)
        : sortItems(allItems, sortCriteria, sortDirection)

    const [currentPage, setCurrentPage] = useState(1)
    const totalPages = Math.ceil(sortedItems.length / PAGE_SIZE)

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

    const generatePagination = (pageSize: number, sortedItemsLength: number): ReactElement => {
        if (sortedItemsLength < pageSize) return null
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Button
                    type="default"
                    icon="slideLeft"
                    onClick={() => setCurrentPage(currentPage == 1 ? currentPage : currentPage - 1)}
                />
                {currentPage != 1 && (
                    <Button type="default" text={'1'} onClick={() => setCurrentPage(1)} />
                )}
                {currentPage >= 4 && '...'}
                {currentPage >= 3 && (
                    <Button
                        type="default"
                        text={(currentPage - 1).toString()}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    />
                )}

                <Button textWeight="700" type="default" text={currentPage.toString()} />
                {currentPage <= totalPages - 2 && (
                    <Button
                        type="default"
                        text={(currentPage + 1).toString()}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    />
                )}
                {currentPage <= totalPages - 2 && '...'}
                {currentPage != totalPages && (
                    <Button
                        type="default"
                        text={totalPages.toString()}
                        onClick={() => {
                            setCurrentPage(totalPages)
                        }}
                    />
                )}
                <Button
                    type="default"
                    icon="slideRight"
                    onClick={() =>
                        setCurrentPage(currentPage == totalPages ? totalPages : currentPage + 1)
                    }
                />
            </div>
        )
    }

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
                                            text={
                                                hideCompleted
                                                    ? 'Show completed items'
                                                    : 'Hide completed items'
                                            }
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
                                        <Tooltip
                                            id="trash-button"
                                            text={'Delete completed items'}
                                        />
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
                                    <SortContainer>
                                        <SortSelect
                                            options={sortOptions}
                                            defaultValue={sortOptions[0]}
                                            autoFocus={false}
                                            placeholder="Sort by:"
                                            components={{ DropdownIndicator }}
                                            defaultIsOpen={true}
                                            styles={selectStyles({
                                                fontSize: 'xxsmall',
                                                theme: themes[props.theme],
                                                showDropdownIndicator: true,
                                                minWidth: '100px',
                                            })}
                                            onChange={(e) => {
                                                setSortCriteria(e.value)
                                            }}
                                        />
                                        <Button
                                            dataFor={'sort-direction-button'}
                                            type="default"
                                            spacing="compact"
                                            iconSize="18px"
                                            translateZ={
                                                sortDirection == SortDirectionEnum.Ascending ? 1 : 0
                                            }
                                            icon={'sort'}
                                            onClick={() => {
                                                sortDirection == SortDirectionEnum.Ascending
                                                    ? setSortDirection(SortDirectionEnum.Descending)
                                                    : setSortDirection(SortDirectionEnum.Ascending)
                                            }}
                                        />
                                        <Tooltip
                                            id="sort-direction-button"
                                            text={'Toggle sort direction'}
                                        />
                                    </SortContainer>
                                )}
                            </>
                        )}
                    </FilterBar>
                    <MoreDropdown
                        options={[
                            {
                                icon: 'trash',
                                label: 'Delete Component',
                                onClick: (e: React.MouseEvent) => props.deleteComponent(props.id),
                            },
                            {
                                icon: 'edit',
                                label: 'Edit Component',
                                onClick: (e: React.MouseEvent) => setShowEditDialog(true),
                            },
                        ]}
                    />
                    {showEditDialog && (
                        <FilteredItemDialog
                            key={`dlg-${props.id}`}
                            componentId={props.id}
                            listName={props.listName}
                            filter={props.filter}
                            isFilterable={props.isFilterable}
                            onClose={() => setShowEditDialog(false)}
                            showSubtasks={
                                props.renderingStrategy == RenderingStrategy.All ? true : false
                            }
                        />
                    )}
                </HeaderBar>
                {!hideItemList && (
                    <ItemListContainer>
                        {props.features.dragAndDrop ? (
                            <ReorderableItemList
                                componentId={props.id}
                                hideIcons={props.hideIcons}
                                inputItems={sortedItems}
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
                {generatePagination(PAGE_SIZE, sortedItems.length)}
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
    hideAllSubtasks: (allItems: ItemType[], componentId: Uuid) => {
        allItems.forEach((a) => {
            if (a.children.length > 0) {
                dispatch(hideSubtasks(a.id, componentId))
            }
        })
    },
    showAllSubtasks: (allItems: ItemType[], componentId: Uuid) => {
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
