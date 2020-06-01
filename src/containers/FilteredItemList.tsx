import React, { ReactElement, useState } from 'react'
import ItemList from '../components/ItemList'
import { orderBy } from 'lodash'
import { themes, selectStyles } from '../theme'
import { Header1, Paragraph } from '../components/Typography'
import { ItemType, FeatureType, Item, RenderingStrategy } from '../interfaces'
import { Uuid } from '@typed/uuid'
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
} from '../components/styled/FilteredItemList'
import { connect } from 'react-redux'
import Button from '../components/Button'
import Tooltip from '../components/Tooltip'
import { deleteItem } from '../actions/item'
import {
    getFilteredItems,
    getCompletedItems,
    getUncompletedItems,
} from '../selectors/item'
import { components } from 'react-select'
import { sortIcon } from '../assets/icons'
import ReorderableItemList from '../components/ReorderableItemList'
import { convertItemToItemType } from '../utils'
import { ItemIcons } from '../components/Item'

const DropdownIndicator = (props): ReactElement => {
    return (
        <components.DropdownIndicator {...props}>
            {sortIcon()}
        </components.DropdownIndicator>
    )
}

const sortItems = (
    items: ItemType[],
    criteria: SortCriteriaEnum,
): ItemType[] => {
    switch (criteria) {
        case 'STATUS':
            return orderBy(items, [(i) => i.completed], 'asc')
        case 'DUE_ASC':
            return orderBy(items, [(i) => new Date(i.dueDate)], 'asc')
        case 'DUE_DESC':
            return orderBy(items, [(i) => new Date(i.dueDate)], 'desc')
        case 'SCHEDULED_ASC':
            return orderBy(items, [(i) => new Date(i.scheduledDate)], 'asc')
        case 'SCHEDULED_DESC':
            return orderBy(items, [(i) => new Date(i.scheduledDate)], 'desc')
        default:
            return items
    }
}

const options = [
    { value: 'DUE_DESC', label: 'Due Desc' },
    { value: 'DUE_ASC', label: 'Due️ Asc' },
    { value: 'SCHEDULED_ASC', label: 'Scheduled Asc️' },
    { value: 'SCHEDULED_DESC', label: 'Scheduled Desc' },
    { value: 'STATUS', label: 'Completed' },
]

export enum FilterEnum {
    ShowAll = 'SHOW_ALL',
    ShowDeleted = 'SHOW_DELETED',
    ShowInbox = 'SHOW_INBOX',
    ShowCompleted = 'SHOW_COMPLETED',
    ShowScheduled = 'SHOW_SCHEDULED',
    ShowScheduledOnDay = 'SHOW_SCHEDULED_ON_DAY',
    ShowDueOnDay = 'SHOW_DUE_ON_DAY',
    ShowNotScheduled = 'SHOW_NOT_SCHEDULED',
    ShowFromProjectByType = 'SHOW_FROM_PROJECT_BY_TYPE',
    ShowOverdue = 'SHOW_OVERDUE',
}

interface FilterParamsType {
    dueDate?: Date
    scheduledDate?: Date
    projectId?: Uuid
    type?: 'TODO' | 'NOTE'
}

export enum SortCriteriaEnum {
    Status = 'STATUS',
    DueAsc = 'DUE_ASC',
    DueDesc = 'DUE_DESC',
    ScheduledAsc = 'SCHEDULED_ASC',
    ScheduledDesc = 'SCHEDULED_DESC',
}

const determineVisibilityRules = (
    filter: FilterType,
    isFilterable: boolean,
    hideItemList: boolean,
    items: ItemType[],
    sortedItems: ItemType[],
    completedItems: ItemType[],
    dragAndDropEnabled: boolean,
): {
    showCompletedToggle: boolean
    showFilterBar: boolean
    showDeleteButton: boolean
    showSortButton: boolean
} => {
    const f = filter.type == 'default' ? filter.filter : null
    const hideCompletedToggle =
        f == FilterEnum.ShowOverdue ||
        f == FilterEnum.ShowNotScheduled ||
        f == FilterEnum.ShowCompleted
    const showCompletedToggle =
        Object.keys(completedItems).length > 0 && !hideCompletedToggle
    const showFilterBar =
        isFilterable && Object.keys(items).length > 0 && !hideItemList
    const showDeleteButton =
        Object.keys(completedItems).length > 0 && !hideItemList
    const showSortButton =
        Object.keys(sortedItems).length > 1 &&
        !hideItemList &&
        !dragAndDropEnabled
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
}

type FilterType =
    | {
          type: 'default'
          filter: FilterEnum
          params?: FilterParamsType
      }
    | {
          type: 'custom'
          filter: (input: ItemType) => boolean
          params?: {}
      }

interface OwnProps {
    filter: FilterType
    hideIcons: ItemIcons[]
    isFilterable?: boolean
    listName?: string
    renderingStrategy?: RenderingStrategy
    defaultSortOrder?: SortCriteriaEnum
    noIndentOnSubtasks?: boolean
}
type FilteredItemListProps = StateProps & DispatchProps & OwnProps

function FilteredItemList(props: FilteredItemListProps): ReactElement {
    const [sortCriteria, setSortCriteria] = useState(SortCriteriaEnum.DueDesc)
    const [hideCompleted, setHideCompleted] = useState(false)
    const [hideItemList, setHideItemList] = useState(
        Object.keys(props.items).length == 0,
    )

    // TODO: Unsure if this should be done in state
    const allItems = props.items
    const completedItems = props.completedItems
    const sortedItems = hideCompleted
        ? sortItems(convertItemToItemType(props.uncompletedItems), sortCriteria)
        : sortItems(convertItemToItemType(allItems), sortCriteria)

    const visibility = determineVisibilityRules(
        props.filter,
        props.isFilterable,
        hideItemList,
        convertItemToItemType(props.items),
        sortedItems,
        convertItemToItemType(completedItems),
        props.features.dragAndDrop,
    )
    const sortedItemsLength = Object.keys(sortedItems).length
    return (
        <Container>
            <HeaderBar>
                <ListName>
                    <Button
                        type="default"
                        icon={'expand'}
                        rotate={hideItemList == true ? 1 : 0}
                        onClick={() => setHideItemList(!hideItemList)}
                    ></Button>
                    <Header1>
                        {props.listName}
                        <Paragraph>
                            {sortedItemsLength +
                                (sortedItemsLength == 1 ? ' item' : ' items')}
                        </Paragraph>
                    </Header1>
                </ListName>
                {visibility.showFilterBar && (
                    <FilterBar>
                        <CompletedContainer
                            visible={visibility.showCompletedToggle}
                        >
                            <Button
                                dataFor="complete-button"
                                iconSize="18px"
                                type="default"
                                spacing="compact"
                                icon={hideCompleted ? 'hide' : 'show'}
                                onClick={() => {
                                    setHideCompleted(!hideCompleted)
                                }}
                            ></Button>
                            <Tooltip
                                id="complete-button"
                                text={'Toggle completed items'}
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
                                            convertItemToItemType(
                                                props.completedItems,
                                            ),
                                        )
                                    }}
                                ></Button>
                                <Tooltip
                                    id="trash-button"
                                    text={'Delete completed items'}
                                />
                            </DeleteContainer>
                        )}
                        {visibility.showSortButton && (
                            <SortContainer>
                                <SortSelect
                                    options={options}
                                    defaultOption={options[0]}
                                    autoFocus={false}
                                    placeholder="Sort"
                                    components={{ DropdownIndicator }}
                                    styles={{
                                        ...selectStyles({
                                            fontSize: 'xxsmall',
                                            theme: themes[props.theme],
                                            showDropdownIndicator: true,
                                        }),
                                    }}
                                    onChange={(e) => {
                                        setSortCriteria(e.value)
                                    }}
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
                            hideIcons={props.hideIcons}
                            items={sortedItems}
                            renderingStrategy={props.renderingStrategy}
                        />
                    ) : (
                        <ItemList
                            hideIcons={props.hideIcons}
                            items={sortedItems}
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
