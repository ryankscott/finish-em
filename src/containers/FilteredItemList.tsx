import React, { ReactElement, useState, useEffect } from 'react'
import ItemList from '../components/ItemList'
import { orderBy } from 'lodash'
import { themes, selectStyles } from '../theme'
import { Header1, Paragraph } from '../components/Typography'
import { ItemType, FeatureType, Item, RenderingStrategy } from '../interfaces'
import {
    Container,
    HeaderBar,
    ListName,
    FilterBar,
    CompletedContainer,
    SortContainer,
    SortSelect,
    DeleteContainer,
    ItemListContainer,
    ExpandContainer,
    CollapseContainer,
} from '../components/styled/FilteredItemList'
import { connect } from 'react-redux'
import Button from '../components/Button'
import Tooltip from '../components/Tooltip'
import { deleteItem } from '../actions/item'
import { getFilteredItems, getCompletedItems, getUncompletedItems } from '../selectors/item'
import { components } from 'react-select'
import ReorderableItemList from '../components/ReorderableItemList'
import { convertItemToItemType } from '../utils'
import { ItemIcons } from '../components/Item'
import { hideSubtasks, showSubtasks } from '../actions'
import { Uuid } from '@typed/uuid'
import { Icons } from '../assets/icons'

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
        default:
            return items
    }
}

const sortOptions = [
    { value: 'DUE', label: 'Due' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'STATUS', label: 'Completed' },
    { value: 'LABEL', label: 'Label' },
]

export enum SortCriteriaEnum {
    Status = 'STATUS',
    Due = 'DUE',
    Scheduled = 'SCHEDULED',
    Label = 'LABEL',
}

export enum SortDirectionEnum {
    Ascending = 'asc',
    Descending = 'desc',
}

const determineVisibilityRules = (
    isFilterable: boolean,
    hideItemList: boolean,
    items: ItemType[],
    sortedItems: ItemType[],
    completedItems: ItemType[],
    dragAndDropEnabled: boolean,
    hideCompletedToggle: boolean,
): {
    showCompletedToggle: boolean
    showFilterBar: boolean
    showDeleteButton: boolean
    showSortButton: boolean
} => {
    // Show completed toggle if we have a completed item and it hasn't been disabled
    const showCompletedToggle = completedItems.length > 0 && !hideCompletedToggle
    // Show filter bar if the props isFilterable is set and we have more than one item and we haven't hidden all items
    const showFilterBar = isFilterable && Object.keys(items).length > 0 && !hideItemList
    // Show delete button if we have at least one deleted item
    const showDeleteButton = completedItems.length > 0 && !hideItemList
    // Show sort button if we have more than one item and we're not hiding the item list and drag and drop is not enabled
    const showSortButton =
        Object.keys(sortedItems).length > 1 && !hideItemList && !dragAndDropEnabled
    return {
        showCompletedToggle,
        showFilterBar,
        showDeleteButton,
        showSortButton,
    }
}

interface StateProps {
    items: Item
    completedItems: Item
    uncompletedItems: Item
    features: FeatureType
    theme: string
}

interface DispatchProps {
    deleteCompletedItems: (completedItems: ItemType[]) => void
    hideAllSubtasks: (parentItems: ItemType[], componentId: Uuid) => void
    showAllSubtasks: (parentItems: ItemType[], componentId: Uuid) => void
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
}
export type FilteredItemListProps = StateProps & DispatchProps & OwnProps

function FilteredItemList(props: FilteredItemListProps): ReactElement {
    const [sortCriteria, setSortCriteria] = useState(SortCriteriaEnum.Due)
    const [sortDirection, setSortDirection] = useState(SortDirectionEnum.Ascending)
    const [hideCompleted, setHideCompleted] = useState(false)
    const [hideItemList, setHideItemList] = useState(Object.keys(props.items).length == 0)

    // TODO: Unsure if this should be done in state
    const allItems = props.items
    const completedItems = props.completedItems
    const sortedItems = hideCompleted
        ? sortItems(convertItemToItemType(props.uncompletedItems), sortCriteria, sortDirection)
        : sortItems(convertItemToItemType(allItems), sortCriteria, sortDirection)

    useEffect(() => {
        setHideItemList(Object.keys(props.items).length == 0)
    }, [props.items])

    const visibility = determineVisibilityRules(
        props.isFilterable,
        hideItemList,
        Object.values(props.items),
        sortedItems,
        Object.values(completedItems),
        props.features.dragAndDrop,
        props.hideCompletedToggle,
    )
    const sortedItemsLength = Object.keys(sortedItems).length
    return (
        <Container>
            <HeaderBar>
                <ListName>
                    <Button
                        type="default"
                        icon={'expand'}
                        rotate={hideItemList == true ? 0 : 1}
                        onClick={() => setHideItemList(!hideItemList)}
                    ></Button>
                    <Header1>
                        {props.listName}
                        <Paragraph>
                            {sortedItemsLength + (sortedItemsLength == 1 ? ' item' : ' items')}
                        </Paragraph>
                    </Header1>
                </ListName>
                {visibility.showFilterBar && (
                    <FilterBar>
                        <CompletedContainer visible={visibility.showCompletedToggle}>
                            <Button
                                dataFor="complete-button"
                                iconSize="18px"
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
                                    hideCompleted ? 'Show completed items' : 'Hide completed items'
                                }
                            />
                        </CompletedContainer>
                        {visibility.showDeleteButton && (
                            <DeleteContainer>
                                <Button
                                    dataFor="trash-button"
                                    spacing="compact"
                                    iconSize="18px"
                                    type="default"
                                    icon="trashSweep"
                                    onClick={() => {
                                        props.deleteCompletedItems(
                                            convertItemToItemType(props.completedItems),
                                        )
                                    }}
                                ></Button>
                                <Tooltip id="trash-button" text={'Delete completed items'} />
                            </DeleteContainer>
                        )}
                        <ExpandContainer>
                            <Button
                                dataFor={'expand-all-button'}
                                type="default"
                                spacing="compact"
                                icon="expandAll"
                                iconSize={'18px'}
                                onClick={() => props.showAllSubtasks(sortedItems, props.id)}
                            />
                            <Tooltip id="expand-all-button" text={'Expand all subtaks'} />
                        </ExpandContainer>
                        <CollapseContainer>
                            <Button
                                dataFor={'collapse-all-button'}
                                type="default"
                                spacing="compact"
                                icon="collapseAll"
                                iconSize={'18px'}
                                onClick={() => props.hideAllSubtasks(sortedItems, props.id)}
                            />
                            <Tooltip id="collapse-all-button" text={'Collapse all subtaks'} />
                        </CollapseContainer>
                        {visibility.showSortButton && (
                            <SortContainer>
                                <SortSelect
                                    options={sortOptions}
                                    defaultValue={sortOptions[0]}
                                    autoFocus={false}
                                    placeholder="Sort by:"
                                    components={{ DropdownIndicator }}
                                    defaultIsOpen={true}
                                    styles={{
                                        ...selectStyles({
                                            fontSize: 'xxsmall',
                                            theme: themes[props.theme],
                                            showDropdownIndicator: true,
                                            minWidth: '100px',
                                        }),
                                    }}
                                    onChange={(e) => {
                                        setSortCriteria(e.value)
                                    }}
                                />
                                <Button
                                    dataFor={'sort-direction-button'}
                                    type="default"
                                    spacing="compact"
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
                    </FilterBar>
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
                            inputItems={sortedItems}
                            renderingStrategy={props.renderingStrategy}
                        />
                    )}
                </ItemListContainer>
            )}
        </Container>
    )
}

const mapStateToProps = (state, props): StateProps => {
    return {
        items: getFilteredItems(state, props),
        completedItems: getCompletedItems(state, props),
        uncompletedItems: getUncompletedItems(state, props),
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
})
export default connect(mapStateToProps, mapDispatchToProps)(FilteredItemList)
