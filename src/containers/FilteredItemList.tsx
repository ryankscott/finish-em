import React, { ReactElement, useState } from 'react'
import ItemList, { RenderingStrategy } from '../components/ItemList'
import {
    endOfDay,
    isSameDay,
    isAfter,
    isPast,
    parseISO,
    isValid,
} from 'date-fns'
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
import { getItemById } from '../utils'

/*
If compareFunction(a, b) returns less than 0, sort a to an index lower than b (i.e. a comes first).
If compareFunction(a, b) returns greater than 0, sort b to an index lower than a (i.e. b comes first).
If compareFunction(a, b) returns 0, leave a and b unchanged with respect to each other, but sorted with respect to all different elements. Note: the ECMAscript standard does not guarantee this behavior, thus, not all browsers (e.g. Mozilla versions dating back to at least 2003) respect this.
compareFunction(a, b) must always return the same value when given a specific pair of elements a and b as its two arguments. If inconsistent results are returned, then the sort order is undefined.
*/

const comparators = {
    STATUS: (a: ItemType, b: ItemType) => {
        if (a.completed == true && b.completed == false) {
            return 1
        } else if (a.completed == false && b.completed == true) {
            return -1
        }
        return 0
    },
    DUE_DESC: (a: ItemType, b: ItemType) => {
        const dueDateA = parseISO(a.dueDate)
        const dueDateB = parseISO(b.dueDate)
        if (!isValid(dueDateA)) {
            return 1
        } else if (!isValid(dueDateB)) {
            return -1
        } else if (isAfter(dueDateA, dueDateB)) {
            return 1
        } else if (isAfter(dueDateB, dueDateA)) {
            return -1
        }
        return 0
    },
    DUE_ASC: (a: ItemType, b: ItemType) => {
        const dueDateA = parseISO(a.dueDate)
        const dueDateB = parseISO(b.dueDate)
        if (!isValid(dueDateA)) {
            return 1
        } else if (!isValid(dueDateB)) {
            return -1
        } else if (isAfter(dueDateA, dueDateB)) {
            return -1
        } else if (isAfter(dueDateB, dueDateA)) {
            return 1
        }
        return 0
    },
    SCHEDULED_DESC: (a: ItemType, b: ItemType) => {
        const scheduledDateA = parseISO(a.scheduledDate)
        const scheduledDateB = parseISO(b.scheduledDate)
        if (!isValid(scheduledDateA)) {
            return 1
        } else if (!isValid(scheduledDateB)) {
            return -1
        } else if (isAfter(scheduledDateA, scheduledDateB)) {
            return 1
        } else if (isAfter(scheduledDateB, scheduledDateA)) {
            return -1
        }
        return 0
    },
    SCHEDULED_ASC: (a: ItemType, b: ItemType) => {
        const scheduledDateA = parseISO(a.scheduledDate)
        const scheduledDateB = parseISO(b.scheduledDate)
        if (!isValid(scheduledDateA)) {
            return 1
        } else if (!isValid(scheduledDateB)) {
            return -1
        } else if (isAfter(scheduledDateA, scheduledDateB)) {
            return -1
        } else if (isAfter(scheduledDateB, scheduledDateA)) {
            return 1
        }
        return 0
    },
}

const sortItems = (
    items: ItemType[],
    criteria: SortCriteriaEnum,
): ItemType[] => {
    switch (criteria) {
        case 'STATUS':
            return items.sort(comparators.STATUS)
        case 'DUE_ASC':
            return items.sort(comparators.DUE_ASC)
        case 'DUE_DESC':
            return items.sort(comparators.DUE_DESC)
        case 'SCHEDULED_ASC':
            return items.sort(comparators.SCHEDULED_ASC)
        case 'SCHEDULED_DESC':
            return items.sort(comparators.SCHEDULED_DESC)
        default:
            return items
    }
}

const filterItems = (
    items: ItemType[],
    filter: FilterEnum,
    params?: FilterParamsType,
): ItemType[] => {
    switch (filter) {
        case 'SHOW_ALL':
            return items
        case 'SHOW_DELETED':
            return items.filter((i) => i.deleted == true)
        case 'SHOW_INBOX':
            return items.filter(
                (i) => i.projectId == null && i.deleted == false,
            )
        case 'SHOW_COMPLETED':
            return items.filter(
                (i) => i.completed == true && i.deleted == false,
            )
        case 'SHOW_SCHEDULED':
            return items.filter(
                (i) => i.scheduledDate != null && i.deleted == false,
            )
        case 'SHOW_DUE_ON_DAY':
            return items.filter(
                (i) =>
                    isSameDay(parseISO(i.dueDate), params.dueDate) &&
                    i.deleted == false,
            )
        case 'SHOW_SCHEDULED_ON_DAY':
            return items.filter(
                (i) =>
                    isSameDay(
                        parseISO(i.scheduledDate),
                        params.scheduledDate,
                    ) && i.deleted == false,
            )
        case 'SHOW_NOT_SCHEDULED':
            return items.filter(
                (i) =>
                    i.type == 'TODO' &&
                    i.scheduledDate == null &&
                    i.deleted == false &&
                    i.completed == false,
            )
        case 'SHOW_FROM_PROJECT_BY_TYPE':
            return items.filter(
                (i) =>
                    i.projectId == params.projectId &&
                    i.type == params.type &&
                    i.deleted == false,
            )
        case 'SHOW_OVERDUE':
            return items.filter((i) => {
                return (
                    (isPast(endOfDay(parseISO(i.scheduledDate))) ||
                        isPast(endOfDay(parseISO(i.dueDate)))) &&
                    i.deleted == false &&
                    i.completed == false
                )
            })
        default:
            throw new Error('Unknown filter: ' + filter)
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

interface FilteredItemListProps {
    items: ItemType[]
    showProject: boolean
    listName?: string
    filter: FilterEnum
    filterParams?: FilterParamsType
    isFilterable?: boolean
    renderingStrategy?: RenderingStrategy
    defaultSortOrder?: SortCriteriaEnum
    noIndentOnSubtasks?: boolean
    deleteItem: (id: Uuid) => void
}

function FilteredItemList(props: FilteredItemListProps): ReactElement {
    const [sortCriteria, setSortCriteria] = useState(SortCriteriaEnum.DueDesc)
    const [hideCompleted, setHideCompleted] = useState(false)
    const [hideItemList, setHideItemList] = useState(false)

    const getFilteredItems = (): {
        completedItems: ItemType[]
        allItems: ItemType[]
        sortedItems: ItemType[]
    } => {
        const { items, filter, filterParams } = props

        const allItems = filterItems(items, filter, filterParams)
        const uncompletedItems = allItems.filter((i) => {
            return (
                (i.completed == false && i.parentId == null) ||
                (i.completed == false &&
                    i.parentId != null &&
                    getItemById(i.parentId, items).completed == false)
            )
        })
        const completedItems = allItems.filter((i) => i.completed === true)
        const sortedItems = hideCompleted
            ? sortItems(uncompletedItems, sortCriteria)
            : sortItems(allItems, sortCriteria)
        return {
            completedItems,
            allItems,
            sortedItems,
        }
    }

    const deleteCompletedItems = (): void => {
        const { completedItems } = getFilteredItems()
        completedItems.map((c) => {
            if (c.parentId == null) {
                props.deleteItem(c.id)
            }
        })
        return
    }

    // TODO: Unsure if this should be done in state
    const { completedItems, allItems, sortedItems } = getFilteredItems()

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
                                        deleteCompletedItems()
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

const mapStateToProps = (state) => ({
    items: state.items,
})
const mapDispatchToProps = (dispatch) => ({
    deleteItem: (id: Uuid) => {
        dispatch(deleteItem(id))
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(FilteredItemList)
