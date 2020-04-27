import React, { ReactElement, useState } from 'react'
import ItemList, { RenderingStrategy } from '../components/ItemList'
import { orderBy } from 'lodash'
import {
    selectStyles,
    sortControlStyles,
    sortPlaceholderStyles,
} from '../theme'
import { Header1, Paragraph } from '../components/Typography'
import { ItemType } from '../interfaces'
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
    SortIcon,
} from '../components/styled/FilteredItemList'
import { connect } from 'react-redux'
import { Button } from '../components/Button'
import { Tooltip } from '../components/Tooltip'
import { deleteItem } from '../actions/item'
import { sortIcon } from '../assets/icons'
import {
    getFilteredItems,
    getCompletedItems,
    getUncompletedItems,
} from '../selectors/item'

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

export enum SortCriteriaEnum {
    Status = 'STATUS',
    DueAsc = 'DUE_ASC',
    DueDesc = 'DUE_DESC',
    ScheduledAsc = 'SCHEDULED_ASC',
    ScheduledDesc = 'SCHEDULED_DESC',
}

interface FilterParamsType {
    dueDate?: Date
    scheduledDate?: Date
    projectId?: Uuid
    type?: 'TODO' | 'NOTE'
}

interface StateProps {
    items: ItemType[]
    completedItems: ItemType[]
    uncompletedItems: ItemType[]
}

interface DispatchProps {
    deleteCompletedItems: (completedItems: ItemType[]) => void
}

interface OwnProps {
    showProject: boolean
    listName?: string
    filter: FilterEnum
    filterParams?: FilterParamsType
    isFilterable?: boolean
    renderingStrategy?: RenderingStrategy
    defaultSortOrder?: SortCriteriaEnum
    noIndentOnSubtasks?: boolean
}
type FilteredItemListProps = StateProps & DispatchProps & OwnProps

function FilteredItemList(props: FilteredItemListProps): ReactElement {
    const [sortCriteria, setSortCriteria] = useState(SortCriteriaEnum.DueDesc)
    const [hideCompleted, setHideCompleted] = useState(false)
    const [hideItemList, setHideItemList] = useState(false)

    // TODO: Unsure if this should be done in state
    const allItems = props.items
    const completedItems = props.completedItems
    const sortedItems = hideCompleted
        ? sortItems(props.uncompletedItems, sortCriteria)
        : sortItems(allItems, sortCriteria)

    // NOTE: For some filters where we're not showing completed items, we want to not show that option
    const hideCompletedToggle =
        props.filter == FilterEnum.ShowOverdue ||
        props.filter == FilterEnum.ShowNotScheduled ||
        props.filter == FilterEnum.ShowCompleted
    return (
        <Container>
            <HeaderBar>
                <ListName>
                    <Header1>
                        {props.listName}
                        <Paragraph>
                            {sortedItems.length +
                                (sortedItems.length == 1 ? ' item' : ' items')}
                        </Paragraph>
                    </Header1>
                    <Button
                        type="default"
                        width="24px"
                        height="24px"
                        icon={hideItemList ? 'expand' : 'collapse'}
                        onClick={() => setHideItemList(!hideItemList)}
                    ></Button>
                </ListName>
                {props.isFilterable && !hideItemList && allItems.length > 0 && (
                    <FilterBar>
                        <CompletedContainer
                            visible={
                                completedItems.length > 0 &&
                                !hideCompletedToggle
                            }
                        >
                            <Button
                                dataFor="complete-button"
                                spacing="compact"
                                type="default"
                                iconSize="20px"
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
                        {completedItems.length > 0 && !hideItemList && (
                            <DeleteContainer>
                                <Button
                                    dataFor="trash-button"
                                    spacing="compact"
                                    iconSize="20px"
                                    type="default"
                                    icon="trash_sweep"
                                    onClick={() => {
                                        props.deleteCompletedItems(
                                            props.completedItems,
                                        )
                                    }}
                                ></Button>
                                <Tooltip
                                    id="trash-button"
                                    text={'Delete completed items'}
                                />
                            </DeleteContainer>
                        )}
                        {sortedItems.length > 1 && !hideItemList && (
                            <SortContainer>
                                <SortIcon>{sortIcon()}</SortIcon>
                                <SortSelect
                                    options={options}
                                    defaultOption={options[0]}
                                    autoFocus={false}
                                    placeholder="Sort"
                                    styles={{
                                        ...selectStyles,
                                        placeholder: sortPlaceholderStyles,
                                        control: sortControlStyles,
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
                    <ItemList
                        showProject={props.showProject}
                        items={sortedItems}
                        renderingStrategy={props.renderingStrategy}
                    />
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
    }
}
const mapDispatchToProps = (dispatch): DispatchProps => ({
    // TODO: Move this to the reducer and create a new action
    deleteCompletedItems: (completedItems) => {
        completedItems.map((c) => {
            if (c.parentId == null) {
                dispatch(deleteItem(c.id))
            }
        })
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(FilteredItemList)
